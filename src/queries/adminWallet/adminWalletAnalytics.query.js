const ADMIN_WALLET_ANALYTICS_QUERIES = {

    // ======================================================
    // Active Admin Wallet
    // ======================================================

    WALLET: `
        SELECT
            admin_wallet_id,
            balance,
            currency,
            status
        FROM admin_wallets
        WHERE status = 'ACTIVE'
        LIMIT 1
    `,


    // ======================================================
    // Summary
    // ======================================================

    SUMMARY: `
        SELECT

            COALESCE(
                SUM(
                    CASE
                        WHEN transaction_type = 'CREDIT'
                        AND status = 'COMPLETED'
                        THEN total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_credits,

            COALESCE(
                SUM(
                    CASE
                        WHEN transaction_type = 'DEBIT'
                        AND status = 'COMPLETED'
                        THEN total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_debits,

            COUNT(
                CASE
                    WHEN status = 'COMPLETED'
                    THEN 1
                END
            ) AS completed_transactions,

            COUNT(
                CASE
                    WHEN status = 'PENDING'
                    THEN 1
                END
            ) AS pending_transactions,

            COUNT(
                CASE
                    WHEN status = 'FAILED'
                    THEN 1
                END
            ) AS failed_transactions,

            COUNT(
                CASE
                    WHEN status = 'REVERSED'
                    THEN 1
                END
            ) AS reversed_transactions

        FROM admin_wallet_transactions

        WHERE DATE(created_at)
              BETWEEN ? AND ?
    `,


    // ======================================================
    // Fee Revenue
    // ======================================================

    FEE_REVENUE: `
        SELECT

            COALESCE(
                SUM(total_amount),
                0
            ) AS total_fee_revenue,

            COUNT(*) AS fee_transaction_count,

            COALESCE(
                AVG(total_amount),
                0
            ) AS average_fee

        FROM admin_wallet_transactions

        WHERE transaction_type = 'CREDIT'
          AND source = 'FEE'
          AND status = 'COMPLETED'
          AND DATE(created_at)
              BETWEEN ? AND ?
    `,


    // ======================================================
    // Source Revenue
    // ======================================================

    SOURCE_REVENUE: `
        SELECT

            source,

            COALESCE(
                SUM(total_amount),
                0
            ) AS revenue,

            COUNT(*) AS transaction_count

        FROM admin_wallet_transactions

        WHERE transaction_type = 'CREDIT'
          AND source = 'FEE'
          AND status = 'COMPLETED'
          AND DATE(created_at)
              BETWEEN ? AND ?

        GROUP BY source

        ORDER BY revenue DESC
    `,


    // ======================================================
    // Merchant Revenue
    // ======================================================

    MERCHANT_REVENUE: `
        SELECT

            merchant_id,

            COALESCE(
                SUM(total_amount),
                0
            ) AS total_revenue,

            COUNT(*) AS transaction_count,

            MAX(created_at) AS last_transaction_at

        FROM admin_wallet_transactions

        WHERE transaction_type = 'CREDIT'
          AND source = 'FEE'
          AND status = 'COMPLETED'
          AND DATE(created_at)
              BETWEEN ? AND ?

        GROUP BY merchant_id

        ORDER BY total_revenue DESC,
                 merchant_id ASC
    `,


    // ======================================================
    // Refund Fee Analytics
    // ======================================================

    REFUND_FEES: `
        SELECT

            COALESCE(
                SUM(total_amount),
                0
            ) AS refund_fee_revenue,

            COUNT(*) AS refund_fee_transactions,

            COALESCE(
                AVG(total_amount),
                0
            ) AS average_refund_fee

        FROM admin_wallet_transactions

        WHERE transaction_type = 'CREDIT'
          AND source = 'FEE'
          AND reference_type = 'REFUND'
          AND status = 'COMPLETED'
          AND DATE(created_at)
              BETWEEN ? AND ?
    `,


    // ======================================================
    // Daily Revenue
    // ======================================================

    DAILY_REVENUE: `
    SELECT

        DATE_FORMAT(
            created_at,
            '%Y-%m-%d'
        ) AS date,

        COALESCE(
            SUM(total_amount),
            0
        ) AS revenue,

        COUNT(*) AS transaction_count

    FROM admin_wallet_transactions

    WHERE transaction_type = 'CREDIT'
      AND source = 'FEE'
      AND status = 'COMPLETED'
      AND DATE(created_at)
          BETWEEN ? AND ?

    GROUP BY DATE_FORMAT(
        created_at,
        '%Y-%m-%d'
    )

    ORDER BY DATE_FORMAT(
        created_at,
        '%Y-%m-%d'
    ) ASC
`,


    // ======================================================
    // Recent Transactions
    // ======================================================

    RECENT_TRANSACTIONS: `
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
            status,
            description,
            created_at

        FROM admin_wallet_transactions

        ORDER BY
            created_at DESC,
            admin_wallet_transaction_id DESC

        LIMIT ?
    `,


    // ======================================================
    // Reconciliation
    // ======================================================

    RECONCILIATION: `
        SELECT

            COALESCE(
                SUM(
                    CASE
                        WHEN transaction_type = 'CREDIT'
                        AND status = 'COMPLETED'
                        THEN total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_credits,

            COALESCE(
                SUM(
                    CASE
                        WHEN transaction_type = 'DEBIT'
                        AND status = 'COMPLETED'
                        THEN total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_debits

        FROM admin_wallet_transactions
    `

};


module.exports =
    ADMIN_WALLET_ANALYTICS_QUERIES;