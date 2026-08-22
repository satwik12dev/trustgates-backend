const transporter = require("../../config/brevo");

const sendForgotPasswordEmail = async (
    email,
    resetLink,
    merchantName
) => {

    const greeting = merchantName
        ? `Hi <strong>${merchantName}</strong>,`
        : `Hello,`;

    await transporter.sendMail({

        from: `"Trust Gates Support" <${process.env.BREVO_SENDER_EMAIL}>`,

        to: email,

        subject: "Reset Your Password - Trust Gates",

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
                                        Reset Your Password
                                    </h2>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:32px;color:#333333;line-height:1.7;">

                                    <p>${greeting}</p>

                                    <p>
                                        We received a request to reset the password for your Trust Gates account. Click the button below to set a new password:
                                    </p>

                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
                                        <tr>
                                            <td align="center">
                                                <a href="${resetLink}"
                                                    style="display:inline-block;background:#2563EB;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:15px;font-weight:bold;">
                                                    Reset Password
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                    <div style="background:#FFF8E1;border-left:4px solid #F59E0B;padding:16px;margin:24px 0;">
                                        <strong style="color:#92400E;">Important Security Notice</strong>
                                        <p style="margin:8px 0 0;font-size:14px;color:#92400E;">
                                            This password reset link is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email or contact Trust Gates support if you suspect unauthorized access.
                                        </p>
                                    </div>

                                    <p style="font-size:13px;color:#6B7280;word-break:break-all;margin-top:20px;">
                                        If the button above does not work, copy and paste this link into your browser:<br>
                                        <a href="${resetLink}" style="color:#2563EB;">${resetLink}</a>
                                    </p>

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

module.exports = sendForgotPasswordEmail;
