const transporter = require("../../config/brevo");

const sendAccountStatusEmail = async (
    merchantName,
    email,
    status
) => {

    const statusColor = {
        ACTIVE: "#16A34A",
        HOLD: "#F59E0B",
        BLOCKED: "#DC2626",
        OFFLINE: "#6B7280"
    };

    const statusMessage = {
        ACTIVE:
            "Your merchant account has been activated. You can now access your dashboard and start accepting payments.",

        HOLD:
            "Your merchant account has been placed on hold temporarily. Certain services may be unavailable until further notice.",

        BLOCKED:
            "Your merchant account has been blocked. Please contact our support team for further assistance regarding your account.",

        OFFLINE:
            "Your merchant account is currently offline. Payment processing and related services are temporarily unavailable."
    };

    await transporter.sendMail({

        from: `"Gateway Support" <${process.env.BREVO_SENDER_EMAIL}>`,

        to: email,

        subject: `Merchant Account Status Updated - ${status}`,

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
                                        Merchant Account Status Updated
                                    </h2>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:32px;color:#333333;line-height:1.7;">

                                    <p>Hi <strong>${merchantName}</strong>,</p>

                                    <p>
                                        This is to inform you that the status of your merchant account has been updated.
                                    </p>

                                    <table cellpadding="12" cellspacing="0"
                                        style="margin:24px 0;border-collapse:collapse;width:100%;">

                                        <tr>
                                            <td style="background:#F8FAFC;width:180px;">
                                                <strong>Current Status</strong>
                                            </td>

                                            <td style="background:#FFFFFF;
                                                color:${statusColor[status] || "#333"};
                                                font-weight:bold;">
                                                ${status}
                                            </td>
                                        </tr>

                                    </table>

                                    <p>
                                        ${statusMessage[status] || "Your account status has been updated."}
                                    </p>

                                    <p>
                                        If you have any questions or require further assistance, please contact our support team.
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

module.exports = sendAccountStatusEmail;