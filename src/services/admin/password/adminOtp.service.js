const nodemailer = require("nodemailer");


// ==========================================================
// Environment Validation
// ==========================================================

const brevoLogin =
    process.env.BREVO_LOGIN;

const brevoSmtpKey =
    process.env.BREVO_SMTP_KEY;

const senderEmail =
    process.env.BREVO_SENDER_EMAIL;


if (!brevoLogin) {
    throw new Error(
        "BREVO_LOGIN is not configured."
    );
}

if (!brevoSmtpKey) {
    throw new Error(
        "BREVO_SMTP_KEY is not configured."
    );
}

if (!senderEmail) {
    throw new Error(
        "BREVO_SENDER_EMAIL is not configured."
    );
}


// ==========================================================
// Brevo SMTP Transporter
// ==========================================================

const transporter =
    nodemailer.createTransport({

        host:
            "smtp-relay.brevo.com",

        port:
            587,

        secure:
            false,

        auth: {

            user:
                brevoLogin,

            pass:
                brevoSmtpKey
        },

        connectionTimeout:
            10000,

        greetingTimeout:
            10000,

        socketTimeout:
            15000
    });


// ==========================================================
// Send Admin Forgot Password OTP
// ==========================================================

const sendAdminForgotPasswordOtp = async ({
    email,
    name,
    otp
}) => {

    // ======================================================
    // Validate Email
    // ======================================================

    if (
        typeof email !== "string" ||
        !email.trim()
    ) {

        throw new Error(
            "Admin email is required."
        );
    }


    // ======================================================
    // Validate OTP
    // ======================================================

    if (
        typeof otp !== "string" ||
        !/^\d{6}$/.test(otp)
    ) {

        throw new Error(
            "Invalid admin OTP."
        );
    }


    // ======================================================
    // Normalize Values
    // ======================================================

    const normalizedEmail =
        email.trim();

    const adminName =
        typeof name === "string" &&
        name.trim()
            ? name.trim()
            : "Admin";


    // ======================================================
    // Mail Options
    // ======================================================

    const mailOptions = {

        from:
            `"Payment Gateway Admin" <${senderEmail}>`,

        to:
            normalizedEmail,

        subject:
            "Admin Password Reset OTP",

        // ==================================================
        // Plain Text
        // ==================================================

        text:
`Hello ${adminName},

We received a request to reset your Payment Gateway admin password.

Your One-Time Password (OTP) is:

${otp}

This OTP is valid for 10 minutes.

For security reasons:
- Do not share this OTP with anyone.
- Payment Gateway support will never ask you for this OTP.
- If you did not request a password reset, please ignore this email.

Payment Gateway Security Team`,

        // ==================================================
        // HTML
        // ==================================================

        html: `
<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        Admin Password Reset OTP
    </title>

</head>


<body style="
    margin:0;
    padding:0;
    background-color:#f4f6f8;
    font-family:Arial,Helvetica,sans-serif;
">


    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="
            background-color:#f4f6f8;
            padding:40px 0;
        "
    >

        <tr>

            <td align="center">


                <table
                    width="600"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        max-width:600px;
                        width:100%;
                        background-color:#ffffff;
                        border-radius:10px;
                        overflow:hidden;
                    "
                >


                    <!-- Header -->

                    <tr>

                        <td
                            style="
                                padding:25px 30px;
                                background-color:#111827;
                                color:#ffffff;
                            "
                        >

                            <h2 style="
                                margin:0;
                                font-size:22px;
                            ">

                                Payment Gateway

                            </h2>

                            <p style="
                                margin:6px 0 0;
                                font-size:13px;
                                color:#d1d5db;
                            ">

                                Admin Security

                            </p>

                        </td>

                    </tr>


                    <!-- Content -->

                    <tr>

                        <td
                            style="
                                padding:35px 30px;
                                color:#111827;
                            "
                        >


                            <h2 style="
                                margin-top:0;
                                margin-bottom:20px;
                                font-size:22px;
                            ">

                                Password Reset Request

                            </h2>


                            <p style="
                                font-size:15px;
                                line-height:1.6;
                                margin-bottom:15px;
                            ">

                                Hello
                                <strong>
                                    ${adminName}
                                </strong>,

                            </p>


                            <p style="
                                font-size:15px;
                                line-height:1.6;
                                color:#374151;
                            ">

                                We received a request to reset
                                your Payment Gateway admin
                                password.

                            </p>


                            <p style="
                                font-size:15px;
                                line-height:1.6;
                                color:#374151;
                            ">

                                Use the following OTP to
                                continue:

                            </p>


                            <!-- OTP -->

                            <div style="
                                text-align:center;
                                margin:30px 0;
                            ">

                                <div style="
                                    display:inline-block;
                                    padding:18px 28px;
                                    background-color:#f3f4f6;
                                    border:1px solid #e5e7eb;
                                    border-radius:8px;
                                    font-size:32px;
                                    font-weight:bold;
                                    letter-spacing:8px;
                                    color:#111827;
                                ">

                                    ${otp}

                                </div>

                            </div>


                            <p style="
                                text-align:center;
                                font-size:14px;
                                color:#6b7280;
                            ">

                                This OTP will expire in
                                <strong>
                                    10 minutes
                                </strong>.

                            </p>


                            <!-- Security Notice -->

                            <div style="
                                margin-top:30px;
                                padding:16px;
                                background-color:#fff7ed;
                                border:1px solid #fed7aa;
                                border-radius:7px;
                            ">

                                <p style="
                                    margin:0;
                                    font-size:13px;
                                    line-height:1.6;
                                    color:#9a3412;
                                ">

                                    <strong>
                                        Security Notice:
                                    </strong>

                                    Never share this OTP
                                    with anyone.

                                </p>

                            </div>


                            <p style="
                                margin-top:25px;
                                font-size:13px;
                                line-height:1.6;
                                color:#6b7280;
                            ">

                                If you did not request this
                                password reset, you can safely
                                ignore this email.

                            </p>


                        </td>

                    </tr>


                    <!-- Footer -->

                    <tr>

                        <td
                            style="
                                padding:20px 30px;
                                background-color:#f9fafb;
                                border-top:1px solid #e5e7eb;
                            "
                        >

                            <p style="
                                margin:0;
                                font-size:12px;
                                color:#9ca3af;
                                text-align:center;
                            ">

                                Payment Gateway Security Team

                            </p>

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


    // ======================================================
    // Send Email
    // ======================================================

    try {

        const info =
            await transporter.sendMail(
                mailOptions
            );


        return {

            success: true,

            message:
                "Admin OTP email sent successfully.",

            messageId:
                info.messageId
        };

    } catch (error) {

        console.error(
            "Admin OTP email sending failed:",
            error.message
        );

        throw new Error(
            "Failed to send admin OTP email."
        );
    }
};


// ==========================================================
// Export
// ==========================================================

module.exports = {
    sendAdminForgotPasswordOtp
};