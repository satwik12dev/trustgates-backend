const transporter = require("../../config/brevo");

const sendMerchantWelcomeEmail = async (
    merchantName,
    email
) => {

    await transporter.sendMail({

        from: `"Gateway Support" <${process.env.BREVO_SENDER_EMAIL}>`,

        to: email,

        subject: "Welcome to Gateway - Merchant Account Created",

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
                            style="background:#ffffff;border-radius:8px;overflow:hidden;">

                            <tr>
                                <td style="background:#0F172A;padding:24px;text-align:center;">
                                    <h2 style="color:#ffffff;margin:0;">
                                        Welcome to Gateway
                                    </h2>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:32px;color:#333333;line-height:1.7;">

                                    <p>Hi <strong>${merchantName}</strong>,</p>

                                    <p>
                                        Welcome to <strong>Gateway Payment Solutions</strong>.
                                        Your merchant account has been created successfully.
                                    </p>

                                    <p>
                                        Our onboarding team will now begin the verification process for your account.
                                    </p>

                                    <table width="100%" cellpadding="12" cellspacing="0"
                                        style="margin:24px 0;border-collapse:collapse;">

                                        <tr>
                                            <td style="background:#F8FAFC;width:180px;">
                                                <strong>Approval Status</strong>
                                            </td>

                                            <td style="color:#F59E0B;font-weight:bold;">
                                                PENDING
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style="background:#F8FAFC;">
                                                <strong>KYC Status</strong>
                                            </td>

                                            <td style="color:#F59E0B;font-weight:bold;">
                                                PENDING
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style="background:#F8FAFC;">
                                                <strong>Account Status</strong>
                                            </td>

                                            <td style="color:#F59E0B;font-weight:bold;">
                                                HOLD
                                            </td>
                                        </tr>

                                    </table>

                                    <p>
                                        You will receive email notifications as your onboarding progresses, including KYC verification, merchant approval, and API credential availability.
                                    </p>

                                    <p>
                                        If you have any questions during this process, please contact our support team.
                                    </p>

                                    <br>

                                    <p>
                                        Regards,<br>
                                        <strong>Gateway Support Team</strong>
                                    </p>

                                </td>
                            </tr>

                            <tr>
                                <td style="background:#f8f8f8;padding:18px;text-align:center;font-size:13px;color:#777;">
                                    © ${new Date().getFullYear()} Gateway. All rights reserved.
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

module.exports = sendMerchantWelcomeEmail;