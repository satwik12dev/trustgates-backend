const crypto = require("crypto");

const redis =
    require("../../../config/redis");

const sendEmail2 =
    require("../../../services/pass.service");


const requestPasswordChange = async (
    req,
    res
) => {

    try {

        const {
            token
        } = req.body;


        // ==================================================
        // Validate Input
        // ==================================================

        if (!token) {

            return res.status(400).json({

                success: false,

                message:
                    "Reset token is required."

            });

        }


        // ==================================================
        // Hash Reset Token
        // ==================================================

        const tokenHash =
            crypto
                .createHash("sha256")
                .update(String(token))
                .digest("hex");


        const sessionKey =
            `password-reset:session:${tokenHash}`;


        // ==================================================
        // Get Reset Session
        // ==================================================

        const session =
            await redis.get(
                sessionKey
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

        const email =
            sessionData.email;


        if (
            !merchantId ||
            !email
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid reset session."

            });

        }


        // ==================================================
        // Generate Secure OTP
        // ==================================================

        const otp =
            crypto.randomInt(
                100000,
                1000000
            ).toString();


        // ==================================================
        // Hash OTP
        // ==================================================

        const otpHash =
            crypto
                .createHash("sha256")
                .update(otp)
                .digest("hex");


        // ==================================================
        // OTP Redis Keys
        // ==================================================

        const otpKey =
            `password-reset:otp:${tokenHash}`;

        const attemptsKey =
            `password-reset:attempts:${tokenHash}`;


        // ==================================================
        // Store OTP
        // ==================================================

        await redis.set(

            otpKey,

            otpHash,

            {
                EX: 600
            }

        );


        // Reset attempts
        await redis.del(
            attemptsKey
        );


        // ==================================================
        // Send OTP
        // ==================================================

        await sendEmail2({

            to:
                email,

            subject:
                "Password Reset Verification OTP",

            html: `

                <h2>Password Reset Verification</h2>

                <p>
                    Your password reset OTP is:
                </p>

                <h1>
                    ${otp}
                </h1>

                <p>
                    This OTP expires in 10 minutes.
                </p>

                <p>
                    If you didn't request this,
                    please ignore this email.
                </p>

            `

        });


        return res.status(200).json({

            success: true,

            message:
                "OTP sent successfully."

        });


    } catch (error) {

        console.error(
            "Request Password Change Error:",
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
    requestPasswordChange;