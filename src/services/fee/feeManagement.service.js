const pool = require("../../../config/pool");

const FEE_MANAGEMENT_QUERIES =
    require("../../../queries/fee/feeManagement.query");


// ==========================================================
// Constants
// ==========================================================

const ALLOWED_FEE_TYPES = [
    "FIXED",
    "PERCENTAGE",
    "HYBRID",
    "DYNAMIC"
];

const ALLOWED_STATUS = [
    "ACTIVE",
    "INACTIVE"
];

const ALLOWED_PAYMENT_METHODS = [
    "UPI",
    "CARD",
    "NETBANKING",
    "WALLET",
    "EMI",
    "PAYLATER"
];


// ==========================================================
// Helpers
// ==========================================================

const toNullableNumber = (value) => {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return null;
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        throw new Error("Invalid numeric value.");
    }

    return number;
};


const validatePaymentMethod = (paymentMethod) => {

    if (
        !ALLOWED_PAYMENT_METHODS.includes(paymentMethod)
    ) {
        throw new Error("Invalid payment method.");
    }

};


const validateFeeInput = ({
    paymentMethod,
    feeType,
    fixedFee,
    percentageFee,
    minAmount,
    maxAmount,
    minFee,
    maxFee,
    status
}) => {

    // ------------------------------------------------------
    // Payment Method
    // ------------------------------------------------------

    validatePaymentMethod(paymentMethod);


    // ------------------------------------------------------
    // Fee Type
    // ------------------------------------------------------

    if (
        !ALLOWED_FEE_TYPES.includes(feeType)
    ) {
        throw new Error("Invalid fee type.");
    }


    // ------------------------------------------------------
    // Status
    // ------------------------------------------------------

    if (
        !ALLOWED_STATUS.includes(status)
    ) {
        throw new Error("Invalid fee status.");
    }


    // ------------------------------------------------------
    // FIXED
    // ------------------------------------------------------

    if (feeType === "FIXED") {

        if (
            fixedFee === null ||
            fixedFee === undefined ||
            fixedFee <= 0
        ) {
            throw new Error(
                "Fixed fee must be greater than zero."
            );
        }

        if (percentageFee !== null) {
            throw new Error(
                "Percentage fee is not allowed for FIXED fee."
            );
        }

    }


    // ------------------------------------------------------
    // PERCENTAGE
    // ------------------------------------------------------

    if (feeType === "PERCENTAGE") {

        if (
            percentageFee === null ||
            percentageFee === undefined ||
            percentageFee <= 0
        ) {
            throw new Error(
                "Percentage fee must be greater than zero."
            );
        }

        if (percentageFee > 100) {
            throw new Error(
                "Percentage fee cannot exceed 100."
            );
        }

        if (fixedFee !== null) {
            throw new Error(
                "Fixed fee is not allowed for PERCENTAGE fee."
            );
        }

    }


    // ------------------------------------------------------
    // HYBRID
    // ------------------------------------------------------
    // Hybrid = fixed + percentage configuration.
    // Actual calculation logic can be implemented separately.
    // ------------------------------------------------------

    if (feeType === "HYBRID") {

        if (
            fixedFee === null ||
            fixedFee < 0
        ) {
            throw new Error(
                "Fixed fee is required for HYBRID fee."
            );
        }

        if (
            percentageFee === null ||
            percentageFee < 0
        ) {
            throw new Error(
                "Percentage fee is required for HYBRID fee."
            );
        }

        if (percentageFee > 100) {
            throw new Error(
                "Percentage fee cannot exceed 100."
            );
        }

    }


    // ------------------------------------------------------
    // DYNAMIC
    // ------------------------------------------------------
    // Dynamic fee structure is stored here.
    // Calculation rules can be handled separately.
    // ------------------------------------------------------

    if (feeType === "DYNAMIC") {

        if (
            fixedFee === null &&
            percentageFee === null
        ) {
            throw new Error(
                "At least one fee value is required for DYNAMIC fee."
            );
        }

        if (
            percentageFee !== null &&
            percentageFee > 100
        ) {
            throw new Error(
                "Percentage fee cannot exceed 100."
            );
        }

    }


    // ------------------------------------------------------
    // Amount Range
    // ------------------------------------------------------

    if (
        minAmount !== null &&
        minAmount < 0
    ) {
        throw new Error(
            "Minimum amount cannot be negative."
        );
    }


    if (
        maxAmount !== null &&
        maxAmount < 0
    ) {
        throw new Error(
            "Maximum amount cannot be negative."
        );
    }


    if (
        minAmount !== null &&
        maxAmount !== null &&
        maxAmount <= minAmount
    ) {
        throw new Error(
            "Maximum amount must be greater than minimum amount."
        );
    }


    // ------------------------------------------------------
    // Minimum Fee
    // ------------------------------------------------------

    if (
        minFee !== null &&
        minFee < 0
    ) {
        throw new Error(
            "Minimum fee cannot be negative."
        );
    }


    // ------------------------------------------------------
    // Maximum Fee
    // ------------------------------------------------------

    if (
        maxFee !== null &&
        maxFee < 0
    ) {
        throw new Error(
            "Maximum fee cannot be negative."
        );
    }


    // ------------------------------------------------------
    // Min / Max Fee Relationship
    // ------------------------------------------------------

    if (
        minFee !== null &&
        maxFee !== null &&
        maxFee < minFee
    ) {
        throw new Error(
            "Maximum fee cannot be less than minimum fee."
        );
    }

};


// ==========================================================
// Merchant Validation
// ==========================================================

const validateMerchant = async (
    connection,
    merchantId
) => {

    const [
        rows
    ] = await connection.query(
        `
            SELECT
                merchant_id,
                merchant_name,
                email,
                status
            FROM merchants
            WHERE merchant_id = ?
            LIMIT 1
        `,
        [
            merchantId
        ]
    );


    if (!rows.length) {
        throw new Error(
            "Merchant not found."
        );
    }


    return rows[0];

};


// ==========================================================
// Check Active Fee
// ==========================================================

const checkExistingActiveFee = async (
    connection,
    {
        merchantId,
        paymentMethod,
        feeType,
        excludeFeeId = null
    }
) => {

    let query = `

        SELECT
            fee_id

        FROM merchant_fees

        WHERE merchant_id = ?

          AND payment_method = ?

          AND fee_type = ?

          AND status = 'ACTIVE'

    `;


    const params = [
        merchantId,
        paymentMethod,
        feeType
    ];


    if (excludeFeeId !== null) {

        query += `
            AND fee_id != ?
        `;

        params.push(
            excludeFeeId
        );

    }


    query += `
        LIMIT 1
    `;


    const [
        rows
    ] = await connection.query(
        query,
        params
    );


    return rows.length
        ? rows[0]
        : null;

};


// ==========================================================
// Check Amount Range Overlap
// ==========================================================

const checkAmountRangeOverlap = async (
    connection,
    {
        merchantId,
        paymentMethod,
        minAmount,
        maxAmount,
        excludeFeeId = null
    }
) => {

    let query = `

        SELECT
            fee_id,
            min_amount,
            max_amount

        FROM merchant_fees

        WHERE merchant_id = ?

          AND payment_method = ?

          AND status = 'ACTIVE'

          AND (
                min_amount IS NULL
                OR max_amount IS NULL
                OR (
                    min_amount <= ?
                    AND (
                        max_amount IS NULL
                        OR max_amount >= ?
                    )
                )
          )

    `;


    const params = [
        merchantId,
        paymentMethod,

        maxAmount === null
            ? Number.MAX_SAFE_INTEGER
            : maxAmount,

        minAmount === null
            ? 0
            : minAmount
    ];


    if (excludeFeeId !== null) {

        query += `
            AND fee_id != ?
        `;

        params.push(
            excludeFeeId
        );

    }


    query += `
        LIMIT 1
    `;


    const [
        rows
    ] = await connection.query(
        query,
        params
    );


    return rows.length
        ? rows[0]
        : null;

};


// ==========================================================
// Create Fee
// ==========================================================

const createFee = async ({
    merchantId,

    paymentMethod,

    feeType,

    fixedFee = null,
    percentageFee = null,

    minAmount = null,
    maxAmount = null,

    minFee = null,
    maxFee = null,

    status = "ACTIVE",

    remarks = null,

    adminId
}) => {

    const connection =
        await pool.getConnection();


    try {

        await connection.beginTransaction();


        // --------------------------------------------------
        // Normalize
        // --------------------------------------------------

        const normalizedFixedFee =
            toNullableNumber(
                fixedFee
            );

        const normalizedPercentageFee =
            toNullableNumber(
                percentageFee
            );

        const normalizedMinAmount =
            toNullableNumber(
                minAmount
            );

        const normalizedMaxAmount =
            toNullableNumber(
                maxAmount
            );

        const normalizedMinFee =
            toNullableNumber(
                minFee
            );

        const normalizedMaxFee =
            toNullableNumber(
                maxFee
            );


        // --------------------------------------------------
        // Merchant
        // --------------------------------------------------

        const merchant =
            await validateMerchant(
                connection,
                merchantId
            );


        // --------------------------------------------------
        // Validate
        // --------------------------------------------------

        validateFeeInput({

            paymentMethod,

            feeType,

            fixedFee:
                normalizedFixedFee,

            percentageFee:
                normalizedPercentageFee,

            minAmount:
                normalizedMinAmount,

            maxAmount:
                normalizedMaxAmount,

            minFee:
                normalizedMinFee,

            maxFee:
                normalizedMaxFee,

            status

        });


        // --------------------------------------------------
        // Existing Active Configuration
        // --------------------------------------------------

        const existingFee =
            await checkExistingActiveFee(
                connection,
                {
                    merchantId,
                    paymentMethod,
                    feeType
                }
            );


        if (existingFee) {

            throw new Error(
                "An active fee configuration already exists for this merchant, payment method and fee type."
            );

        }


        // --------------------------------------------------
        // Amount Range Overlap
        // --------------------------------------------------

        if (
            normalizedMinAmount !== null ||
            normalizedMaxAmount !== null
        ) {

            const overlappingFee =
                await checkAmountRangeOverlap(
                    connection,
                    {
                        merchantId,
                        paymentMethod,

                        minAmount:
                            normalizedMinAmount,

                        maxAmount:
                            normalizedMaxAmount
                    }
                );


            if (overlappingFee) {

                throw new Error(
                    "Fee amount range overlaps with an existing active configuration."
                );

            }

        }


        // --------------------------------------------------
        // Create
        // --------------------------------------------------

        const [
            result
        ] = await connection.query(

            FEE_MANAGEMENT_QUERIES
                .CREATE_FEE,

            [
                merchantId,

                paymentMethod,

                feeType,

                normalizedFixedFee,

                normalizedPercentageFee,

                normalizedMinAmount,

                normalizedMaxAmount,

                normalizedMinFee,

                normalizedMaxFee,

                status,

                remarks,

                adminId,

                adminId
            ]

        );


        await connection.commit();


        return {

            success: true,

            feeId:
                result.insertId,

            merchant: {

                merchantId:
                    merchant.merchant_id,

                merchantName:
                    merchant.merchant_name,

                email:
                    merchant.email

            },

            fee: {

                paymentMethod,

                feeType,

                fixedFee:
                    normalizedFixedFee,

                percentageFee:
                    normalizedPercentageFee,

                minAmount:
                    normalizedMinAmount,

                maxAmount:
                    normalizedMaxAmount,

                minFee:
                    normalizedMinFee,

                maxFee:
                    normalizedMaxFee,

                status,

                remarks

            }

        };

    }
    catch (error) {

        await connection.rollback();

        throw error;

    }
    finally {

        connection.release();

    }

};


// ==========================================================
// Update Fee
// ==========================================================

const updateFee = async ({
    feeId,
    merchantId,

    paymentMethod,

    feeType,

    fixedFee = null,
    percentageFee = null,

    minAmount = null,
    maxAmount = null,

    minFee = null,
    maxFee = null,

    status = "ACTIVE",

    remarks = null,

    adminId
}) => {

    const connection =
        await pool.getConnection();


    try {

        await connection.beginTransaction();


        // --------------------------------------------------
        // Normalize
        // --------------------------------------------------

        const normalizedFixedFee =
            toNullableNumber(
                fixedFee
            );

        const normalizedPercentageFee =
            toNullableNumber(
                percentageFee
            );

        const normalizedMinAmount =
            toNullableNumber(
                minAmount
            );

        const normalizedMaxAmount =
            toNullableNumber(
                maxAmount
            );

        const normalizedMinFee =
            toNullableNumber(
                minFee
            );

        const normalizedMaxFee =
            toNullableNumber(
                maxFee
            );


        // --------------------------------------------------
        // Validate merchant
        // --------------------------------------------------

        await validateMerchant(
            connection,
            merchantId
        );


        // --------------------------------------------------
        // Existing Fee
        // --------------------------------------------------

        const [
            feeRows
        ] = await connection.query(

            `
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
                    status

                FROM merchant_fees

                WHERE fee_id = ?
                  AND merchant_id = ?

                LIMIT 1

                FOR UPDATE
            `,

            [
                feeId,
                merchantId
            ]

        );


        if (!feeRows.length) {

            throw new Error(
                "Fee configuration not found."
            );

        }


        // --------------------------------------------------
        // Validate
        // --------------------------------------------------

        validateFeeInput({

            paymentMethod,

            feeType,

            fixedFee:
                normalizedFixedFee,

            percentageFee:
                normalizedPercentageFee,

            minAmount:
                normalizedMinAmount,

            maxAmount:
                normalizedMaxAmount,

            minFee:
                normalizedMinFee,

            maxFee:
                normalizedMaxFee,

            status

        });


        // --------------------------------------------------
        // Check duplicate active configuration
        // --------------------------------------------------

        if (status === "ACTIVE") {

            const existingFee =
                await checkExistingActiveFee(
                    connection,
                    {
                        merchantId,
                        paymentMethod,
                        feeType,

                        excludeFeeId:
                            feeId
                    }
                );


            if (existingFee) {

                throw new Error(
                    "Another active fee configuration already exists for this merchant, payment method and fee type."
                );

            }

        }


        // --------------------------------------------------
        // Check range overlap
        // --------------------------------------------------

        if (
            normalizedMinAmount !== null ||
            normalizedMaxAmount !== null
        ) {

            const overlappingFee =
                await checkAmountRangeOverlap(
                    connection,
                    {
                        merchantId,
                        paymentMethod,

                        minAmount:
                            normalizedMinAmount,

                        maxAmount:
                            normalizedMaxAmount,

                        excludeFeeId:
                            feeId
                    }
                );


            if (overlappingFee) {

                throw new Error(
                    "Fee amount range overlaps with another active configuration."
                );

            }

        }


        // --------------------------------------------------
        // Update
        // --------------------------------------------------

        const [
            result
        ] = await connection.query(

            FEE_MANAGEMENT_QUERIES
                .UPDATE_FEE,

            [
                paymentMethod,

                feeType,

                normalizedFixedFee,

                normalizedPercentageFee,

                normalizedMinAmount,

                normalizedMaxAmount,

                normalizedMinFee,

                normalizedMaxFee,

                status,

                remarks,

                adminId,

                feeId,

                merchantId
            ]

        );


        if (
            result.affectedRows !== 1
        ) {

            throw new Error(
                "Fee configuration update failed."
            );

        }


        await connection.commit();


        return {

            success: true,

            feeId,

            merchantId,

            paymentMethod,

            feeType,

            fixedFee:
                normalizedFixedFee,

            percentageFee:
                normalizedPercentageFee,

            minAmount:
                normalizedMinAmount,

            maxAmount:
                normalizedMaxAmount,

            minFee:
                normalizedMinFee,

            maxFee:
                normalizedMaxFee,

            status,

            remarks

        };

    }
    catch (error) {

        await connection.rollback();

        throw error;

    }
    finally {

        connection.release();

    }

};


// ==========================================================
// Update Fee Status
// ==========================================================

const updateFeeStatus = async ({
    feeId,
    merchantId,
    status,
    adminId
}) => {

    if (
        !ALLOWED_STATUS.includes(status)
    ) {

        throw new Error(
            "Invalid fee status."
        );

    }


    const [
        result
    ] = await pool.query(

        FEE_MANAGEMENT_QUERIES
            .UPDATE_FEE_STATUS,

        [
            status,
            adminId,
            feeId,
            merchantId
        ]

    );


    if (
        result.affectedRows !== 1
    ) {

        throw new Error(
            "Fee configuration not found."
        );

    }


    return {

        success: true,

        feeId,

        merchantId,

        status

    };

};


// ==========================================================
// Get Fee By ID
// ==========================================================

const getFeeById = async (
    feeId
) => {

    const [
        rows
    ] = await pool.query(

        FEE_MANAGEMENT_QUERIES
            .GET_FEE_BY_ID,

        [
            feeId
        ]

    );


    return rows.length
        ? rows[0]
        : null;

};


// ==========================================================
// Get Merchant Fees
// ==========================================================

const getMerchantFees = async (
    merchantId
) => {

    const [
        rows
    ] = await pool.query(

        FEE_MANAGEMENT_QUERIES
            .GET_MERCHANT_FEES,

        [
            merchantId
        ]

    );


    return rows;

};


// ==========================================================
// Delete Fee
// ==========================================================

const deleteFee = async ({
    feeId,
    merchantId
}) => {

    const [
        result
    ] = await pool.query(

        FEE_MANAGEMENT_QUERIES
            .DELETE_FEE,

        [
            feeId,
            merchantId
        ]

    );


    if (
        result.affectedRows !== 1
    ) {

        throw new Error(
            "Fee configuration not found."
        );

    }


    return {

        success: true,

        feeId,

        merchantId

    };

};


// ==========================================================
// Export
// ==========================================================

module.exports = {

    createFee,

    updateFee,

    updateFeeStatus,

    getFeeById,

    getMerchantFees,

    deleteFee

};