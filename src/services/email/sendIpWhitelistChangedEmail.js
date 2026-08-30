const transporter = require("../../config/brevo");

const sendIpWhitelistChangedEmail = async (
    merchantName,
    email,
    details = {}
) => {

    const greeting = merchantName
        ? `Hi <strong>${merchantName}</strong>,`
        : `Hello,`;

    const action = details.action || "MODIFIED"; // "ADDED" or "REMOVED"
    const ipAddress = details.ipAddress || "N/A";
    const changeTime = details.time || new Date().toUTCString();

    const isAdded = action === "ADDED";

    await transporter.sendMail({

        from: `"Trust Gates Support" <${process.env.BREVO_SENDER_EMAIL}>`,

        to: email,

        subject: `Security Alert: IP Whitelist ${isAdded ? "Added" : "Updated"} - Trust Gates`,

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
                                        IP Whitelist Updated
                                    </h2>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:32px;color:#333333;line-height:1.7;">

                                    <p>${greeting}</p>

                                    <p>
                                        An IP address in your API Whitelist configuration has been <strong>${isAdded ? "ADDED" : "REMOVED"}</strong>.
                                    </p>

                                    <table width="100%" cellpadding="12" cellspacing="0"
                                        style="margin:24px 0;border-collapse:collapse;">
                                        <tr>
                                            <td style="background:#F8FAFC;width:180px;">
                                                <strong>Action</strong>
                                            </td>
                                            <td style="background:#FFFFFF;font-weight:bold;color:${isAdded ? "#16A34A" : "#DC2626"};">
                                                ${isAdded ? "IP Added" : "IP Removed"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="background:#F8FAFC;">
                                                <strong>IP Address</strong>
                                            </td>
                                            <td style="background:#FFFFFF;font-family:monospace;">
                                                ${ipAddress}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="background:#F8FAFC;">
                                                <strong>Timestamp</strong>
                                            </td>
                                            <td style="background:#FFFFFF;">
                                                ${changeTime}
                                            </td>
                                        </tr>
                                    </table>

                                    <div style="background:#FFF8E1;border-left:4px solid #F59E0B;padding:16px;margin:24px 0;">
                                        <strong style="color:#92400E;">Security Verification</strong>
                                        <p style="margin:8px 0 0;font-size:14px;color:#92400E;">
                                            Only API requests originating from your whitelisted IP addresses can access your secure endpoints. If you did not make this change, please log in to your dashboard and verify your IP whitelist settings.
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

module.exports = sendIpWhitelistChangedEmail;
