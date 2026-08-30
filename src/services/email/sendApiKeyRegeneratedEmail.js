const transporter = require("../../config/brevo");

const sendApiKeyRegeneratedEmail = async (
    merchantName,
    email,
    details = {}
) => {

    const greeting = merchantName
        ? `Hi <strong>${merchantName}</strong>,`
        : `Hello,`;

    const generatedTime = details.time || new Date().toUTCString();
    const keyType = details.keyType || "Production Secret Key";

    await transporter.sendMail({

        from: `"Trust Gates Support" <${process.env.BREVO_SENDER_EMAIL}>`,

        to: email,

        subject: "Security Alert: API Credentials Regenerated - Trust Gates",

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
                                        API Credentials Regenerated
                                    </h2>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:32px;color:#333333;line-height:1.7;">

                                    <p>${greeting}</p>

                                    <p>
                                        Your <strong>${keyType}</strong> has been successfully regenerated on Trust Gates.
                                    </p>

                                    <table width="100%" cellpadding="12" cellspacing="0"
                                        style="margin:24px 0;border-collapse:collapse;">
                                        <tr>
                                            <td style="background:#F8FAFC;width:180px;">
                                                <strong>Credential Type</strong>
                                            </td>
                                            <td style="background:#FFFFFF;">
                                                ${keyType}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="background:#F8FAFC;">
                                                <strong>Timestamp</strong>
                                            </td>
                                            <td style="background:#FFFFFF;">
                                                ${generatedTime}
                                            </td>
                                        </tr>
                                    </table>

                                    <div style="background:#FFF8E1;border-left:4px solid #F59E0B;padding:16px;margin:24px 0;">
                                        <strong style="color:#92400E;">Important Integration Notice</strong>
                                        <p style="margin:8px 0 0;font-size:14px;color:#92400E;">
                                            Any existing backend services or scripts using your old secret key will stop working immediately. Please make sure to update your servers with the newly generated key from your Merchant Dashboard.
                                        </p>
                                    </div>

                                    <p style="font-size:14px;color:#6B7280;">
                                        If you did not initiate this key rotation, please revoke the key in your dashboard immediately and notify Trust Gates support.
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

module.exports = sendApiKeyRegeneratedEmail;
