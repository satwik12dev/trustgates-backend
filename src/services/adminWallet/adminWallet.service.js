const {
    lockAdminWallet
} = require("./helpers/adminWalletLock.helpers");

const {
    createAdminLedgerEntry,
    getAdminLedgerByIdempotencyKey
} = require("./helpers/adminWalletLedger.helper");

const creditAdminWalletService = async (

    connection,

    {

        merchantId,

        refundId = null,

        amount,

        referenceType = "REFUND",

        referenceId,

        idempotencyKey,

        description =
            "Refund processing fee credited to admin wallet.",

        metadata = {}

    }

) => {


    // ======================================================
    // 1. Validate Merchant
    // ======================================================

    if (
        !merchantId
    ) {

        throw new Error(
            "Merchant ID is required for admin wallet credit."
        );

    }


    // ======================================================
    // 2. Validate Amount
    // ======================================================

    const creditAmount =
        Number(amount);


    if (
        !Number.isFinite(creditAmount) ||
        creditAmount <= 0
    ) {

        throw new Error(
            "Invalid admin wallet credit amount."
        );

    }


    // ======================================================
    // 3. Validate Reference
    // ======================================================

    if (

        referenceId === undefined ||

        referenceId === null ||

        String(referenceId).trim() === ""

    ) {

        throw new Error(
            "Admin wallet reference ID is required."
        );

    }


    // ======================================================
    // 4. Validate Idempotency
    // ======================================================

    if (

        !idempotencyKey ||

        typeof idempotencyKey !== "string" ||

        !idempotencyKey.trim()

    ) {

        throw new Error(
            "Admin wallet idempotency key is required."
        );

    }


    const normalizedIdempotencyKey =
        idempotencyKey.trim();


    // ======================================================
    // 5. Duplicate Check
    // ======================================================

    const existingLedger =
        await getAdminLedgerByIdempotencyKey(

            connection,

            normalizedIdempotencyKey

        );


    if (
        existingLedger
    ) {

        return {

            success: true,

            duplicate: true,

            adminWalletTransactionId:
                existingLedger
                    .admin_wallet_transaction_id,

            adminWalletId:
                existingLedger
                    .admin_wallet_id,

            merchantId:
                existingLedger
                    .merchant_id,

            refundId:
                existingLedger
                    .refund_id,

            amount:
                Number(
                    existingLedger
                        .total_amount
                ),

            balanceBefore:
                Number(
                    existingLedger
                        .balance_before
                ),

            balanceAfter:
                Number(
                    existingLedger
                        .balance_after
                ),

            status:
                existingLedger.status

        };

    }


    // ======================================================
    // 6. Lock Admin Wallet
    // ======================================================

    const adminWallet =
        await lockAdminWallet(

            connection

        );


    if (
        !adminWallet
    ) {

        throw new Error(
            "Active admin wallet not found."
        );

    }


    // ======================================================
    // 7. Validate Admin Wallet
    // ======================================================

    if (
        adminWallet.status !== "ACTIVE"
    ) {

        throw new Error(
            "Admin wallet is not active."
        );

    }


    // ======================================================
    // 8. Balance Calculation
    // ======================================================

    const balanceBefore =
        Number(
            adminWallet.balance
        );


    const balanceAfter =
        balanceBefore +
        creditAmount;


    // ======================================================
    // 9. Update Admin Wallet
    // ======================================================

    const [

        walletUpdateResult

    ] = await connection.query(

        `

        UPDATE admin_wallets

        SET

            balance = ?,
            updated_at = NOW()

        WHERE admin_wallet_id = ?

          AND status = 'ACTIVE'

        `,

        [

            balanceAfter,

            adminWallet.admin_wallet_id

        ]

    );


    if (
        walletUpdateResult.affectedRows !== 1
    ) {

        throw new Error(
            "Failed to credit admin wallet."
        );

    }


    // ======================================================
    // 10. Create Admin Wallet Ledger
    // ======================================================

    const transactionId =
        await createAdminLedgerEntry(

            connection,

            {

                adminWalletId:
                    adminWallet
                        .admin_wallet_id,

                merchantId,

                refundId,

                transactionType:
                    "CREDIT",

                source:
                    "FEE",

                amount:
                    creditAmount,

                feeAmount:
                    0,

                totalAmount:
                    creditAmount,

                balanceBefore,

                balanceAfter,

                referenceType,

                referenceId,

                idempotencyKey:
                    normalizedIdempotencyKey,

                status:
                    "COMPLETED",

                description,

                metadata: {

                    ...metadata,

                    merchantId,

                    refundId,

                    feeAmount:
                        creditAmount,

                    balanceBefore,

                    balanceAfter,

                    transaction:
                        "ADMIN_FEE_CREDIT"

                }

            }

        );


    // ======================================================
    // 11. Return
    // ======================================================

    return {

        success: true,

        duplicate: false,

        adminWalletTransactionId:
            transactionId,

        adminWalletId:
            adminWallet
                .admin_wallet_id,

        merchantId,

        refundId,

        amount:
            creditAmount,

        balance: {

            before:
                balanceBefore,

            after:
                balanceAfter

        },

        status:
            "COMPLETED"

    };

};


module.exports =
    creditAdminWalletService;