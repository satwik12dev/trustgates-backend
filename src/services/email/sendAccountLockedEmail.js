const transporter = require("../../config/brevo");

const sendAccountLockedEmail = async (
    merchantName,
    email,
    details = {}
) => {

    const greeting = merchantName
        ? `Hi <strong>${merchantName}</strong>,`
        : `Hello,`;

    const lockDuration = details.lockDuration || "15 minutes";
    const reason = details.reason || "Multiple consecutive failed login attempts.";

    await transporter.sendMail({

        from: `"Trust Gates Support" <${process.env.BREVO_SENDER_EMAIL}>`,

        to: email,

        subject: "Account Temporarily Locked for Security - Trust Gates",

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
                                <td style="background:#DC2626;padding:24px;text-align:center;">
                                    <h2 style="color:#ffffff;margin:0;font-size:22px;">
                                        Account Temporarily Locked
                                    </h2>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:32px;color:#333333;line-height:1.7;">

                                    <p>${greeting}</p>

                                    <p>
                                        As a security precaution, your <strong>Trust Gates</strong> account has been temporarily locked due to:
                                    </p>

                                    <div style="background:#FFF5F5;border-left:4px solid #DC2626;padding:16px;margin:20px 0;">
                                        <strong style="color:#991B1B;">${reason}</strong>
                                        <p style="margin:8px 0 0;font-size:14px;color:#991B1B;">
                                            Your account will automatically unlock after <strong>${lockDuration}</strong>.
                                        </p>
                                    </div>

                                    <p>
                                        If this was you, please wait for the lockout period to expire before trying again, or use the <strong>Forgot Password</strong> option to securely regain access.
                                    </p>

                                    <p>
                                        If you did not attempt these logins, someone may be trying to access your account. We recommend resetting your password once the lock expires.
                                    </p>

                                    <br>

                                    <p>
                                        Regards,<br>
                                        <strong>Trust Gates Security Team</strong>
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

module.exports = sendAccountLockedEmail;
