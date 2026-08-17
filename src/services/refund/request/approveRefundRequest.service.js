const pool = require("../../../config/pool");

const refundQueue = require("../../../queues/refund.queue");

const {
    getRefundRequestById,
    lockRefundRequest,
    approveRefundRequest
} = require("../helpers/request/refundRequest.helper");

const {
    validateRequestOwnership,
    validateApproveRequest,
    validateApprovedAmount
} = require("../helpers/request/validaiton.helper");

const {
    buildRefundRequestResponse
} = require("../helpers/request/response.helper");

const {
    createAuditLog
} = require("../helpers/common/audit.helper");

// ==========================================================
// Wallet
// ==========================================================

const debitWalletService =
    require("../../wallet/debitWallet.service");

// ==========================================================
// Fee Calculation
// ==========================================================

const feeCalculationService =require("../../fee/feeCalculation.service");


// ==========================================================
// Approve Refund Request
// ==========================================================
//
// FLOW:
//
// Refund Request
//      ↓
// Validate Request
//      ↓
// Calculate Refund Fee
//      ↓
// refund amount + fee
//      ↓
// Check Wallet
//      ↓
// Reserve TOTAL amount
//      ↓
// available_balance -= totalDebitAmount
// reserved_balance  += totalDebitAmount
//      ↓
// Approve Refund Request
//      ↓
// Audit
//      ↓
// COMMIT
//      ↓
// Queue Refund Processing
//
// Example:
//
// Refund Amount = ₹1000
// Fee           = ₹20
// Total Debit   = ₹1020
//
// Wallet:
//
// available -= ₹1020
// reserved  += ₹1020
//
// total_refunded is NOT changed here.
//
// ==========================================================


const approveRefundRequestService = async ({
    merchantId,
    requestId,
    approvedAmount,
    remarks
}) => {

    const connection =
        await pool.getConnection();


    let updatedRefundRequest;

    let feeCalculation;


    try {

        await connection.beginTransaction();


        // ==================================================
        // 1. Get Refund Request
        // ==================================================

        const refundRequest =
            await getRefundRequestById(
                connection,
                requestId
            );


        if (!refundRequest) {

            throw new Error(
                "Refund request not found."
            );

        }


        // ==================================================
        // 2. Lock Refund Request
        // ==================================================

        await lockRefundRequest(
            connection,
            refundRequest.request_id
        );


        // ==================================================
        // 3. Validate Ownership
        // ==================================================

        validateRequestOwnership(
            merchantId,
            refundRequest
        );


        // ==================================================
        // 4. Validate Refund Status
        // ==================================================

        validateApproveRequest(
            refundRequest
        );


        // ==================================================
        // 5. Validate Approved Amount
        // ==================================================

        validateApprovedAmount(
            refundRequest.requested_amount,
            approvedAmount
        );


        // ==================================================
        // 6. Normalize Approved Amount
        // ==================================================

        const amount =
            Number(approvedAmount);


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            throw new Error(
                "Invalid approved refund amount."
            );

        }


        // ==================================================
        // 7. Calculate Refund Fee
        // ==================================================
        //
        // Fee is fetched from merchant fee configuration.
        //
        // FIXED:
        //
        // refund = 1000
        // fee    = 20
        //
        // PERCENTAGE:
        //
        // refund = 1000
        // fee    = 20
        //
        // SLAB:
        //
        // refund amount determines applicable slab.
        //
        // ==================================================

        feeCalculation =
            await feeCalculationService({

                merchantId:
                    refundRequest.merchant_id,

                refundAmount:
                    amount

            });


        if (
            !feeCalculation ||
            !feeCalculation.success
        ) {

            throw new Error(
                "Unable to calculate refund fee."
            );

        }


        const feeAmount =
            Number(
                feeCalculation.feeAmount
            );


        const totalDebitAmount =
            Number(
                feeCalculation.totalDebitAmount
            );


        // ==================================================
        // 8. Validate Calculated Fee
        // ==================================================

        if (
            !Number.isFinite(feeAmount) ||
            feeAmount < 0
        ) {

            throw new Error(
                "Invalid calculated refund fee."
            );

        }


        if (
            !Number.isFinite(totalDebitAmount) ||
            totalDebitAmount <= 0
        ) {

            throw new Error(
                "Invalid total refund debit amount."
            );

        }


        // ==================================================
        // 9. Verify Total
        // ==================================================

        const expectedTotal =
            Math.round(
                (
                    amount +
                    feeAmount +
                    Number.EPSILON
                ) * 100
            ) / 100;


        if (
            Math.abs(
                totalDebitAmount -
                expectedTotal
            ) > 0.0001
        ) {

            throw new Error(
                "Refund total debit amount mismatch."
            );

        }


        // ==================================================
        // 10. Reserve Wallet
        // ==================================================
        //
        // IMPORTANT:
        //
        // Wallet checks TOTAL amount:
        //
        // refund amount + fee
        //
        // Example:
        //
        // Refund = ₹1000
        // Fee    = ₹20
        // Required balance = ₹1020
        //
        // Wallet:
        //
        // available -= ₹1020
        // reserved  += ₹1020
        //
        // ==================================================

        const walletReservation =
            await debitWalletService(
                connection,
                {

                    merchantId:
                        refundRequest.merchant_id,

                    amount,

                    feeAmount,

                    totalDebitAmount,

                    referenceId:
                        refundRequest.request_id,

                    idempotencyKey:
                        `REFUND:${refundRequest.request_id}`,

                    source:
                        "REFUND",

                    description:
                        "Refund amount and fee reserved for approved refund.",

                    metadata: {

                        requestId:
                            refundRequest.request_id,

                        transactionId:
                            refundRequest.transaction_id,

                        transactionReference:
                            refundRequest.transaction_reference,

                        approvedAmount:
                            amount,

                        refundAmount:
                            amount,

                        feeAmount,

                        totalDebitAmount,

                        feeConfigId:
                            feeCalculation.feeConfigId,

                        feeType:
                            feeCalculation.feeType,

                        feeValue:
                            feeCalculation.feeValue,

                        feeMinimum:
                            feeCalculation
                                .feeConfiguration
                                ?.minimumFee ?? null,

                        feeMaximum:
                            feeCalculation
                                .feeConfiguration
                                ?.maximumFee ?? null,

                        reservationStatus:
                            "PENDING"

                    },

                    performedBy:
                        merchantId,

                    performerType:
                        "ADMIN"

                }
            );


        if (
            !walletReservation ||
            !walletReservation.success
        ) {

            throw new Error(
                "Unable to reserve wallet amount."
            );

        }


        // ==================================================
        // 11. Approve Refund Request
        // ==================================================
        //
        // This happens only after wallet reservation succeeds.
        //
        // ==================================================

        await approveRefundRequest(
    connection,
    refundRequest.request_id,
    amount,
    feeAmount,
    totalDebitAmount,
    refundRequest.merchant_id,
    remarks
);


        // ==================================================
        // 12. Create Refund Audit
        // ==================================================

        await createAuditLog(
            connection,
            {

                requestId:
                    refundRequest.request_id,

                oldStatus:
                    refundRequest.status,

                newStatus:
                    "APPROVED",

                action:
                    "APPROVED",

                performedBy:
                    merchantId,

                performerType:
                    "ADMIN",

                remarks:
                    remarks ||
                    "Refund approved and wallet amount including fee reserved.",

                metadata: {

                    requestedAmount:
                        Number(
                            refundRequest.requested_amount
                        ),

                    approvedAmount:
                        amount,

                    refundAmount:
                        amount,

                    feeAmount,

                    totalDebitAmount,

                    feeConfigId:
                        feeCalculation.feeConfigId,

                    feeType:
                        feeCalculation.feeType,

                    feeValue:
                        feeCalculation.feeValue,

                    transactionReference:
                        refundRequest.transaction_reference,

                    walletAction:
                        "RESERVED",

                    walletStatus:
                        walletReservation.status,

                    walletLedgerId:
                        walletReservation.ledgerId,

                    walletMerchantId:
                        refundRequest.merchant_id

                }

            }
        );


        // ==================================================
        // 13. Get Updated Refund Request
        // ==================================================

        updatedRefundRequest =
            await getRefundRequestById(
                connection,
                refundRequest.request_id
            );


        if (
            !updatedRefundRequest
        ) {

            throw new Error(
                "Unable to fetch updated refund request."
            );

        }


        // ==================================================
        // 14. Commit
        // ==================================================
        //
        // These operations commit together:
        //
        // 1. Wallet reservation
        // 2. Wallet ledger
        // 3. Wallet audit
        // 4. Refund request approval
        // 5. Refund audit
        //
        // ==================================================

        await connection.commit();

    }

    catch (error) {

        // ==================================================
        // Rollback
        // ==================================================

        try {

            await connection.rollback();

        }
        catch (rollbackError) {

            console.error(
                "Refund approval rollback failed:",
                rollbackError
            );

        }


        throw error;

    }

    finally {

        connection.release();

    }


    // ======================================================
    // 15. Queue Refund Processing
    // ======================================================
    //
    // IMPORTANT:
    //
    // Queue is added ONLY after DB commit.
    //
    // Fee snapshot is passed to the processor.
    //
    // ======================================================

    try {

        await refundQueue.add(

            "process-refund",

            {

                requestId:
                    updatedRefundRequest.request_id,

                // ==========================================
                // Financial Snapshot
                // ==========================================

                refundAmount:
                    Number(
                        feeCalculation.refundAmount
                    ),

                feeAmount:
                    Number(
                        feeCalculation.feeAmount
                    ),

                totalDebitAmount:
                    Number(
                        feeCalculation.totalDebitAmount
                    ),

                feeConfigId:
                    feeCalculation.feeConfigId,

                feeType:
                    feeCalculation.feeType,

                feeValue:
                    feeCalculation.feeValue

            },

            {

                attempts: 3,

                backoff: {

                    type: "exponential",

                    delay: 5000

                },

                removeOnComplete: true,

                removeOnFail: false

            }

        );

    }

    catch (queueError) {

        // ==================================================
        // IMPORTANT
        // ==================================================
        //
        // DB transaction is already committed.
        //
        // DO NOT rollback wallet here.
        //
        // Refund is already approved and money is reserved.
        //
        // Queue recovery/retry mechanism must handle
        // this situation.
        //
        // ==================================================

        console.error(
            "Failed to enqueue refund processing job:",
            queueError
        );


        throw queueError;

    }


    // ======================================================
    // 16. Response
    // ======================================================

    return {

        ...buildRefundRequestResponse(
            updatedRefundRequest
        ),

        fee: {

            amount:
                Number(
                    feeCalculation.feeAmount
                ),

            type:
                feeCalculation.feeType,

            value:
                feeCalculation.feeValue

        },

        wallet: {

            reservedAmount:
                Number(
                    feeCalculation.totalDebitAmount
                )

        }

    };

};


// ==========================================================
// Export
// ==========================================================

module.exports =
    approveRefundRequestService;