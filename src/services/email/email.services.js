const transporter = require("../../config/brevo");

const sendOTPEmail = async (email, merchantName, otp) => {
    await transporter.sendMail({
        from: `"XYZ Payments" <${process.env.BREVO_SENDER_EMAIL}>`,
        to: email,
        subject: "Verify Your Email Address",

        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Email Verification</title>
        </head>
        <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">

            <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                <tr>
                    <td align="center">

                        <table width="600" cellpadding="0" cellspacing="0"
                            style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

                            <!-- Header -->
                            <tr>
                                <td align="center"
                                    style="background:#2563eb;padding:30px;">
                                    <h1 style="color:#ffffff;margin:0;font-size:28px;">
                                        XYZ Payments
                                    </h1>
                                    <p style="color:#dbeafe;margin-top:8px;font-size:14px;">
                                        Secure Payment Gateway
                                    </p>
                                </td>
                            </tr>

                            <!-- Body -->
                            <tr>
                                <td style="padding:40px;">

                                    <h2 style="margin-top:0;color:#111827;">
                                        Hello ${merchantName},
                                    </h2>

                                    <p style="font-size:16px;color:#4b5563;line-height:1.7;">
                                        Thank you for registering with
                                        <strong>XYZ Payments</strong>.
                                        Please verify your email address using the
                                        One-Time Password (OTP) below.
                                    </p>

                                    <div style="margin:35px 0;text-align:center;">
                                        <span style="
                                            display:inline-block;
                                            background:#eff6ff;
                                            border:2px dashed #2563eb;
                                            color:#2563eb;
                                            font-size:34px;
                                            font-weight:bold;
                                            letter-spacing:10px;
                                            padding:18px 40px;
                                            border-radius:10px;">
                                            ${otp}
                                        </span>
                                    </div>

                                    <p style="font-size:15px;color:#4b5563;line-height:1.7;">
                                        This verification code is valid for
                                        <strong>10 minutes</strong>.
                                        Please do not share this code with anyone.
                                    </p>

                                    <p style="font-size:15px;color:#4b5563;line-height:1.7;">
                                        If you did not create an account with XYZ Payments,
                                        you can safely ignore this email.
                                    </p>

                                </td>
                            </tr>

                            <!-- Divider -->
                            <tr>
                                <td>
                                    <hr style="border:none;border-top:1px solid #e5e7eb;">
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="padding:25px 40px;text-align:center;">

                                    <p style="margin:0;color:#6b7280;font-size:13px;">
                                        This is an automated email. Please do not reply.
                                    </p>

                                    <p style="margin:8px 0 0;color:#9ca3af;font-size:12px;">
                                        © ${new Date().getFullYear()} XYZ Payments.
                                        All Rights Reserved.
                                    </p>

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

module.exports = sendOTPEmail;