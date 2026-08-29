// ==========================================================
// Admin Merchant Fee Management Service
// ==========================================================

const db = require("../../config/pool");

const QUERIES = require("../../queries/admin/merchantFee.query");


// ==========================================================
// Error Helper
// ==========================================================

const createError = (
    message,
    code = "BAD_REQUEST"
) => {

    const error =
        new Error(message);

    error.code = code;

    return error;
};


// ==========================================================
// Validation Helpers
// ==========================================================

const validatePositiveInteger = (
    value,
    fieldName
) => {

    const number =
        Number(value);

    if (
        !Number.isInteger(number) ||
        number <= 0
    ) {
        throw createError(
            `Invalid ${fieldName}.`
        );
    }

    return number;
};


const validateFeeId = (
    feeId
) => {

    return validatePositiveInteger(
        feeId,
        "feeId"
    );
};


const validateMerchantId = (
    merchantId
) => {

    return validatePositiveInteger(
        merchantId,
        "merchantId"
    );
};
// ==========================================================
// Validate Money
// ==========================================================

const validateMoney = (
    value,
    fieldName,
    {
        allowNull = false
    } = {}
) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        if (allowNull) {
            return null;
        }

        throw createError(
            `${fieldName} is required.`
        );
    }


    const number =
        Number(value);


    if (
        !Number.isFinite(number) ||
        number < 0
    ) {

        throw createError(
            `Invalid ${fieldName}.`
        );
    }


    return Number(
        number.toFixed(2)
    );
};

// ==========================================================
// Validate Date
// ==========================================================

const validateDate = (
    value,
    fieldName,
    {
        allowNull = false
    } = {}
) => {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        if (allowNull) {
            return null;
        }

        throw createError(
            `${fieldName} is required.`
        );
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        throw createError(
            `Invalid ${fieldName}.`
        );
    }


    return value;
};
// ==========================================================
// Validate Percentage
// ==========================================================

const validatePercentage = (
    value,
    fieldName
) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        throw createError(
            `${fieldName} is required.`
        );
    }


    const number =
        Number(value);


    if (
        !Number.isFinite(number) ||
        number < 0 ||
        number > 100
    ) {

        throw createError(
            `Invalid ${fieldName}.`
        );
    }


    return Number(
        number.toFixed(4)
    );
};

// ==========================================================
// Validate Fee Configuration
// ==========================================================

const validateFeeConfiguration = ({
    feeType,
    fixedFee,
    percentageFee,
    minFee,
    maxFee,
    gstPercentage,
    effectiveFrom,
    effectiveTo
}) => {

    const allowedFeeTypes = [
        "FIXED",
        "PERCENTAGE",
        "HYBRID",
        "DYNAMIC"
    ];

    if (
        !allowedFeeTypes.includes(
            feeType
        )
    ) {
        throw createError(
            "Invalid feeType."
        );
    }


    const fixed =
        validateMoney(
            fixedFee,
            "fixedFee"
        );


    const percentage =
        validatePercentage(
            percentageFee,
            "percentageFee"
        );


    const min =
        validateMoney(
            minFee,
            "minFee",
            {
                allowNull: true
            }
        );


    const max =
        validateMoney(
            maxFee,
            "maxFee",
            {
                allowNull: true
            }
        );


    const gst =
        validatePercentage(
            gstPercentage,
            "gstPercentage"
        );


    const from =
        validateDate(
            effectiveFrom,
            "effectiveFrom"
        );


    const to =
        validateDate(
            effectiveTo,
            "effectiveTo",
            {
                allowNull: true
            }
        );


    // ------------------------------------------------------
    // Min / Max validation
    // ------------------------------------------------------

    if (
        min !== null &&
        max !== null &&
        min > max
    ) {

        throw createError(
            "minFee cannot be greater than maxFee."
        );

    }


    // ------------------------------------------------------
    // Effective period validation
    // ------------------------------------------------------

    if (
        to !== null &&
        new Date(to).getTime() <=
        new Date(from).getTime()
    ) {

        throw createError(
            "effectiveTo must be greater than effectiveFrom."
        );

    }


    // ------------------------------------------------------
    // Fee type rules
    // ------------------------------------------------------

    if (
        feeType === "FIXED"
    ) {

        if (
            fixed <= 0
        ) {

            throw createError(
                "fixedFee must be greater than 0 for FIXED fee type."
            );

        }


        if (
            percentage !== 0
        ) {

            throw createError(
                "percentageFee must be 0 for FIXED fee type."
            );

        }

    }


    if (
        feeType === "PERCENTAGE"
    ) {

        if (
            percentage <= 0
        ) {

            throw createError(
                "percentageFee must be greater than 0 for PERCENTAGE fee type."
            );

        }


        if (
            fixed !== 0
        ) {

            throw createError(
                "fixedFee must be 0 for PERCENTAGE fee type."
            );

        }

    }


    if (
        feeType === "HYBRID"
    ) {

        if (
            fixed <= 0 &&
            percentage <= 0
        ) {

            throw createError(
                "HYBRID fee requires fixedFee or percentageFee."
            );

        }

    }


    if (
        feeType === "DYNAMIC"
    ) {

        if (
            fixed <= 0 &&
            percentage <= 0
        ) {

            throw createError(
                "DYNAMIC fee requires a valid fee configuration."
            );

        }

    }


    return {

        fixedFee:
            fixed,

        percentageFee:
            percentage,

        minFee:
            min,

        maxFee:
            max,

        gstPercentage:
            gst

    };

};
// ==========================================================
// Normalize Remarks
// ==========================================================

const normalizeRemarks = (
    remarks
) => {

    if (
        remarks === undefined ||
        remarks === null
    ) {
        return null;
    }

    if (
        typeof remarks !== "string"
    ) {
        throw createError(
            "Invalid remarks."
        );
    }

    const value =
        remarks.trim();

    if (
        value.length > 500
    ) {
        throw createError(
            "Remarks cannot exceed 500 characters."
        );
    }

    return value || null;
};

// ==========================================================
// Normalize Fee
// ==========================================================

const normalizeFee = (
    row
) => {

    if (!row) {
        return null;
    }

    return {

        feeId:
            Number(row.fee_id),

        merchantId:
            Number(row.merchant_id),

        paymentMethod:
            row.payment_method,

        feeType:
            row.fee_type,

        fixedFee:
            Number(row.fixed_fee || 0),

        percentageFee:
            Number(row.percentage_fee || 0),

        minFee:
            Number(row.min_fee || 0),

        maxFee:
            Number(row.max_fee || 0),

        gstPercentage:
            Number(row.gst_percentage || 0),

        effectiveFrom:
            row.effective_from,

        effectiveTo:
            row.effective_to,

        status:
            row.status,

        remarks:
            row.remarks,

        createdBy:
            row.created_by !== null
                ? Number(row.created_by)
                : null,

        updatedBy:
            row.updated_by !== null
                ? Number(row.updated_by)
                : null,

        createdAt:
            row.created_at,

        updatedAt:
            row.updated_at

    };
};


// ==========================================================
// Validate Payment Method
// ==========================================================

const validatePaymentMethod = (
    paymentMethod
) => {

    const allowed = [
        "UPI",
        "CARD",
        "NETBANKING",
        "WALLET",
        "EMI",
        "PAYLATER"
    ];

    if (
        typeof paymentMethod !== "string" ||
        !allowed.includes(
            paymentMethod.trim().toUpperCase()
        )
    ) {

        throw createError(
            "Invalid paymentMethod."
        );
    }

    return paymentMethod
        .trim()
        .toUpperCase();
};


// ==========================================================
// Validate Fee Type
// ==========================================================

const validateFeeType = (
    feeType
) => {

    const allowed = [
        "FIXED",
        "PERCENTAGE",
        "HYBRID"
    ];

    if (
        typeof feeType !== "string" ||
        !allowed.includes(
            feeType.trim().toUpperCase()
        )
    ) {

        throw createError(
            "Invalid feeType."
        );
    }

    return feeType
        .trim()
        .toUpperCase();
};


// ==========================================================
// Validate Status
// ==========================================================

const validateStatus = (
    status
) => {

    const allowed = [
        "ACTIVE",
        "INACTIVE"
    ];

    if (
        typeof status !== "string" ||
        !allowed.includes(
            status.trim().toUpperCase()
        )
    ) {

        throw createError(
            "Invalid status."
        );
    }

    return status
        .trim()
        .toUpperCase();
};


// ==========================================================
// Number Helper
// ==========================================================

const parseFeeNumber = (
    value,
    fieldName,
    defaultValue = 0
) => {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return defaultValue;
    }

    const number =
        Number(value);

    if (
        !Number.isFinite(number) ||
        number < 0
    ) {

        throw createError(
            `Invalid ${fieldName}.`
        );
    }

    return number;
};


// ==========================================================
// Date Helper
// ==========================================================

const normalizeDate = (
    value
) => {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return null;
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        throw createError(
            "Invalid date."
        );
    }

    return date;
};


// ==========================================================
// Validate Fee Data
// ==========================================================

const validateFeeData = (
    feeData,
    isUpdate = false
) => {

    if (
        !feeData ||
        typeof feeData !== "object"
    ) {

        throw createError(
            "Fee data is required."
        );
    }


    const merchantId =
        validateMerchantId(
            feeData.merchantId
        );


    const paymentMethod =
        validatePaymentMethod(
            feeData.paymentMethod
        );


    const feeType =
        validateFeeType(
            feeData.feeType
        );


    const fixedFee =
        parseFeeNumber(
            feeData.fixedFee,
            "fixedFee"
        );


    const percentageFee =
        parseFeeNumber(
            feeData.percentageFee,
            "percentageFee"
        );


    const minFee =
        parseFeeNumber(
            feeData.minFee,
            "minFee"
        );


    const maxFee =
        parseFeeNumber(
            feeData.maxFee,
            "maxFee"
        );


    const gstPercentage =
        parseFeeNumber(
            feeData.gstPercentage,
            "gstPercentage"
        );


    const effectiveFrom =
        normalizeDate(
            feeData.effectiveFrom
        ) || new Date();


    const effectiveTo =
        normalizeDate(
            feeData.effectiveTo
        );


    const status =
        validateStatus(
            feeData.status || "ACTIVE"
        );


    if (
        feeType === "FIXED" &&
        fixedFee <= 0
    ) {

        throw createError(
            "fixedFee must be greater than 0 for FIXED fee."
        );
    }


    if (
        feeType === "PERCENTAGE" &&
        percentageFee <= 0
    ) {

        throw createError(
            "percentageFee must be greater than 0 for PERCENTAGE fee."
        );
    }


    if (
        feeType === "HYBRID" &&
        fixedFee <= 0 &&
        percentageFee <= 0
    ) {

        throw createError(
            "HYBRID fee requires fixedFee or percentageFee."
        );
    }


    if (
        maxFee > 0 &&
        minFee > maxFee
    ) {

        throw createError(
            "minFee cannot be greater than maxFee."
        );
    }


    if (
        effectiveTo &&
        effectiveTo <= effectiveFrom
    ) {

        throw createError(
            "effectiveTo must be greater than effectiveFrom."
        );
    }


    return {

        merchantId,

        paymentMethod,

        feeType,

        fixedFee,

        percentageFee,

        minFee,

        maxFee,

        gstPercentage,

        effectiveFrom,

        effectiveTo,

        status,

        remarks:
            feeData.remarks !== undefined &&
            feeData.remarks !== null
                ? String(
                    feeData.remarks
                ).trim()
                : null,

        createdBy:
            feeData.createdBy !== undefined
                ? validatePositiveInteger(
                    feeData.createdBy,
                    "createdBy"
                )
                : null,

        updatedBy:
            feeData.updatedBy !== undefined
                ? validatePositiveInteger(
                    feeData.updatedBy,
                    "updatedBy"
                )
                : null

    };
};


// ==========================================================
// Create Merchant Fee
// ==========================================================

const createMerchantFee = async (
    feeData
) => {

    const data =
        validateFeeData(
            feeData
        );


    const [overlapRows] =
        await db.query(
            QUERIES.CHECK_FEE_OVERLAP,
            [
                data.merchantId,
                data.paymentMethod,
                0,
                data.effectiveTo,
                data.effectiveFrom
            ]
        );


    if (
        overlapRows.length
    ) {

        throw createError(
            "An active fee already exists for this merchant and payment method during the specified period.",
            "FEE_OVERLAP"
        );
    }


    const [result] =
        await db.query(
            QUERIES.CREATE_FEE,
            [

                data.merchantId,

                data.paymentMethod,

                data.feeType,

                data.fixedFee,

                data.percentageFee,

                data.minFee,

                data.maxFee,

                data.gstPercentage,

                data.effectiveFrom,

                data.effectiveTo,

                data.status,

                data.remarks,

                data.createdBy

            ]
        );


    if (
        !result.insertId
    ) {

        throw createError(
            "Failed to create merchant fee.",
            "FEE_CREATE_FAILED"
        );
    }


    return await getMerchantFeeById(
        result.insertId
    );
};


// ==========================================================
// Get Merchant Fee By ID
// ==========================================================

const getMerchantFeeById = async (
    feeId
) => {

    const id =
        validateFeeId(
            feeId
        );


    const [rows] =
        await db.query(
            QUERIES.GET_FEE_BY_ID,
            [id]
        );


    if (
        !rows.length
    ) {

        throw createError(
            "Merchant fee not found.",
            "FEE_NOT_FOUND"
        );
    }


    return normalizeFee(
        rows[0]
    );
};


// ==========================================================
// Get All Merchant Fees
// ==========================================================

const getAllMerchantFees = async (
    {
        page = 1,
        limit = 20
    } = {}
) => {

    const safePage =
        Math.max(
            Number(page) || 1,
            1
        );


    const safeLimit =
        Math.min(
            Math.max(
                Number(limit) || 20,
                1
            ),
            100
        );


    const offset =
        (
            safePage - 1
        ) *
        safeLimit;


    const [
        [rows],
        [countRows]
    ] =
        await Promise.all([

            db.query(
                QUERIES.GET_ALL_FEES,
                [
                    safeLimit,
                    offset
                ]
            ),

            db.query(
                QUERIES.COUNT_ALL_FEES
            )

        ]);


    const total =
        Number(
            countRows[0]?.total || 0
        );


    return {

        data:
            rows.map(
                normalizeFee
            ),

        pagination: {

            page:
                safePage,

            limit:
                safeLimit,

            total,

            totalPages:
                Math.ceil(
                    total /
                    safeLimit
                )

        }

    };
};


// ==========================================================
// Get Fees Of Specific Merchant
// ==========================================================

const getMerchantFees = async (
    merchantId
) => {

    const id =
        validateMerchantId(
            merchantId
        );


    const [rows] =
        await db.query(
            QUERIES.GET_MERCHANT_FEES,
            [id]
        );


    return rows.map(
        normalizeFee
    );
};


// ==========================================================
// Get Merchant Fee By Payment Method
// ==========================================================

const getMerchantFeeByMethod = async (
    merchantId,
    paymentMethod
) => {

    const id =
        validateMerchantId(
            merchantId
        );


    const method =
        validatePaymentMethod(
            paymentMethod
        );


    const [rows] =
        await db.query(
            QUERIES.GET_MERCHANT_FEE_BY_METHOD,
            [
                id,
                method
            ]
        );


    if (
        !rows.length
    ) {

        throw createError(
            "Merchant fee not found.",
            "FEE_NOT_FOUND"
        );
    }


    return normalizeFee(
        rows[0]
    );
};


// ==========================================================
// Get Currently Active Fee
// ==========================================================

const getActiveMerchantFee = async (
    merchantId,
    paymentMethod
) => {

    const id =
        validateMerchantId(
            merchantId
        );


    const method =
        validatePaymentMethod(
            paymentMethod
        );


    const [rows] =
        await db.query(
            QUERIES.GET_ACTIVE_FEE,
            [
                id,
                method
            ]
        );


    if (
        !rows.length
    ) {

        throw createError(
            "No active fee found for this merchant and payment method.",
            "ACTIVE_FEE_NOT_FOUND"
        );
    }


    return normalizeFee(
        rows[0]
    );
};


// ==========================================================
// Update Merchant Fee
// ==========================================================

// ==========================================================
// Update Merchant Fee
// ==========================================================

const updateMerchantFee = async (
    feeId,
    feeData
) => {

    const id =
        validateFeeId(
            feeId
        );


    if (
        !feeData ||
        typeof feeData !== "object"
    ) {

        throw createError(
            "Fee data is required."
        );
    }


    // ------------------------------------------------------
    // Get existing fee
    // ------------------------------------------------------

    const existing =
        await getMerchantFeeById(
            id
        );


    // ------------------------------------------------------
    // Merchant ID is immutable
    // ------------------------------------------------------

    const merchantId =
        existing.merchantId;


    // ------------------------------------------------------
    // Merge existing values with update payload
    // ------------------------------------------------------

    const paymentMethod =
        feeData.paymentMethod !== undefined
            ? feeData.paymentMethod
            : existing.paymentMethod;


    const feeType =
        feeData.feeType !== undefined
            ? feeData.feeType
            : existing.feeType;


    const fixedFee =
        feeData.fixedFee !== undefined
            ? feeData.fixedFee
            : existing.fixedFee;


    const percentageFee =
        feeData.percentageFee !== undefined
            ? feeData.percentageFee
            : existing.percentageFee;


    const minFee =
        feeData.minFee !== undefined
            ? feeData.minFee
            : existing.minFee;


    const maxFee =
        feeData.maxFee !== undefined
            ? feeData.maxFee
            : existing.maxFee;


    const gstPercentage =
        feeData.gstPercentage !== undefined
            ? feeData.gstPercentage
            : existing.gstPercentage;


    const effectiveFrom =
        feeData.effectiveFrom !== undefined
            ? feeData.effectiveFrom
            : existing.effectiveFrom;


    const effectiveTo =
        feeData.effectiveTo !== undefined
            ? feeData.effectiveTo
            : existing.effectiveTo;


    const status =
        feeData.status !== undefined
            ? feeData.status
            : existing.status;


    const remarks =
        feeData.remarks !== undefined
            ? feeData.remarks
            : existing.remarks;


    const updatedBy =
        validatePositiveInteger(
            feeData.updatedBy,
            "updatedBy"
        );


    // ------------------------------------------------------
    // Validate normalized configuration
    // ------------------------------------------------------

    const normalizedPaymentMethod =
        validatePaymentMethod(
            paymentMethod
        );


    const normalizedFeeType =
        validateFeeType(
            feeType
        );


    const normalizedFixedFee =
        validateMoney(
            fixedFee,
            "fixedFee"
        );


    const normalizedPercentageFee =
        validatePercentage(
            percentageFee,
            "percentageFee"
        );


    const normalizedMinFee =
        validateMoney(
            minFee,
            "minFee",
            {
                allowNull: true
            }
        );


    const normalizedMaxFee =
        validateMoney(
            maxFee,
            "maxFee",
            {
                allowNull: true
            }
        );


    const normalizedGst =
        validatePercentage(
            gstPercentage,
            "gstPercentage"
        );


    const normalizedEffectiveFrom =
        validateDate(
            effectiveFrom,
            "effectiveFrom"
        );


    const normalizedEffectiveTo =
        validateDate(
            effectiveTo,
            "effectiveTo",
            {
                allowNull: true
            }
        );


    const normalizedStatus =
        validateStatus(
            status
        );


    const normalizedRemarks =
        normalizeRemarks(
            remarks
        );


    // ------------------------------------------------------
    // Business validation
    // ------------------------------------------------------

    validateFeeConfiguration({

        feeType:
            normalizedFeeType,

        fixedFee:
            normalizedFixedFee,

        percentageFee:
            normalizedPercentageFee,

        minFee:
            normalizedMinFee,

        maxFee:
            normalizedMaxFee,

        gstPercentage:
            normalizedGst,

        effectiveFrom:
            normalizedEffectiveFrom,

        effectiveTo:
            normalizedEffectiveTo

    });


    // ------------------------------------------------------
    // Check overlap
    // ------------------------------------------------------

    if (
        normalizedStatus === "ACTIVE"
    ) {

        const [
            overlapRows
        ] =
            await db.query(
                QUERIES.CHECK_FEE_OVERLAP,
                [

                    merchantId,

                    normalizedPaymentMethod,

                    id,

                    normalizedEffectiveTo,

                    normalizedEffectiveFrom

                ]
            );


        if (
            overlapRows.length > 0
        ) {

            throw createError(
                "Another active fee configuration already overlaps for this merchant and payment method.",
                "FEE_OVERLAP"
            );
        }
    }


    // ------------------------------------------------------
    // Update
    // ------------------------------------------------------

    const [
        result
    ] =
        await db.query(
            QUERIES.UPDATE_FEE,
            [

                normalizedPaymentMethod,

                normalizedFeeType,

                normalizedFixedFee,

                normalizedPercentageFee,

                normalizedMinFee,

                normalizedMaxFee,

                normalizedGst,

                normalizedEffectiveFrom,

                normalizedEffectiveTo,

                normalizedStatus,

                normalizedRemarks,

                updatedBy,

                id

            ]
        );


    if (
        result.affectedRows === 0
    ) {

        throw createError(
            "Merchant fee could not be updated.",
            "FEE_UPDATE_FAILED"
        );
    }


    return await getMerchantFeeById(
        id
    );
};


// ==========================================================
// Update Merchant Fee Status
// ==========================================================

const updateMerchantFeeStatus = async (
    feeId,
    status,
    adminId
) => {

    const id =
        validateFeeId(
            feeId
        );


    const normalizedStatus =
        validateStatus(
            status
        );


    const updatedBy =
        validatePositiveInteger(
            adminId,
            "adminId"
        );


    const existing =
        await getMerchantFeeById(
            id
        );


    if (
        normalizedStatus ===
        "ACTIVE"
    ) {

        const [overlapRows] =
            await db.query(
                QUERIES.CHECK_FEE_OVERLAP,
                [

                    existing.merchantId,

                    existing.paymentMethod,

                    id,

                    existing.effectiveTo,

                    existing.effectiveFrom

                ]
            );


        if (
            overlapRows.length
        ) {

            throw createError(
                "Another active fee already exists for this merchant and payment method.",
                "FEE_OVERLAP"
            );
        }
    }


    const [result] =
        await db.query(
            QUERIES.UPDATE_FEE_STATUS,
            [

                normalizedStatus,

                updatedBy,

                id

            ]
        );


    if (
        result.affectedRows === 0
    ) {

        throw createError(
            "Merchant fee status was not updated.",
            "FEE_STATUS_UPDATE_FAILED"
        );
    }


    return await getMerchantFeeById(
        id
    );
};


// ==========================================================
// Delete Merchant Fee
// ==========================================================

const deleteMerchantFee = async (
    feeId
) => {

    const id =
        validateFeeId(
            feeId
        );


    await getMerchantFeeById(
        id
    );


    const [result] =
        await db.query(
            QUERIES.DELETE_FEE,
            [id]
        );


    if (
        result.affectedRows === 0
    ) {

        throw createError(
            "Merchant fee could not be deleted.",
            "FEE_DELETE_FAILED"
        );
    }


    return {

        feeId: id,

        deleted: true

    };
};


// ==========================================================
// Export
// ==========================================================

module.exports = {

    createMerchantFee,

    getMerchantFeeById,

    getAllMerchantFees,

    getMerchantFees,

    getMerchantFeeByMethod,

    getActiveMerchantFee,

    updateMerchantFee,

    updateMerchantFeeStatus,

    deleteMerchantFee

};