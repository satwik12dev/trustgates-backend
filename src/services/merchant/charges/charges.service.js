const pool = require("../../../config/pool");


// ==========================================================
// Get Logged-in Merchant Fees
// ==========================================================

const getMyFees = async (merchantId) => {

    if (
        !merchantId ||
        !Number.isInteger(Number(merchantId)) ||
        Number(merchantId) <= 0
    ) {
        throw new Error(
            "Invalid merchant ID."
        );
    }


    const [rows] = await pool.query(
        `
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
                created_at DESC
        `,
        [
            Number(merchantId)
        ]
    );


    return rows;
};


module.exports = {
    getMyFees
};