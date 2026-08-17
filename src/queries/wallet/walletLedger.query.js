const WALLET_LEDGER_QUERIES = {

    // ==========================================================
    // Create Ledger Entry
    // ==========================================================

    CREATE_LEDGER_ENTRY: `

        INSERT INTO wallet_transactions
        (
            wallet_id,
            merchant_id,

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

        VALUES
        (
            ?,
            ?,

            ?,
            ?,

            ?,
            ?,
            ?,

            ?,
            ?,

            ?,
            ?,

            ?,

            ?,

            ?,
            ?
        )

    `,


    // ==========================================================
    // Get Wallet Ledger
    // ==========================================================

    GET_WALLET_LEDGER: `

        SELECT

            wallet_transaction_id,

            wallet_id,
            merchant_id,

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

            created_at

        FROM wallet_transactions

        WHERE wallet_id = ?

        ORDER BY created_at DESC

        LIMIT ?

        OFFSET ?

    `,


    // ==========================================================
    // Get Ledger By ID
    // ==========================================================

    GET_LEDGER_BY_ID: `

        SELECT

            wallet_transaction_id,

            wallet_id,
            merchant_id,

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

            created_at

        FROM wallet_transactions

        WHERE wallet_transaction_id = ?

        LIMIT 1

    `,


    // ==========================================================
    // Get Ledger By Reference
    // ==========================================================

    GET_BY_REFERENCE: `

        SELECT

            wallet_transaction_id,

            wallet_id,
            merchant_id,

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

            created_at

        FROM wallet_transactions

        WHERE reference_type = ?

          AND reference_id = ?

        ORDER BY created_at DESC

    `,


    // ==========================================================
    // Check Duplicate Ledger
    // Idempotency Protection
    // ==========================================================

    CHECK_IDEMPOTENCY_KEY: `

        SELECT

            wallet_transaction_id,

            wallet_id,
            merchant_id,

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

            created_at

        FROM wallet_transactions

        WHERE idempotency_key = ?

        LIMIT 1

    `,


    // ==========================================================
    // Get Merchant Ledger
    // Admin / CMS
    // ==========================================================

    GET_MERCHANT_LEDGER: `

        SELECT

            wt.wallet_transaction_id,

            wt.wallet_id,
            wt.merchant_id,

            wt.transaction_type,
            wt.source,

            wt.amount,
            wt.fee_amount,
            wt.total_amount,

            wt.balance_before,
            wt.balance_after,

            wt.reference_type,
            wt.reference_id,

            wt.idempotency_key,

            wt.status,

            wt.description,
            wt.metadata,

            wt.created_at

        FROM wallet_transactions wt

        WHERE wt.merchant_id = ?

        ORDER BY wt.created_at DESC

        LIMIT ?

        OFFSET ?

    `,


    // ==========================================================
    // Get Total Credit
    // ==========================================================

    GET_TOTAL_CREDIT: `

        SELECT

            COALESCE(
                SUM(total_amount),
                0.00
            ) AS total_credit

        FROM wallet_transactions

        WHERE merchant_id = ?

          AND transaction_type = 'CREDIT'

          AND status = 'COMPLETED'

    `,


    // ==========================================================
    // Get Total Debit
    // ==========================================================
    //
    // Uses total_amount because actual wallet movement
    // includes refund fee.
    //
    // Example:
    //
    // Refund     = 1000
    // Fee        = 20
    // Total debit = 1020
    //
    // ==========================================================

    GET_TOTAL_DEBIT: `

        SELECT

            COALESCE(
                SUM(total_amount),
                0.00
            ) AS total_debit

        FROM wallet_transactions

        WHERE merchant_id = ?

          AND transaction_type = 'DEBIT'

          AND status = 'COMPLETED'

    `,


    // ==========================================================
    // Get Total Refund Amount
    // ==========================================================
    //
    // Actual refund amount only.
    // Fee is NOT included here.
    //
    // ==========================================================

    GET_TOTAL_REFUND_AMOUNT: `

        SELECT

            COALESCE(
                SUM(amount),
                0.00
            ) AS total_refund_amount

        FROM wallet_transactions

        WHERE merchant_id = ?

          AND transaction_type = 'DEBIT'

          AND source = 'REFUND'

          AND status = 'COMPLETED'

    `,


    // ==========================================================
    // Get Total Refund Fees
    // ==========================================================

    GET_TOTAL_REFUND_FEES: `

        SELECT

            COALESCE(
                SUM(fee_amount),
                0.00
            ) AS total_refund_fees

        FROM wallet_transactions

        WHERE merchant_id = ?

          AND transaction_type = 'DEBIT'

          AND source = 'REFUND'

          AND status = 'COMPLETED'

    `,


    // ==========================================================
    // Reverse Ledger Entry
    // ==========================================================
    //
    // Used when refund fails.
    //
    // PENDING → REVERSED
    //
    // ==========================================================

    MARK_REVERSED: `

        UPDATE wallet_transactions

        SET

            status = 'REVERSED'

        WHERE wallet_transaction_id = ?

          AND status = 'PENDING'

        LIMIT 1

    `,


    // ==========================================================
    // Mark Ledger Completed
    // ==========================================================
    //
    // Used when refund succeeds.
    //
    // PENDING → COMPLETED
    //
    // ==========================================================

    MARK_COMPLETED: `

        UPDATE wallet_transactions

        SET

            status = 'COMPLETED'

        WHERE wallet_transaction_id = ?

          AND status = 'PENDING'

        LIMIT 1

    `

};


module.exports =
    WALLET_LEDGER_QUERIES;