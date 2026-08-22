const transporter = require("../../config/brevo");

const sendPasswordResetOtpEmail = async (
    email,
    otp,
    merchantName
) => {

    const greeting = merchantName
        ? `Hi <strong>${merchantName}</strong>,`
        : `Hello,`;

    await transporter.sendMail({

        from: `"Trust Gates Support" <${process.env.BREVO_SENDER_EMAIL}>`,

        to: email,

        subject: "Password Reset Verification OTP - Trust Gates",

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
                                        Password Reset Verification
                                    </h2>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:32px;color:#333333;line-height:1.7;">

                                    <p>${greeting}</p>

                                    <p>
                                        We received a request to confirm your Trust Gates password change. Please use the One-Time Password (OTP) below to complete your verification:
                                    </p>

                                    <div style="margin:30px 0;text-align:center;">
                                        <span style="
                                            display:inline-block;
                                            background:#EFF6FF;
                                            border:2px dashed #2563EB;
                                            color:#2563EB;
                                            font-size:32px;
                                            font-weight:bold;
                                            letter-spacing:8px;
                                            padding:16px 36px;
                                            border-radius:8px;">
                                            ${otp}
                                        </span>
                                    </div>

                                    <div style="background:#FFF8E1;border-left:4px solid #F59E0B;padding:16px;margin:24px 0;">
                                        <strong style="color:#92400E;">Important Security Notice</strong>
                                        <p style="margin:8px 0 0;font-size:14px;color:#92400E;">
                                            This verification code is valid for <strong>10 minutes</strong>. Never share this OTP with anyone. Trust Gates Support will never ask for your code.
                                        </p>
                                    </div>

                                    <p style="font-size:14px;color:#6B7280;">
                                        If you did not request this password reset, please ignore this email or contact Trust Gates support immediately.
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

module.exports = sendPasswordResetOtpEmail;
