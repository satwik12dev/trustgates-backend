const WALLET_TRANSACTION_QUERIES = {

    GET_BY_IDEMPOTENCY_KEY: `

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

            created_at,
            updated_at

        FROM wallet_transactions

        WHERE idempotency_key = ?

        LIMIT 1

    `,


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

            created_at,
            updated_at

        FROM wallet_transactions

        WHERE merchant_id = ?

          AND reference_type = ?

          AND reference_id = ?

        ORDER BY wallet_transaction_id DESC

        LIMIT 1

    `,


    CREATE_TRANSACTION: `

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


    GET_WALLET_TRANSACTIONS: `

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

            created_at,
            updated_at

        FROM wallet_transactions

        WHERE wallet_id = ?

        ORDER BY wallet_transaction_id DESC

        LIMIT ?

        OFFSET ?

    `,


    GET_TRANSACTION_BY_ID: `

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

            created_at,
            updated_at

        FROM wallet_transactions

        WHERE wallet_transaction_id = ?

        LIMIT 1

    `,


    GET_MERCHANT_TRANSACTIONS: `

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

            wt.created_at,
            wt.updated_at

        FROM wallet_transactions wt

        WHERE wt.merchant_id = ?

        ORDER BY wt.wallet_transaction_id DESC

        LIMIT ?

        OFFSET ?

    `,


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


    MARK_COMPLETED: `

        UPDATE wallet_transactions

        SET

            status = 'COMPLETED',

            updated_at = NOW()

        WHERE wallet_transaction_id = ?

          AND status = 'PENDING'

        LIMIT 1

    `,


    MARK_FAILED: `

        UPDATE wallet_transactions

        SET

            status = 'FAILED',

            updated_at = NOW()

        WHERE wallet_transaction_id = ?

          AND status = 'PENDING'

        LIMIT 1

    `,


    MARK_REVERSED: `

        UPDATE wallet_transactions

        SET

            status = 'REVERSED',

            updated_at = NOW()

        WHERE wallet_transaction_id = ?

          AND status = 'PENDING'

        LIMIT 1

    `

};


module.exports =
    WALLET_TRANSACTION_QUERIES;