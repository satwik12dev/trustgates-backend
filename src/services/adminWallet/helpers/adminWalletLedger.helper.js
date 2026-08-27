const ADMIN_WALLET_LEDGER_QUERIES = {

    // ======================================================
    // Create Ledger
    // ======================================================

    CREATE: `

        INSERT INTO admin_wallet_transactions (

            admin_wallet_id,
            merchant_id,
            refund_id,

            transaction_type,
            source,

            amount,
            fee_amount,
            total_amount,

            balance_before,
            balance_after,

            reference_type,
            reference_id,

            idempotency_key,

            status,

            description,
            metadata

        )

        VALUES (

            ?, ?, ?,
            ?, ?,
            ?, ?, ?,
            ?, ?,
            ?, ?,
            ?,
            ?,
            ?,
            ?

        )

    `,


    // ======================================================
    // Get By Idempotency Key
    // ======================================================

    GET_BY_IDEMPOTENCY_KEY: `

        SELECT

            admin_wallet_transaction_id,
            admin_wallet_id,
            merchant_id,
            refund_id,

            transaction_type,
            source,

            amount,
            fee_amount,
            total_amount,

            balance_before,
            balance_after,

            reference_type,
            reference_id,

            idempotency_key,

            status,

            description,
            metadata,

            created_at,
            updated_at

        FROM admin_wallet_transactions

        WHERE idempotency_key = ?

        LIMIT 1

        FOR UPDATE

    `

};


// ==========================================================
// Get Admin Ledger By Idempotency Key
// ==========================================================

const getAdminLedgerByIdempotencyKey = async (

    connection,

    idempotencyKey

) => {

    const [
        rows
    ] = await connection.query(

        ADMIN_WALLET_LEDGER_QUERIES
            .GET_BY_IDEMPOTENCY_KEY,

        [
            idempotencyKey
        ]

    );


    return rows.length
        ? rows[0]
        : null;

};


// ==========================================================
// Create Admin Ledger Entry
// ==========================================================

const createAdminLedgerEntry = async (

    connection,

    {

        adminWalletId,

        merchantId,

        refundId = null,

        transactionType,

        source,

        amount,

        feeAmount = 0,

        totalAmount,

        balanceBefore,

        balanceAfter,

        referenceType,

        referenceId,

        idempotencyKey,

        status = "COMPLETED",

        description = null,

        metadata = {}

    }

) => {

    const [
        result
    ] = await connection.query(

        ADMIN_WALLET_LEDGER_QUERIES.CREATE,

        [

            adminWalletId,

            merchantId,

            refundId,

            transactionType,

            source,

            Number(amount),

            Number(feeAmount),

            Number(totalAmount),

            Number(balanceBefore),

            Number(balanceAfter),

            referenceType,

            String(referenceId),

            idempotencyKey,

            status,

            description,

            JSON.stringify(metadata)

        ]

    );


    return result.insertId;

};


module.exports = {

    createAdminLedgerEntry,

    getAdminLedgerByIdempotencyKey

};