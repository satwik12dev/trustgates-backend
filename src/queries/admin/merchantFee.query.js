// ==========================================================
// Admin Merchant Fee Management Queries
// ==========================================================

const MERCHANT_FEE_QUERIES = {

    // ======================================================
    // Create Fee
    // ======================================================

    CREATE_FEE: `
        INSERT INTO merchant_fees (
            merchant_id,
            payment_method,
            fee_type,
            fixed_fee,
            percentage_fee,
            min_fee,
            max_fee,
            gst_percentage,
            effective_from,
            effective_to,
            status,
            remarks,
            created_by
        )
        VALUES (
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
    // Get All Fees
    // ======================================================

    GET_ALL_FEES: `
        SELECT
            fee_id,
            merchant_id,
            payment_method,
            fee_type,
            fixed_fee,
            percentage_fee,
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
        ORDER BY
            created_at DESC,
            fee_id DESC
        LIMIT ? OFFSET ?
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
            created_at DESC,
            fee_id DESC
    `,


    // ======================================================
    // Get Merchant Fee By Payment Method
    // ======================================================

    GET_MERCHANT_FEE_BY_METHOD: `
        SELECT
            fee_id,
            merchant_id,
            payment_method,
            fee_type,
            fixed_fee,
            percentage_fee,
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
          AND payment_method = ?
        ORDER BY
            effective_from DESC,
            fee_id DESC
        LIMIT 1
    `,


    // ======================================================
    // Get Currently Active Fee
    // ======================================================

    GET_ACTIVE_FEE: `
        SELECT
            fee_id,
            merchant_id,
            payment_method,
            fee_type,
            fixed_fee,
            percentage_fee,
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
          AND payment_method = ?
          AND status = 'ACTIVE'
          AND effective_from <= NOW()
          AND (
                effective_to IS NULL
                OR effective_to > NOW()
          )
        ORDER BY
            effective_from DESC,
            fee_id DESC
        LIMIT 1
    `,


    // ======================================================
    // Update Fee
    // ======================================================
    // merchant_id intentionally NOT updated.
    // A fee configuration remains permanently associated
    // with the merchant it was created for.

    UPDATE_FEE: `
        UPDATE merchant_fees
        SET
            payment_method = ?,
            fee_type = ?,
            fixed_fee = ?,
            percentage_fee = ?,
            min_fee = ?,
            max_fee = ?,
            gst_percentage = ?,
            effective_from = ?,
            effective_to = ?,
            status = ?,
            remarks = ?,
            updated_by = ?
        WHERE fee_id = ?
    `,


    // ======================================================
    // Update Fee Status
    // ======================================================

    UPDATE_FEE_STATUS: `
        UPDATE merchant_fees
        SET
            status = ?,
            updated_by = ?
        WHERE fee_id = ?
    `,


    // ======================================================
    // Delete Fee
    // ======================================================

    DELETE_FEE: `
        DELETE FROM merchant_fees
        WHERE fee_id = ?
    `,


    // ======================================================
    // Count All Fees
    // ======================================================

    COUNT_ALL_FEES: `
        SELECT
            COUNT(*) AS total
        FROM merchant_fees
    `,


    // ======================================================
    // Count Merchant Fees
    // ======================================================

    COUNT_MERCHANT_FEES: `
        SELECT
            COUNT(*) AS total
        FROM merchant_fees
        WHERE merchant_id = ?
    `,


    // ======================================================
    // Check Active Fee Exists
    // ======================================================

    CHECK_FEE_EXISTS: `
        SELECT
            fee_id
        FROM merchant_fees
        WHERE merchant_id = ?
          AND payment_method = ?
          AND status = 'ACTIVE'
          AND effective_from <= NOW()
          AND (
                effective_to IS NULL
                OR effective_to > NOW()
          )
        LIMIT 1
    `,


    // ======================================================
    // Check Fee Overlap
    // ======================================================
    //
    // Prevents overlapping ACTIVE fee configurations
    // for the same merchant + payment method.
    //
    // For CREATE:
    //     pass fee_id = 0
    //
    // For UPDATE:
    //     pass existing fee_id
    //
    // Date overlap condition:
    //
    // existing_start < new_end
    // AND
    // existing_end > new_start
    //
    // NULL effective_to means no expiry.
    // ======================================================

    CHECK_FEE_OVERLAP: `
        SELECT
            fee_id
        FROM merchant_fees
        WHERE merchant_id = ?
          AND payment_method = ?
          AND status = 'ACTIVE'
          AND fee_id != ?
          AND effective_from < COALESCE(
                ?,
                '9999-12-31 23:59:59'
          )
          AND COALESCE(
                effective_to,
                '9999-12-31 23:59:59'
          ) > ?
        LIMIT 1
    `

};


module.exports = MERCHANT_FEE_QUERIES;