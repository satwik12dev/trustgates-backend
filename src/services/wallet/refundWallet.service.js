const {
    lockWalletByMerchant
} = require("./helpers/walletLock.helper");


const {
    getLedgerByIdempotencyKey
} = require("./helpers/walletLedger.helper");


const {
    createWalletAuditLog
} = require("./helpers/walletAudit.helper");


const creditAdminWalletService =
    require("../adminWallet/adminWallet.service");


const WALLET_QUERIES =
    require("../../queries/wallet/wallet.query");


const WALLET_LEDGER_QUERIES =
    require("../../queries/wallet/walletLedger.query");


const {
    WALLET_LEDGER_STATUS,
    WALLET_PERFORMER_TYPE
} = require("../../constants/wallet.constants");


// ==========================================================
// Refund Wallet Success Service
// ==========================================================
//
// Called when refund is successfully processed.
//
// BEFORE:
//
// available_balance = already reduced
// reserved_balance  = refund + fee
//
// SUCCESS:
//
// reserved_balance -= totalDebit
// total_refunded   += refundAmount
//
// ADMIN:
//
// admin_wallet.balance += refundFee
//
// IMPORTANT:
//
// Merchant wallet completion and Admin wallet credit
// MUST execute inside the SAME DB TRANSACTION.
//
// ==========================================================

const refundWalletService = async (

    connection,

    {

        merchantId,

        amount,

        feeAmount = 0,

        totalDebitAmount,

        referenceId,

        idempotencyKey,

        razorpayRefundId = null,

        description =
            "Refund successfully processed.",

        metadata = {}

    }

) => {


    // ======================================================
    // 1. Validate Inputs
    // ======================================================

    const refundAmount =
        Number(amount);


    const refundFee =
        Number(feeAmount);


    const totalDebit =

        totalDebitAmount !== undefined &&

        totalDebitAmount !== null

            ? Number(totalDebitAmount)

            : refundAmount + refundFee;


    if (

        !Number.isFinite(refundAmount) ||

        refundAmount <= 0

    ) {

        throw new Error(
            "Invalid refund amount."
        );

    }


    if (

        !Number.isFinite(refundFee) ||

        refundFee < 0

    ) {

        throw new Error(
            "Invalid refund fee."
        );

    }


    if (

        !Number.isFinite(totalDebit) ||

        totalDebit <= 0

    ) {

        throw new Error(
            "Invalid total refund debit amount."
        );

    }


    const expectedTotal =
        refundAmount + refundFee;


    if (

        Math.abs(
            totalDebit - expectedTotal
        ) > 0.0001

    ) {

        throw new Error(
            "Total refund debit must equal refund amount + fee."
        );

    }


    if (
        !merchantId
    ) {

        throw new Error(
            "Merchant ID is required."
        );

    }


    if (
        !referenceId
    ) {

        throw new Error(
            "Refund reference ID is required."
        );

    }


    if (

        !idempotencyKey ||

        typeof idempotencyKey !== "string" ||

        !idempotencyKey.trim()

    ) {

        throw new Error(
            "Refund idempotency key is required."
        );

    }


    const normalizedIdempotencyKey =
        idempotencyKey.trim();


    // ======================================================
    // 2. Merchant Wallet Idempotency Check
    // ======================================================

    const existingLedger =
        await getLedgerByIdempotencyKey(

            connection,

            normalizedIdempotencyKey

        );


    if (
        existingLedger
    ) {

        return {

            success: true,

            duplicate: true,

            ledgerId:
                existingLedger
                    .wallet_transaction_id,

            walletId:
                existingLedger
                    .wallet_id,

            merchantId,

            refundAmount,

            feeAmount:
                refundFee,

            totalDebitAmount:
                totalDebit,

            status:
                existingLedger.status

        };

    }


    // ======================================================
    // 3. Lock Merchant Wallet
    // ======================================================

    const wallet =
        await lockWalletByMerchant(

            connection,

            merchantId

        );


    if (
        !wallet
    ) {

        throw new Error(
            "Merchant wallet not found."
        );

    }


    // ======================================================
    // 4. Validate Merchant Wallet
    // ======================================================

    if (
        wallet.wallet_status !== "ACTIVE"
    ) {

        throw new Error(
            "Merchant wallet is not active."
        );

    }


    // ======================================================
    // 5. Get Existing Refund Ledger
    // ======================================================

    const [

        ledgerRows

    ] = await connection.query(

        WALLET_LEDGER_QUERIES
            .GET_BY_REFERENCE,

        [

            "REFUND",

            referenceId

        ]

    );


    if (
        !ledgerRows.length
    ) {

        throw new Error(
            "Refund wallet ledger not found."
        );

    }


    const refundLedger =
        ledgerRows.find(

            ledger =>

                Number(
                    ledger.merchant_id
                ) === Number(
                    merchantId
                ) &&

                ledger.status ===
                    WALLET_LEDGER_STATUS.PENDING

        );


    // ======================================================
    // 6. Handle Already Completed Merchant Ledger
    // ======================================================

    if (
        !refundLedger
    ) {

        const merchantLedger =
            ledgerRows.find(

                ledger =>

                    Number(
                        ledger.merchant_id
                    ) === Number(
                        merchantId
                    )

            );


        if (

            merchantLedger &&

            merchantLedger.status ===
                WALLET_LEDGER_STATUS.COMPLETED

        ) {

            // ----------------------------------------------
            // Merchant wallet already completed.
            //
            // Admin fee should already have been credited
            // in the same transaction.
            //
            // We return duplicate here.
            // ----------------------------------------------

            return {

                success: true,

                duplicate: true,

                ledgerId:
                    merchantLedger
                        .wallet_transaction_id,

                walletId:
                    merchantLedger
                        .wallet_id,

                merchantId,

                refundAmount,

                feeAmount:
                    refundFee,

                totalDebitAmount:
                    totalDebit,

                status:
                    "COMPLETED"

            };

        }


        throw new Error(
            "Pending refund wallet ledger not found."
        );

    }


    // ======================================================
    // 7. Validate Ledger Amounts
    // ======================================================

    const ledgerAmount =
        Number(
            refundLedger.amount
        );


    const ledgerFee =
        Number(
            refundLedger.fee_amount
        );


    const ledgerTotal =
        Number(
            refundLedger.total_amount
        );


    if (

        Math.abs(
            ledgerAmount - refundAmount
        ) > 0.0001

    ) {

        throw new Error(
            "Refund amount does not match wallet ledger."
        );

    }


    if (

        Math.abs(
            ledgerFee - refundFee
        ) > 0.0001

    ) {

        throw new Error(
            "Refund fee does not match wallet ledger."
        );

    }


    if (

        Math.abs(
            ledgerTotal - totalDebit
        ) > 0.0001

    ) {

        throw new Error(
            "Refund total debit does not match wallet ledger."
        );

    }


    // ======================================================
    // 8. Validate Reserved Balance
    // ======================================================

    if (

        Number(wallet.reserved_balance) <

        totalDebit

    ) {

        throw new Error(
            "Insufficient reserved balance for refund completion."
        );

    }


    // ======================================================
    // 9. Capture Balance Before
    // ======================================================

    const reservedBefore =
        Number(
            wallet.reserved_balance
        );


    const totalRefundedBefore =
        Number(
            wallet.total_refunded
        );


    const reservedAfter =
        reservedBefore -
        totalDebit;


    const totalRefundedAfter =
        totalRefundedBefore +
        refundAmount;


    // ======================================================
    // 10. Complete Refund In Merchant Wallet
    // ======================================================

    const [

        walletUpdateResult

    ] = await connection.query(

        WALLET_QUERIES
            .COMPLETE_REFUND,

        [

            totalDebit,

            refundAmount,

            merchantId,

            totalDebit

        ]

    );


    if (

        walletUpdateResult
            .affectedRows !== 1

    ) {

        throw new Error(
            "Failed to complete refund in merchant wallet."
        );

    }


    // ======================================================
    // 11. Mark Merchant Ledger COMPLETED
    // ======================================================

    const [

        ledgerUpdateResult

    ] = await connection.query(

        WALLET_LEDGER_QUERIES
            .MARK_COMPLETED,

        [

            refundLedger
                .wallet_transaction_id

        ]

    );


    if (

        ledgerUpdateResult
            .affectedRows !== 1

    ) {

        throw new Error(
            "Failed to complete refund wallet ledger."
        );

    }


    // ======================================================
    // 12. Credit Admin Wallet
    // ======================================================
    //
    // Only fee is admin revenue.
    //
    // Refund ₹1000
    // Fee    ₹20
    //
    // Admin gets ₹20.
    //
    // ======================================================

    let adminWalletResult = null;


    if (
        refundFee > 0
    ) {

        const adminWalletIdempotencyKey =
            `ADMIN_REFUND_FEE_${referenceId}`;


        adminWalletResult =
            await creditAdminWalletService(

                connection,

                {

                    merchantId,

                    refundId:
                        referenceId,

                    amount:
                        refundFee,

                    referenceType:
                        "REFUND",

                    referenceId,

                    idempotencyKey:
                        adminWalletIdempotencyKey,

                    description:
                        `Refund processing fee earned from merchant ${merchantId}.`,

                    metadata: {

                        razorpayRefundId,

                        refundAmount,

                        feeAmount:
                            refundFee,

                        totalDebitAmount:
                            totalDebit,

                        merchantWalletLedgerId:
                            refundLedger
                                .wallet_transaction_id

                    }

                }

            );

    }


    // ======================================================
    // 13. Merchant Wallet Audit Log
    // ======================================================

    await createWalletAuditLog(

        connection,

        {

            walletId:
                wallet.wallet_id,

            merchantId,

            action:
                "REFUND_WALLET_COMPLETED",

            amount:
                refundAmount,

            performerType:
                WALLET_PERFORMER_TYPE.SYSTEM,

            remarks:
                description,

            metadata: {

                referenceId,

                idempotencyKey,

                razorpayRefundId,

                refundAmount,

                feeAmount:
                    refundFee,

                totalDebitAmount:
                    totalDebit,

                reservedBefore,

                reservedAfter,

                totalRefundedBefore,

                totalRefundedAfter,

                ledgerId:
                    refundLedger
                        .wallet_transaction_id,

                adminWalletTransactionId:
                    adminWalletResult
                        ?.adminWalletTransactionId || null

            }

        }

    );


    // ======================================================
    // 14. Return
    // ======================================================

    return {

        success: true,

        duplicate: false,

        walletId:
            wallet.wallet_id,

        merchantId,

        ledgerId:
            refundLedger
                .wallet_transaction_id,

        refundAmount,

        feeAmount:
            refundFee,

        totalDebitAmount:
            totalDebit,

        adminWallet: {

            credited:
                refundFee > 0,

            amount:
                refundFee,

            transactionId:
                adminWalletResult
                    ?.adminWalletTransactionId || null,

            duplicate:
                adminWalletResult
                    ?.duplicate || false

        },

        balance: {

            reservedBefore,

            reservedAfter,

            totalRefundedBefore,

            totalRefundedAfter

        },

        status:
            "COMPLETED"

    };

};


module.exports =
    refundWalletService;