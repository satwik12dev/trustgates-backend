const FEE_MANAGEMENT_QUERIES =
    require("../../queries/fee/feeManagement.query");

const feeCalculationService = async (
    connection,
    {
        merchantId,
        refundAmount
    }
) => {

    if (
        !connection ||
        typeof connection.query !== "function"
    ) {
        throw new Error(
            "Database connection is required."
        );
    }

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

    const [
        feeRows
    ] = await connection.query(
        FEE_MANAGEMENT_QUERIES
            .GET_APPLICABLE_FEE,
        [
            Number(merchantId),
            amount,
            amount
        ]
    );

    if (
        !feeRows.length
    ) {
        throw new Error(
            "No active fee configuration found for this merchant and refund amount."
        );
    }

    const feeConfig =
        feeRows[0];

    const feeType =
        feeConfig.fee_type;

    const feeValue =
        Number(
            feeConfig.fee_value
        );

    const minimumFee =
        feeConfig.minimum_fee !== null &&
        feeConfig.minimum_fee !== undefined
            ? Number(
                feeConfig.minimum_fee
            )
            : null;

    const maximumFee =
        feeConfig.maximum_fee !== null &&
        feeConfig.maximum_fee !== undefined
            ? Number(
                feeConfig.maximum_fee
            )
            : null;

    if (
        !Number.isFinite(feeValue) ||
        feeValue < 0
    ) {
        throw new Error(
            "Invalid fee configuration."
        );
    }

    let calculatedFee = 0;

    if (
        feeType === "FIXED"
    ) {

        calculatedFee =
            feeValue;

    } else if (
        feeType === "PERCENTAGE"
    ) {

        calculatedFee =
            (
                amount *
                feeValue
            ) / 100;

    } else if (
        feeType === "SLAB"
    ) {

        calculatedFee =
            (
                amount *
                feeValue
            ) / 100;

    } else {

        throw new Error(
            `Unsupported fee type: ${feeType}`
        );
    }

    calculatedFee =
        Math.round(
            (
                calculatedFee +
                Number.EPSILON
            ) * 100
        ) / 100;

    if (
        minimumFee !== null &&
        calculatedFee < minimumFee
    ) {
        calculatedFee =
            minimumFee;
    }

    if (
        maximumFee !== null &&
        calculatedFee > maximumFee
    ) {
        calculatedFee =
            maximumFee;
    }

    calculatedFee =
        Math.round(
            (
                calculatedFee +
                Number.EPSILON
            ) * 100
        ) / 100;

    const totalDebitAmount =
        Math.round(
            (
                amount +
                calculatedFee +
                Number.EPSILON
            ) * 100
        ) / 100;

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
                feeConfig.min_amount !== null &&
                feeConfig.min_amount !== undefined
                    ? Number(
                        feeConfig.min_amount
                    )
                    : null,

            maxAmount:
                feeConfig.max_amount !== null &&
                feeConfig.max_amount !== undefined
                    ? Number(
                        feeConfig.max_amount
                    )
                    : null,

            minimumFee,

            maximumFee
        }
    };
};

module.exports =
    feeCalculationService;