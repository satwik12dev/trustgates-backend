// ==========================================================
// Admin Merchant Fee Management Controller
// ==========================================================

const merchantFeeService = require(
    "../../services/adminFee/merchantFee.service"
);


// ==========================================================
// Helpers
// ==========================================================

const createError = (
    message,
    code = "BAD_REQUEST"
) => {

    const error =
        new Error(message);

    error.code =
        code;

    return error;
};


const validatePositiveInteger = (
    value,
    fieldName
) => {

    const normalized =
        String(value ?? "").trim();

    if (
        !/^[1-9]\d*$/.test(normalized)
    ) {
        throw createError(
            `Invalid ${fieldName}.`
        );
    }

    const number =
        Number(normalized);

    if (
        !Number.isSafeInteger(number) ||
        number <= 0
    ) {
        throw createError(
            `Invalid ${fieldName}.`
        );
    }

    return number;
};


const validateFeeId = (
    value
) => {

    return validatePositiveInteger(
        value,
        "feeId"
    );
};


const validateMerchantId = (
    value
) => {

    return validatePositiveInteger(
        value,
        "merchantId"
    );
};


const validateAdminId = (
    value
) => {

    const adminId =
        Number(value);

    if (
        !Number.isSafeInteger(adminId) ||
        adminId <= 0
    ) {
        throw createError(
            "Invalid admin session.",
            "UNAUTHORIZED"
        );
    }

    return adminId;
};


const validatePaymentMethod = (
    value
) => {

    const paymentMethod =
        String(value ?? "")
            .trim()
            .toUpperCase();

    const allowedMethods = [
        "UPI",
        "CARD",
        "NETBANKING",
        "WALLET",
        "EMI",
        "PAYLATER"
    ];

    if (
        !allowedMethods.includes(
            paymentMethod
        )
    ) {
        throw createError(
            "Invalid payment method."
        );
    }

    return paymentMethod;
};


// ==========================================================
// Create Merchant Fee
// ==========================================================

const createMerchantFee = async (
    req,
    res,
    next
) => {

    try {

        const adminId =
            validateAdminId(
                req.admin?.admin_id
            );


        const feeData = {

            ...req.body,

            createdBy:
                adminId

        };


        const result =
            await merchantFeeService.createMerchantFee(
                feeData
            );


        return res.status(201).json({

            success: true,

            message:
                "Merchant fee created successfully.",

            data:
                result

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// Get Fee By ID
// ==========================================================

const getMerchantFeeById = async (
    req,
    res,
    next
) => {

    try {

        const feeId =
            validateFeeId(
                req.params?.feeId
            );


        const result =
            await merchantFeeService.getMerchantFeeById(
                feeId
            );


        return res.status(200).json({

            success: true,

            message:
                "Merchant fee fetched successfully.",

            data:
                result

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// Get All Merchant Fees
// ==========================================================

const getAllMerchantFees = async (
    req,
    res,
    next
) => {

    try {

        const page =
            validatePositiveInteger(
                req.query?.page || 1,
                "page"
            );


        const limit =
            validatePositiveInteger(
                req.query?.limit || 20,
                "limit"
            );


        if (limit > 100) {

            throw createError(
                "Limit cannot exceed 100."
            );

        }


        const result =
            await merchantFeeService.getAllMerchantFees({

                page,

                limit

            });


        return res.status(200).json({

            success: true,

            message:
                "Merchant fees fetched successfully.",

            data:
                result

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// Get Fees Of Specific Merchant
// ==========================================================

const getMerchantFees = async (
    req,
    res,
    next
) => {

    try {

        const merchantId =
            validateMerchantId(
                req.params?.merchantId
            );


        const result =
            await merchantFeeService.getMerchantFees(
                merchantId
            );


        return res.status(200).json({

            success: true,

            message:
                "Merchant fees fetched successfully.",

            data:
                result

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// Get Merchant Fee By Payment Method
// ==========================================================

const getMerchantFeeByMethod = async (
    req,
    res,
    next
) => {

    try {

        const merchantId =
            validateMerchantId(
                req.params?.merchantId
            );


        const paymentMethod =
            validatePaymentMethod(
                req.params?.paymentMethod
            );


        const result =
            await merchantFeeService.getMerchantFeeByMethod(
                merchantId,
                paymentMethod
            );


        return res.status(200).json({

            success: true,

            message:
                "Merchant fee fetched successfully.",

            data:
                result

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// Get Currently Active Fee
// ==========================================================

const getActiveMerchantFee = async (
    req,
    res,
    next
) => {

    try {

        const merchantId =
            validateMerchantId(
                req.params?.merchantId
            );


        const paymentMethod =
            validatePaymentMethod(
                req.params?.paymentMethod
            );


        const result =
            await merchantFeeService.getActiveMerchantFee(
                merchantId,
                paymentMethod
            );


        return res.status(200).json({

            success: true,

            message:
                "Active merchant fee fetched successfully.",

            data:
                result

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// Update Merchant Fee
// ==========================================================

const updateMerchantFee = async (
    req,
    res,
    next
) => {

    try {

        const feeId =
            validateFeeId(
                req.params?.feeId
            );


        const adminId =
            validateAdminId(
                req.admin?.admin_id
            );


        const feeData = {

            ...req.body,

            updatedBy:
                adminId

        };


        const result =
            await merchantFeeService.updateMerchantFee(
                feeId,
                feeData
            );


        return res.status(200).json({

            success: true,

            message:
                "Merchant fee updated successfully.",

            data:
                result

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// Update Merchant Fee Status
// ==========================================================

const updateMerchantFeeStatus = async (
    req,
    res,
    next
) => {

    try {

        const feeId =
            validateFeeId(
                req.params?.feeId
            );


        const adminId =
            validateAdminId(
                req.admin?.admin_id
            );


        const status =
            String(
                req.body?.status ?? ""
            )
                .trim()
                .toUpperCase();


        if (
            ![
                "ACTIVE",
                "INACTIVE"
            ].includes(status)
        ) {

            throw createError(
                "Invalid fee status."
            );

        }


        const result =
            await merchantFeeService.updateMerchantFeeStatus(
                feeId,
                status,
                adminId
            );


        return res.status(200).json({

            success: true,

            message:
                "Merchant fee status updated successfully.",

            data:
                result

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// Delete Merchant Fee
// ==========================================================

const deleteMerchantFee = async (
    req,
    res,
    next
) => {

    try {

        const feeId =
            validateFeeId(
                req.params?.feeId
            );


        const result =
            await merchantFeeService.deleteMerchantFee(
                feeId
            );


        return res.status(200).json({

            success: true,

            message:
                "Merchant fee deleted successfully.",

            data:
                result

        });

    } catch (error) {

        next(error);

    }

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