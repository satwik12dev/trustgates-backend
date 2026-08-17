const transporter = require("../../config/brevo");

const sendMerchantApprovedEmail = async (
    merchantName,
    email
) => {

    await transporter.sendMail({

        from: `"Gateway Support" <${process.env.BREVO_SENDER_EMAIL}>`,

        to: email,

        subject: "Your Merchant Account Has Been Approved",

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
                                <td style="background:#16A34A;padding:24px;text-align:center;">
                                    <h2 style="color:#ffffff;margin:0;">
                                        Merchant Account Approved
                                    </h2>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:32px;color:#333333;line-height:1.7;">

                                    <p>Hi <strong>${merchantName}</strong>,</p>

                                    <p>
                                        Congratulations! Your merchant account has been successfully approved by our team.
                                    </p>

                                    <p>
                                        Your account is now active, and you can start integrating our Payment Gateway into your application.
                                    </p>

                                    <p>
                                        Your API credentials have been generated successfully.
                                        For security reasons, please access your Merchant Dashboard to securely view your API credentials.
                                    </p>

                                    <div style="background:#F0FDF4;border-left:4px solid #16A34A;padding:16px;margin:24px 0;">

                                        <strong>Your account is now ready.</strong>

                                        <ul style="margin:12px 0 0 20px;padding:0;line-height:1.8;">
                                            <li>Merchant account activated</li>
                                            <li>API credentials generated</li>
                                            <li>Payment gateway access enabled</li>
                                            <li>Ready to start accepting payments</li>
                                        </ul>

                                    </div>

                                    <p>
                                        We recommend reviewing our API documentation and completing a test integration before switching to production.
                                    </p>

                                    <p>
                                        If you need any assistance, our support team is always happy to help.
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

module.exports = sendMerchantApprovedEmail;