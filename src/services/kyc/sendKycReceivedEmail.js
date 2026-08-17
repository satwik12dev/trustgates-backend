const transporter = require("../../config/brevo");

const sendKycReceivedEmail = async (merchantName, email) => {
    const mailOptions = {
        from: `"Gateway Support" <${process.env.BREVO_SENDER_EMAIL}>`,
        to: email,
        subject: "We've Received Your KYC Documents",

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
                                        KYC Documents Received
                                    </h2>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:32px;color:#333333;line-height:1.7;">

                                    <p>Hi <strong>${merchantName}</strong>,</p>

                                    <p>
                                        Thank you for submitting your KYC documents.
                                        We have successfully received your PAN and Aadhaar documents.
                                    </p>

                                    <p>
                                        Our verification team is now reviewing your submission.
                                        This process may take some time depending on document verification.
                                    </p>

                                    <p>
                                        Once the verification is complete, we'll notify you by email.
                                    </p>

                                    <p>
                                        If additional information is required, our team will contact you.
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

module.exports = sendKycReceivedEmail;