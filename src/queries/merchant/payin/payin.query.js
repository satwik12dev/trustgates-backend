const PAYIN_ANALYTICS_QUERY = `

    SELECT

        -- ==================================================
        -- TOTAL PAYIN
        -- ==================================================

        COUNT(*) AS total_payin_transactions,

        COALESCE(
            SUM(amount),
            0.00
        ) AS total_payin_amount,


        -- ==================================================
        -- SUCCESS
        -- ==================================================

        COALESCE(
            SUM(
                CASE
                    WHEN status = 'SUCCESS'
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS successful_transactions,

        COALESCE(
            SUM(
                CASE
                    WHEN status = 'SUCCESS'
                    THEN amount
                    ELSE 0
                END
            ),
            0.00
        ) AS successful_payin_amount,


        -- ==================================================
        -- FAILED
        -- ==================================================

        COALESCE(
            SUM(
                CASE
                    WHEN status = 'FAILED'
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS failed_transactions,


        -- ==================================================
        -- CREATED
        -- ==================================================

        COALESCE(
            SUM(
                CASE
                    WHEN status = 'CREATED'
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS created_transactions,


        -- ==================================================
        -- PENDING
        -- ==================================================

        COALESCE(
            SUM(
                CASE
                    WHEN status = 'PENDING'
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS pending_transactions,


        -- ==================================================
        -- AUTHORIZED
        -- ==================================================

        COALESCE(
            SUM(
                CASE
                    WHEN status = 'AUTHORIZED'
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS authorized_transactions,


        -- ==================================================
        -- CANCELLED
        -- ==================================================

        COALESCE(
            SUM(
                CASE
                    WHEN status = 'CANCELLED'
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS cancelled_transactions,


        -- ==================================================
        -- REFUNDED
        -- ==================================================

        COALESCE(
            SUM(
                CASE
                    WHEN status = 'REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS refunded_transactions,


        -- ==================================================
        -- PARTIALLY REFUNDED
        -- ==================================================

        COALESCE(
            SUM(
                CASE
                    WHEN status = 'PARTIALLY_REFUNDED'
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS partially_refunded_transactions,


        -- ==================================================
        -- CHARGEBACK
        -- ==================================================

        COALESCE(
            SUM(
                CASE
                    WHEN status = 'CHARGEBACK'
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS chargeback_transactions,


        -- ==================================================
        -- SUCCESS RATE
        -- ==================================================

        COALESCE(
            ROUND(
                (
                    SUM(
                        CASE
                            WHEN status = 'SUCCESS'
                            THEN 1
                            ELSE 0
                        END
                    )
                    /
                    NULLIF(COUNT(*), 0)
                ) * 100,
                2
            ),
            0.00
        ) AS success_percentage,


        -- ==================================================
        -- AVERAGE SUCCESSFUL PAYIN
        -- ==================================================

        COALESCE(
            AVG(
                CASE
                    WHEN status = 'SUCCESS'
                    THEN amount
                    ELSE NULL
                END
            ),
            0.00
        ) AS average_payin_amount,


        -- ==================================================
        -- FEES
        -- ==================================================

        COALESCE(
            SUM(merchant_fee),
            0.00
        ) AS total_merchant_fee,

        COALESCE(
            SUM(gateway_fee),
            0.00
        ) AS total_gateway_fee,

        COALESCE(
            SUM(gateway_tax),
            0.00
        ) AS total_gateway_tax,

        COALESCE(
            SUM(net_amount),
            0.00
        ) AS total_net_amount,


        -- ==================================================
        -- PAYMENT METHOD DISTRIBUTION
        -- ==================================================

        COALESCE(
            SUM(
                CASE
                    WHEN payment_method = 'UPI'
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS upi_transactions,


        COALESCE(
            SUM(
                CASE
                    WHEN payment_method = 'CARD'
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS card_transactions,


        COALESCE(
            SUM(
                CASE
                    WHEN payment_method = 'NETBANKING'
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS netbanking_transactions,


        COALESCE(
            SUM(
                CASE
                    WHEN payment_method = 'WALLET'
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS wallet_transactions,


        COALESCE(
            SUM(
                CASE
                    WHEN payment_method = 'EMI'
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS emi_transactions,


        COALESCE(
            SUM(
                CASE
                    WHEN payment_method = 'PAYLATER'
                    THEN 1
                    ELSE 0
                END
            ),
            0
        ) AS paylater_transactions


    FROM transactions

    WHERE merchant_id = ?

      AND payment_type = 'PAYIN'

`;


module.exports = {
    PAYIN_ANALYTICS_QUERY
};