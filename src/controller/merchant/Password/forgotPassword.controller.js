const crypto = require("crypto");

const pool =
    require("../../../config/pool");

const redis =
    require("../../../config/redis");

const sendEmail2 =
    require("../../../services/pass.service");

const {
    getMerchantSecurityLock
} =
    require("../../../services/security/securityLock.service");


const forgotPassword = async (
    req,
    res
) => {

    const connection =
        await pool.getConnection();


    try {

        let {
            email
        } = req.body;


        email =
            String(email || "")
                .trim()
                .toLowerCase();


        // ==================================================
        // Validation
        // ==================================================

        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Email is required."

            });

        }


        // ==================================================
        // Find Merchant
        // ==================================================

        const [
            merchantRows
        ] = await connection.query(

            `
                SELECT

                    merchant_id,
                    email,
                    account_status,
                    email_verified

                FROM merchants

                WHERE email = ?

                LIMIT 1
            `,

            [
                email
            ]

        );


        // ==================================================
        // Generic Response
        // ==================================================

        if (
            !merchantRows.length
        ) {

            return res.status(200).json({

                success: true,

                message:
                    "If an account exists, a password reset link has been sent."

            });

        }


        const merchant =
            merchantRows[0];


        const merchantId =
            merchant.merchant_id;


        // ==================================================
        // CENTRAL SECURITY LOCK
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


        // ==================================================
        // Email Verification
        // ==================================================

        if (
            !merchant.email_verified
        ) {

            return res.status(200).json({

                success: true,

                message:
                    "If an account exists, a password reset link has been sent."

            });

        }


        // ==================================================
        // Account Status
        // ==================================================

        if (
            merchant.account_status !==
            "ACTIVE"
        ) {

            return res.status(200).json({

                success: true,

                message:
                    "If an account exists, a password reset link has been sent."

            });

        }


        // ==================================================
        // Reset Token
        // ==================================================

        const resetToken =
            crypto
                .randomBytes(48)
                .toString("hex");


        // ==================================================
        // Hash Token
        // ==================================================

        const tokenHash =
            crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");


        // ==================================================
        // Store Session
        // ==================================================

        await redis.set(

            `password-reset:session:${tokenHash}`,

            JSON.stringify({

                merchantId,

                email:
                    merchant.email

            }),

            {
                EX: 600
            }

        );


        // ==================================================
        // Reset Link
        // ==================================================

        const resetLink =
            `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;


        // ==================================================
        // Send Email
        // ==================================================

        await sendEmail2({

            to:
                merchant.email,

            subject:
                "Reset Your Password",

            html: `

                <h2>Password Reset</h2>

                <p>
                    We received a request to reset your password.
                </p>

                <p>
                    <a href="${resetLink}">
                        Reset Password
                    </a>
                </p>

                <p>
                    This link expires in 10 minutes.
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
                "If an account exists, a password reset link has been sent."

        });


    } catch (error) {

        console.error(
            "Forgot Password Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal Server Error."

        });

    } finally {

        connection.release();

    }

};


module.exports =
    forgotPassword;