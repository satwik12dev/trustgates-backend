const transporter = require("../../config/brevo");

const sendApiCredentialsEmail = async (
    merchantName,
    email,
    publicKey
) => {

    await transporter.sendMail({

        from: `"Gateway Support" <${process.env.BREVO_SENDER_EMAIL}>`,

        to: email,

        subject: "Your API Credentials Are Ready",

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
                                        API Credentials Generated
                                    </h2>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:32px;color:#333333;line-height:1.7;">

                                    <p>Hi <strong>${merchantName}</strong>,</p>

                                    <p>
                                        Congratulations! Your merchant account has been successfully approved and your API credentials are now available.
                                    </p>

                                    <p>
                                        You can now begin integrating our Payment Gateway with your application.
                                    </p>

                                    <table width="100%" cellpadding="12" cellspacing="0"
                                        style="margin:25px 0;border-collapse:collapse;">

                                        <tr>
                                            <td style="background:#F8FAFC;width:180px;">
                                                <strong>Public API Key</strong>
                                            </td>

                                            <td style="background:#FFFFFF;font-family:monospace;font-size:14px;word-break:break-all;">
                                                ${publicKey}
                                            </td>
                                        </tr>

                                    </table>

                                    <div style="background:#FFF8E1;border-left:4px solid #F59E0B;padding:16px;margin:24px 0;">

                                        <strong>Important Security Notice</strong>

                                        <p style="margin:10px 0 0;">
                                            For your security, your Secret Key is not included in this email.
                                            Please log in to your Merchant Dashboard to securely access or manage your API credentials.
                                        </p>

                                    </div>

                                    <p>
                                        Please keep your API credentials confidential and never expose them in client-side applications or public repositories.
                                    </p>

                                    <p>
                                        If you did not request these credentials or suspect unauthorized activity, please contact our support team immediately.
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

module.exports = sendApiCredentialsEmail;