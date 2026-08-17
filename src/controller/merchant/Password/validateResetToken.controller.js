const crypto =
    require("crypto");

const redis =
    require("../../../config/redis");

const {
    getMerchantSecurityLock
} =
    require("../../../services/security/securityLock.service");


const validateResetToken = async (
    req,
    res
) => {

    try {

        const {
            token
        } = req.query;


        if (
            !token ||
            typeof token !== "string" ||
            token.length < 32
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid reset token."

            });

        }


        // ==================================================
        // Hash Token
        // ==================================================

        const tokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");


        const session =
            await redis.get(

                `password-reset:session:${tokenHash}`

            );


        if (!session) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid or expired reset link."

            });

        }


        let sessionData;


        try {

            sessionData =
                JSON.parse(session);

        } catch {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid reset session."

            });

        }


        const merchantId =
            sessionData.merchantId;


        if (!merchantId) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid reset session."

            });

        }


        // ==================================================
        // Central Security Lock
        // ==================================================

        const securityLock =
            await getMerchantSecurityLock(
                merchantId
            );


        if (securityLock) {

            return res.status(423).json({

                success: false,

                message:
                    "Password recovery is temporarily unavailable. Please try again later.",

                retryAfter:
                    securityLock.retryAfter

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Reset link is valid."

        });


    } catch (error) {

        console.error(
            "Validate Reset Token Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal Server Error."

        });

    }

};


module.exports =
    validateResetToken;