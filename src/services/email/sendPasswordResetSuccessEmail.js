const transporter = require("../../config/brevo");

const sendPasswordResetSuccessEmail = async (
    email,
    merchantName
) => {

    const greeting = merchantName
        ? `Hi <strong>${merchantName}</strong>,`
        : `Hello,`;

    await transporter.sendMail({

        from: `"Trust Gates Support" <${process.env.BREVO_SENDER_EMAIL}>`,

        to: email,

        subject: "Password Reset Successfully - Trust Gates",

        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
        </head>

        <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">

            <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                <tr>
                    <td align="center">

                        <table width="600" cellpadding="0" cellspacing="0"
                            style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

                            <tr>
                                <td style="background:#0F172A;padding:24px;text-align:center;">
                                    <h2 style="color:#ffffff;margin:0;font-size:22px;">
                                        Password Reset Successful
                                    </h2>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:32px;color:#333333;line-height:1.7;">

                                    <p>${greeting}</p>

                                    <p>
                                        Your password for your <strong>Trust Gates</strong> account has been reset successfully.
                                    </p>

                                    <div style="background:#F0FDF4;border-left:4px solid #16A34A;padding:16px;margin:24px 0;">
                                        <strong style="color:#166534;">Your Account is Secure</strong>
                                        <p style="margin:8px 0 0;font-size:14px;color:#166534;">
                                            You can now log in using your new password. For security reasons, all active sessions and refresh tokens have been revoked.
                                        </p>
                                    </div>

                                    <div style="background:#FFF8E1;border-left:4px solid #F59E0B;padding:16px;margin:24px 0;">
                                        <strong style="color:#92400E;">Didn't request this change?</strong>
                                        <p style="margin:8px 0 0;font-size:14px;color:#92400E;">
                                            If you did not perform this password reset, please contact Trust Gates support immediately to protect your account.
                                        </p>
                                    </div>

                                    <br>

                                    <p>
                                        Regards,<br>
                                        <strong>Trust Gates Support Team</strong>
                                    </p>

                                </td>
                            </tr>

                            <tr>
                                <td style="background:#f8f8f8;padding:18px;text-align:center;font-size:13px;color:#777;">
                                    © ${new Date().getFullYear()} Trust Gates. All rights reserved.
                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>

        </body>
        </html>
        `

    });

};

module.exports = sendPasswordResetSuccessEmail;
