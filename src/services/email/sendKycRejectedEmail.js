const transporter = require("../../config/brevo");

const sendKycRejectedEmail = async (
    merchantName,
    email,
    verificationNotes
) => {

    const mailOptions = {

        from: `"Gateway Support" <${process.env.BREVO_SENDER_EMAIL}>`,

        to: email,

        subject: "KYC Verification Failed",

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
                                <td style="background:#DC2626;padding:24px;text-align:center;">
                                    <h2 style="color:#ffffff;margin:0;">
                                        KYC Rejected
                                    </h2>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:32px;color:#333333;line-height:1.7;">

                                    <p>Hi <strong>${merchantName}</strong>,</p>

                                    <p>
                                        We regret to inform you that your submitted KYC documents could not be approved.
                                    </p>

                                    <p>
                                        <strong>Reason:</strong>
                                    </p>

                                    <div style="background:#FFF5F5;border-left:4px solid #DC2626;padding:16px;margin:20px 0;">
                                        ${verificationNotes || "No additional comments were provided by the verification team."}
                                    </div>

                                    <p>
                                        Please review the above reason, update your documents, and submit them again for verification.
                                    </p>

                                    <p>
                                        If you believe this decision was made in error, please contact our support team.
                                    </p>

                                    <br>

                                    <p>
                                        Regards,<br>
                                        <strong>Gateway Verification Team</strong>
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
    };

    await transporter.sendMail(mailOptions);

};

module.exports = sendKycRejectedEmail;