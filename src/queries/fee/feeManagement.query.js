// ==========================================================
// Merchant Fee Management Queries
// ==========================================================

const FEE_MANAGEMENT_QUERIES = {

    // ======================================================
    // Create Fee
    // ======================================================

    CREATE_FEE:`

INSERT INTO merchant_fees
(
    merchant_id,
    payment_method,
    fee_type,
    fixed_fee,
    percentage_fee,
    min_amount,
    max_amount,
    min_fee,
    max_fee,
    status,
    remarks,
    created_by,
    updated_by
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`,

    // ======================================================
    // Get Fee By ID
    // ======================================================

    GET_FEE_BY_ID: `

        SELECT

            fee_id,
            merchant_id,

            payment_method,

            fee_type,

            fixed_fee,
            percentage_fee,

            min_amount,
            max_amount,

            min_fee,
            max_fee,

            gst_percentage,

            effective_from,
            effective_to,

            status,
            remarks,

            created_by,
            updated_by,

            created_at,
            updated_at

        FROM merchant_fees

        WHERE fee_id = ?

        LIMIT 1

    `,


    // ======================================================
    // Get Merchant Fees
    // ======================================================

    GET_MERCHANT_FEES: `

        SELECT

            fee_id,
            merchant_id,

            payment_method,

            fee_type,

            fixed_fee,
            percentage_fee,

            min_amount,
            max_amount,

            min_fee,
            max_fee,

            gst_percentage,

            effective_from,
            effective_to,

            status,
            remarks,

            created_by,
            updated_by,

            created_at,
            updated_at

        FROM merchant_fees

        WHERE merchant_id = ?

        ORDER BY
            created_at DESC

    `,


    // ======================================================
    // Get Active Fee Configuration
    // ======================================================

    GET_APPLICABLE_FEE: `

        SELECT

            fee_id,
            merchant_id,

            payment_method,

            fee_type,

            CASE

                WHEN fee_type = 'FIXED'
                THEN fixed_fee

                WHEN fee_type IN (
                    'PERCENTAGE',
                    'HYBRID',
                    'DYNAMIC'
                )
                THEN percentage_fee

                ELSE NULL

            END AS fee_value,

            fixed_fee,
            percentage_fee,

            min_amount,
            max_amount,

            min_fee AS minimum_fee,
            max_fee AS maximum_fee,

            gst_percentage,

            effective_from,
            effective_to,

            status,
            remarks

        FROM merchant_fees

        WHERE merchant_id = ?

          AND status = 'ACTIVE'

          AND (
                effective_from IS NULL
                OR effective_from <= NOW()
          )

          AND (
                effective_to IS NULL
                OR effective_to >= NOW()
          )

          AND
          (
              fee_type IN (
                  'FIXED',
                  'PERCENTAGE',
                  'HYBRID',
                  'DYNAMIC'
              )

              OR

              (
                  min_amount <= ?

                  AND
                  (
                      max_amount IS NULL
                      OR max_amount >= ?
                  )
              )
          )

        ORDER BY

            CASE
                WHEN min_amount IS NOT NULL
                THEN min_amount
                ELSE 0
            END DESC,

            created_at DESC

        LIMIT 1

    `,


    // ======================================================
    // Get Active Merchant Fee
    // ======================================================

    GET_ACTIVE_MERCHANT_FEE: `

        SELECT

            fee_id,
            merchant_id,

            payment_method,

            fee_type,

            CASE

                WHEN fee_type = 'FIXED'
                THEN fixed_fee

                WHEN fee_type IN (
                    'PERCENTAGE',
                    'HYBRID',
                    'DYNAMIC'
                )
                THEN percentage_fee

                ELSE NULL

            END AS fee_value,

            fixed_fee,
            percentage_fee,

            min_amount,
            max_amount,

            min_fee AS minimum_fee,
            max_fee AS maximum_fee,

            gst_percentage,

            effective_from,
            effective_to,

            status,
            remarks

        FROM merchant_fees

        WHERE merchant_id = ?

          AND status = 'ACTIVE'

          AND (
                effective_from IS NULL
                OR effective_from <= NOW()
          )

          AND (
                effective_to IS NULL
                OR effective_to >= NOW()
          )

          AND fee_type IN (
              'FIXED',
              'PERCENTAGE',
              'HYBRID',
              'DYNAMIC'
          )

        ORDER BY
            created_at DESC

        LIMIT 1

    `,


    // ======================================================
    // Update Fee
    // ======================================================

    UPDATE_FEE: `
    UPDATE merchant_fees
SET
    payment_method = ?,
    fee_type = ?,
    fixed_fee = ?,
    percentage_fee = ?,
    min_amount = ?,
    max_amount = ?,
    min_fee = ?,
    max_fee = ?,
    status = ?,
    remarks = ?,
    updated_by = ?,
    updated_at = NOW()
WHERE fee_id = ?
  AND merchant_id = ?

    `,


    // ======================================================
    // Delete Fee
    // ======================================================

    DELETE_FEE: `

        DELETE FROM merchant_fees

        WHERE fee_id = ?

          AND merchant_id = ?

    `,


    // ======================================================
    // Check Fee Exists
    // ======================================================

    CHECK_FEE_EXISTS: `

        SELECT

            fee_id

        FROM merchant_fees

        WHERE merchant_id = ?

          AND fee_type = ?

          AND status = 'ACTIVE'

        LIMIT 1

    `,


    // ======================================================
    // Get Merchant Fee History
    // ======================================================

    GET_FEE_HISTORY: `

        SELECT

            fee_id,
            merchant_id,

            payment_method,

            fee_type,

            fixed_fee,
            percentage_fee,

            min_amount,
            max_amount,

            min_fee,
            max_fee,

            gst_percentage,

            effective_from,
            effective_to,

            status,
            remarks,

            created_by,
            updated_by,

            created_at,
            updated_at

        FROM merchant_fees

        WHERE merchant_id = ?

        ORDER BY
            created_at DESC

        LIMIT ?
        OFFSET ?

    `,


    // ======================================================
    // Count Merchant Fees
    // ======================================================

    COUNT_MERCHANT_FEES: `

        SELECT

            COUNT(*) AS total

        FROM merchant_fees

        WHERE merchant_id = ?

    `

};


module.exports = FEE_MANAGEMENT_QUERIES;