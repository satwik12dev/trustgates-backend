const {
    getAllMerchantKycService,
    getMerchantKycByIdService,
    getKycByIdService
} = require(
    "../../../services/admin/kyc/getKyc.service"
);


// ==========================================================
// Get All Merchant KYC
// ==========================================================

const getAllMerchantKyc = async (
    req,
    res,
    next
) => {

    try {

        const result =
            await getAllMerchantKycService();

        return res.status(200).json({

            success: true,

            message:
                "Merchant KYC records fetched successfully.",

            data:
                result

        });

    } catch (error) {

        next(error);

    }

};


// ==========================================================
// Get KYC By Merchant ID
// ==========================================================

const getMerchantKycById = async (
    req,
    res,
    next
) => {

    try {

        const merchantId =
            Number(
                req.params.merchantId
            );


        if (
            !Number.isInteger(merchantId) ||
            merchantId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid merchant ID."

            });

        }


        const result =
            await getMerchantKycByIdService(
                merchantId
            );


        if (!result) {

            return res.status(404).json({

                success: false,

                message:
                    "Merchant KYC record not found."

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Merchant KYC fetched successfully.",

            data:
                result

        });

    } catch (error) {

        next(error);

    }

};

const getKycById = async (
    req,
    res,
    next
) => {

    try {

        const kycId =
            Number(req.params.kycId);

        if (
            !Number.isInteger(kycId) ||
            kycId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid KYC ID."

            });

        }

        const result =
            await getKycByIdService(
                kycId
            );

        if (!result) {

            return res.status(404).json({

                success: false,

                message:
                    "KYC record not found."

            });

        }

        return res.status(200).json({

            success: true,

            message:
                "Merchant KYC fetched successfully.",

            data: result

        });

    } catch (error) {

        next(error);

    }

};

module.exports = {

    getAllMerchantKyc,

    getMerchantKycById,

    getKycById

};