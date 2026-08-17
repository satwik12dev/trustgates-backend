const crypto =
    require("crypto");

const bcrypt =
    require("bcrypt");

const pool =
    require("../../../config/pool");

const redis =
    require("../../../config/redis");

const {
    getMerchantSecurityLock
} =
    require("../../../services/security/securityLock.service");


const verifyPasswordReset = async (
    req,
    res
) => {

    const connection =
        await pool.getConnection();


    try {

        const {
            token,
            otp,
            newPassword,
            confirmPassword
        } = req.body;


        // ==================================================
        // Input Validation
        // ==================================================

        if (
            !token ||
            !otp ||
            !newPassword ||
            !confirmPassword
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Token, OTP, new password and confirm password are required."

            });

        }


        // ==================================================
        // OTP Validation
        // ==================================================

        const otpString =
            String(otp).trim();


        if (
            !/^\d{6}$/.test(
                otpString
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "OTP must be a valid 6-digit number."

            });

        }


        // ==================================================
        // Password Match
        // ==================================================

        if (
            newPassword !==
            confirmPassword
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Passwords do not match."

            });

        }


        // ==================================================
        // Password Policy
        // ==================================================

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/;


        if (
            !passwordRegex.test(
                newPassword
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character."

            });

        }


        // ==================================================
        // Hash Reset Token
        // ==================================================

        const tokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");


        const sessionKey =
            `password-reset:session:${tokenHash}`;


        // ==================================================
        // Get Session
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


        // ==================================================
        // OTP Attempts
        // ==================================================

        const attemptsKey =
            `password-reset:attempts:${tokenHash}`;


        const attempts =
            Number(
                await redis.get(
                    attemptsKey
                )
            ) || 0;


        if (
            attempts >= 3
        ) {

            // Invalidate entire reset session
            await redis.del(

                sessionKey,

                `password-reset:otp:${tokenHash}`,

                attemptsKey

            );


            return res.status(429).json({

                success: false,

                message:
                    "Maximum OTP attempts exceeded. Please start a new password reset process."

            });

        }


        // ==================================================
        // Stored OTP
        // ==================================================

        const storedOtpHash =
            await redis.get(

                `password-reset:otp:${tokenHash}`

            );


        if (!storedOtpHash) {

            return res.status(400).json({

                success: false,

                message:
                    "OTP has expired. Please request a new password reset."

            });

        }


        // ==================================================
        // Validate Hash
        // ==================================================

        if (
            !/^[a-f0-9]{64}$/i.test(
                storedOtpHash
            )
        ) {

            return res.status(500).json({

                success: false,

                message:
                    "Invalid OTP data."

            });

        }


        // ==================================================
        // Hash Incoming OTP
        // ==================================================

        const incomingHash =
            crypto
                .createHash("sha256")
                .update(otpString)
                .digest("hex");


        // ==================================================
        // Timing Safe Compare
        // ==================================================

        const otpMatched =
            crypto.timingSafeEqual(

                Buffer.from(
                    storedOtpHash,
                    "hex"
                ),

                Buffer.from(
                    incomingHash,
                    "hex"
                )

            );


        // ==================================================
        // WRONG OTP
        // ==================================================

        if (!otpMatched) {

            const newAttempts =
                attempts + 1;


            if (
                newAttempts >= 3
            ) {

                // ------------------------------------------
                // Destroy reset session
                // ------------------------------------------

                await redis.del(

                    sessionKey,

                    `password-reset:otp:${tokenHash}`,

                    attemptsKey

                );


                return res.status(429).json({

                    success: false,

                    message:
                        "Maximum OTP attempts exceeded. Please start a new password reset process."

                });

            }


            await redis.set(

                attemptsKey,

                String(newAttempts),

                {
                    EX: 600
                }

            );


            return res.status(400).json({

                success: false,

                message:
                    "Invalid OTP.",

                remainingAttempts:
                    3 - newAttempts

            });

        }


        // ==================================================
        // Hash New Password
        // ==================================================

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                12
            );


        // ==================================================
        // Database Transaction
        // ==================================================

        await connection.beginTransaction();


        // ==================================================
        // Update Password
        // ==================================================

        const [
            updateResult
        ] = await connection.query(

            `
                UPDATE merchants

                SET password_hash = ?

                WHERE merchant_id = ?

                LIMIT 1
            `,

            [
                hashedPassword,
                merchantId
            ]

        );


        if (
            updateResult.affectedRows !== 1
        ) {

            throw new Error(
                "Password update failed."
            );

        }


        // ==================================================
        // Revoke ALL Refresh Tokens
        // ==================================================

        await connection.query(

            `
                UPDATE refresh_tokens

                SET revoked = 1

                WHERE merchant_id = ?

                  AND revoked = 0
            `,

            [
                merchantId
            ]

        );


        // ==================================================
        // Commit
        // ==================================================

        await connection.commit();


        // ==================================================
        // Cleanup Redis
        // ==================================================

        await redis.del(

            sessionKey,

            `password-reset:otp:${tokenHash}`,

            attemptsKey

        );


        return res.status(200).json({

            success: true,

            message:
                "Password reset successfully. Please login again."

        });


    } catch (error) {

        try {

            await connection.rollback();

        } catch (rollbackError) {

            console.error(
                "Rollback Error:",
                rollbackError
            );

        }


        console.error(
            "Verify Password Reset Error:",
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
    verifyPasswordReset;