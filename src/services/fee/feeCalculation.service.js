const pool = require("../../config/pool");

const FEE_MANAGEMENT_QUERIES =
    require("../../queries/fee/feeManagement.query");


// ==========================================================
// Fee Calculation Service
// ==========================================================
//
// Input:
//
// merchantId
// refundAmount
//
// Output:
//
// refundAmount
// feeAmount
// totalDebitAmount
// feeType
// feeConfigId
//
// IMPORTANT:
//
// This service ONLY calculates the fee.
//
// It does NOT modify wallet balance.
//
// Wallet reservation/debit is handled separately.
//
// ==========================================================


const feeCalculationService = async ({
    merchantId,
    refundAmount
}) => {

    // ======================================================
    // 1. Validate Merchant ID
    // ======================================================

    if (
        merchantId === undefined ||
        merchantId === null ||
        !Number.isInteger(
            Number(merchantId)
        ) ||
        Number(merchantId) <= 0
    ) {

        throw new Error(
            "Valid merchant ID is required."
        );

    }


    // ======================================================
    // 2. Validate Refund Amount
    // ======================================================

    const amount =
        Number(refundAmount);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        throw new Error(
            "Refund amount must be greater than zero."
        );

    }


    // ======================================================
    // 3. Get Applicable Fee
    // ======================================================
    //
    // For FIXED / PERCENTAGE:
    //
    // merchant_id is enough.
    //
    // For SLAB:
    //
    // merchant_id + refund amount
    // determines the applicable slab.
    //
    // ======================================================

    const [
        feeRows
    ] = await pool.query(

        FEE_MANAGEMENT_QUERIES
            .GET_APPLICABLE_FEE,

        [

            merchantId,

            amount,

            amount

        ]

    );


    // ======================================================
    // 4. Fee Configuration Not Found
    // ======================================================

    if (
        !feeRows.length
    ) {

        throw new Error(
            "No active fee configuration found for this merchant and refund amount."
        );

    }


    const feeConfig =
        feeRows[0];


    // ======================================================
    // 5. Extract Configuration
    // ======================================================

    const feeType =
        feeConfig.fee_type;


    const feeValue =
        Number(
            feeConfig.fee_value
        );


    const minimumFee =
        feeConfig.minimum_fee !== null
            ? Number(
                feeConfig.minimum_fee
            )
            : null;


    const maximumFee =
        feeConfig.maximum_fee !== null
            ? Number(
                feeConfig.maximum_fee
            )
            : null;


    // ======================================================
    // 6. Validate Fee Configuration
    // ======================================================

    if (
        !Number.isFinite(feeValue) ||
        feeValue < 0
    ) {

        throw new Error(
            "Invalid fee configuration."
        );

    }


    // ======================================================
    // 7. Calculate Fee
    // ======================================================

    let calculatedFee = 0;


    // ======================================================
    // FIXED
    // ======================================================

    if (
        feeType === "FIXED"
    ) {

        calculatedFee =
            feeValue;

    }


    // ======================================================
    // PERCENTAGE
    // ======================================================

    else if (
        feeType === "PERCENTAGE"
    ) {

        calculatedFee =
            (
                amount *
                feeValue
            ) / 100;

    }


    // ======================================================
    // SLAB
    // ======================================================

    else if (
        feeType === "SLAB"
    ) {

        calculatedFee =
            (
                amount *
                feeValue
            ) / 100;

    }


    // ======================================================
    // Invalid Type
    // ======================================================

    else {

        throw new Error(
            "Unsupported fee type."
        );

    }


    // ======================================================
    // 8. Round Fee
    // ======================================================
    //
    // Currency calculation should be stored to 2 decimals.
    //
    // ======================================================

    calculatedFee =
        Math.round(
            (
                calculatedFee +
                Number.EPSILON
            ) * 100
        ) / 100;


    // ======================================================
    // 9. Apply Minimum Fee
    // ======================================================

    if (
        minimumFee !== null &&
        calculatedFee < minimumFee
    ) {

        calculatedFee =
            minimumFee;

    }


    // ======================================================
    // 10. Apply Maximum Fee
    // ======================================================

    if (
        maximumFee !== null &&
        calculatedFee > maximumFee
    ) {

        calculatedFee =
            maximumFee;

    }


    // ======================================================
    // 11. Final Rounding
    // ======================================================

    calculatedFee =
        Math.round(
            (
                calculatedFee +
                Number.EPSILON
            ) * 100
        ) / 100;


    // ======================================================
    // 12. Calculate Total Wallet Debit
    // ======================================================

    const totalDebitAmount =
        Math.round(
            (
                amount +
                calculatedFee +
                Number.EPSILON
            ) * 100
        ) / 100;


    // ======================================================
    // 13. Return
    // ======================================================

    return {

        success: true,

        merchantId:
            Number(merchantId),

        feeConfigId:
            feeConfig.fee_id,

        feeType,

        feeValue,

        refundAmount:
            amount,

        feeAmount:
            calculatedFee,

        totalDebitAmount,

        currency:
            "INR",

        feeConfiguration: {

            minAmount:
                feeConfig.min_amount !== null
                    ? Number(
                        feeConfig.min_amount
                    )
                    : null,

            maxAmount:
                feeConfig.max_amount !== null
                    ? Number(
                        feeConfig.max_amount
                    )
                    : null,

            minimumFee,

            maximumFee

        }

    };

};


// ==========================================================
// Export
// ==========================================================

module.exports =
    feeCalculationService;