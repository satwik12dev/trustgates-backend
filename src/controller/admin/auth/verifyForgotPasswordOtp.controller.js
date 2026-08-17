const verifyForgotPasswordOtpValidation =
    require(
        "../../../validations/admin/verifyForgotPasswordOtp.validation"
    );

const {
    verifyForgotPasswordOtpService
} = require(
    "../../../services/admin/password/verifyForgotPasswordOtp.service"
);


const verifyForgotPasswordOtpController =
    async (
        req,
        res,
        next
    ) => {

        try {

            const {
                error,
                value
            } =
                verifyForgotPasswordOtpValidation.validate(
                    req.body,
                    {
                        abortEarly: true,
                        stripUnknown: true
                    }
                );


            if (error) {

                return res.status(400).json({
                    success: false,
                    code:
                        "INVALID_OTP_REQUEST",
                    message:
                        error.details[0].message
                });
            }


            const result =
                await verifyForgotPasswordOtpService(
                    value.email,
                    value.otp
                );


            return res.status(200).json({
                success: true,
                message:
                    result.message,
                resetToken:
                    result.resetToken
            });


        } catch (error) {

            if (
                error.message ===
                "OTP expired or not found."
            ) {

                return res.status(400).json({
                    success: false,
                    code:
                        "OTP_EXPIRED",
                    message:
                        "OTP has expired or is no longer valid."
                });
            }


            if (
                error.message ===
                "Invalid OTP."
            ) {

                return res.status(400).json({
                    success: false,
                    code:
                        "INVALID_OTP",
                    message:
                        "Invalid OTP."
                });
            }


            if (
                error.message ===
                "OTP verification attempts exceeded."
            ) {

                return res.status(429).json({
                    success: false,
                    code:
                        "OTP_ATTEMPTS_EXCEEDED",
                    message:
                        "Too many incorrect OTP attempts. Please request a new OTP."
                });
            }


            if (
                error.message ===
                "Admin account not found."
            ) {

                return res.status(400).json({
                    success: false,
                    code:
                        "INVALID_OTP",
                    message:
                        "Invalid OTP."
                });
            }


            if (
                error.message ===
                "Admin account is inactive."
            ) {

                return res.status(400).json({
                    success: false,
                    code:
                        "INVALID_OTP",
                    message:
                        "Invalid OTP."
                });
            }


            if (
                error.message ===
                "Invalid OTP request."
            ) {

                return res.status(400).json({
                    success: false,
                    code:
                        "INVALID_OTP_REQUEST",
                    message:
                        "Invalid OTP request."
                });
            }


            next(error);
        }
    };


module.exports =
    verifyForgotPasswordOtpController;