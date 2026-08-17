const transporter = require("../../config/brevo");

const sendKycApprovedEmail = async (merchantName, email) => {

    const mailOptions = {

        from: `"Gateway Support" <${process.env.BREVO_SENDER_EMAIL}>`,

        to: email,

        subject: "Your KYC Has Been Approved",

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
                                        KYC Approved
                                    </h2>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:32px;color:#333333;line-height:1.7;">

                                    <p>Hi <strong>${merchantName}</strong>,</p>

                                    <p>
                                        Congratulations! Your KYC documents have been successfully verified by our compliance team.
                                    </p>

                                    <p>
                                        Your identity verification is now complete.
                                    </p>

                                    <p>
                                        Your merchant account is currently awaiting final approval from our administration team.
                                    </p>

                                    <p>
                                        Once your merchant account is approved, you'll receive another email containing further instructions.
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

module.exports = sendKycApprovedEmail;