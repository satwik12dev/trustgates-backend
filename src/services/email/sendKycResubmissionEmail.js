const transporter = require("../../config/brevo");

const sendKycResubmissionEmail = async (
    merchantName,
    email,
    details = {}
) => {

    const greeting = merchantName
        ? `Hi <strong>${merchantName}</strong>,`
        : `Hello,`;

    const remarks = details.remarks || "You are eligible to re-upload your verification documents.";

    await transporter.sendMail({

        from: `"Trust Gates Support" <${process.env.BREVO_SENDER_EMAIL}>`,

        to: email,

        subject: "KYC Document Resubmission Allowed - Trust Gates",

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
                                <td style="background:#2563EB;padding:24px;text-align:center;">
                                    <h2 style="color:#ffffff;margin:0;font-size:22px;">
                                        KYC Resubmission Request
                                    </h2>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:32px;color:#333333;line-height:1.7;">

                                    <p>${greeting}</p>

                                    <p>
                                        Our compliance administration team has enabled document resubmission for your <strong>Trust Gates</strong> merchant account.
                                    </p>

                                    <div style="background:#EFF6FF;border-left:4px solid #2563EB;padding:16px;margin:20px 0;">
                                        <strong style="color:#1E40AF;">Admin Remarks:</strong>
                                        <p style="margin:8px 0 0;font-size:14px;color:#1E40AF;">
                                            ${remarks}
                                        </p>
                                    </div>

                                    <p>
                                        Please log in to your <strong>Merchant Dashboard</strong>, navigate to the KYC verification section, and upload clear, updated copies of the required documents (PAN and Aadhaar).
                                    </p>

                                    <p style="font-size:14px;color:#6B7280;">
                                        Ensuring all details match your registration information will help expedite verification.
                                    </p>

                                    <br>

                                    <p>
                                        Regards,<br>
                                        <strong>Trust Gates Compliance Team</strong>
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

module.exports = sendKycResubmissionEmail;
