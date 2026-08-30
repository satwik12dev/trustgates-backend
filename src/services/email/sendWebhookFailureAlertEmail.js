const transporter = require("../../config/brevo");

const sendWebhookFailureAlertEmail = async (
    merchantName,
    email,
    details = {}
) => {

    const greeting = merchantName
        ? `Hi <strong>${merchantName}</strong>,`
        : `Hello,`;

    const webhookUrl = details.webhookUrl || "Configured Endpoint";
    const failureCount = details.failureCount || "multiple";
    const lastError = details.lastError || "HTTP Endpoint unreachable or non-200 response";
    const timestamp = details.time || new Date().toUTCString();

    await transporter.sendMail({

        from: `"Trust Gates Support" <${process.env.BREVO_SENDER_EMAIL}>`,

        to: email,

        subject: "Action Required: Webhook Delivery Failing - Trust Gates",

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
                                        Webhook Delivery Failing
                                    </h2>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:32px;color:#333333;line-height:1.7;">

                                    <p>${greeting}</p>

                                    <p>
                                        We are experiencing continuous delivery failures when sending payment event notifications to your configured webhook endpoint.
                                    </p>

                                    <table width="100%" cellpadding="12" cellspacing="0"
                                        style="margin:24px 0;border-collapse:collapse;">
                                        <tr>
                                            <td style="background:#F8FAFC;width:180px;">
                                                <strong>Webhook URL</strong>
                                            </td>
                                            <td style="background:#FFFFFF;word-break:break-all;font-family:monospace;font-size:13px;">
                                                ${webhookUrl}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="background:#F8FAFC;">
                                                <strong>Consecutive Failures</strong>
                                            </td>
                                            <td style="background:#FFFFFF;color:#DC2626;font-weight:bold;">
                                                ${failureCount}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="background:#F8FAFC;">
                                                <strong>Last Known Error</strong>
                                            </td>
                                            <td style="background:#FFFFFF;font-size:13px;color:#6B7280;">
                                                ${lastError}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="background:#F8FAFC;">
                                                <strong>Timestamp</strong>
                                            </td>
                                            <td style="background:#FFFFFF;">
                                                ${timestamp}
                                            </td>
                                        </tr>
                                    </table>

                                    <div style="background:#FFF5F5;border-left:4px solid #DC2626;padding:16px;margin:24px 0;">
                                        <strong style="color:#991B1B;">Action Required</strong>
                                        <p style="margin:8px 0 0;font-size:14px;color:#991B1B;">
                                            Please verify that your server is online, responding with HTTP 200 status, and that your SSL certificates and firewall settings permit incoming requests from Trust Gates.
                                        </p>
                                    </div>

                                    <p style="font-size:14px;color:#6B7280;">
                                        You can view full webhook delivery attempt logs in your Merchant Dashboard under the Webhooks section.
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

module.exports = sendWebhookFailureAlertEmail;
