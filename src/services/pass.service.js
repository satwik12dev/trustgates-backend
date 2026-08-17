const transporter = require("../config/brevo");

// ===============================
// Generic Email Sender
// ===============================
const sendEmail2 = async ({
    to,
    subject,
    html,
    text = ""
}) => {
    if (!to) {
        throw new Error("Recipient email is required.");
    }

    try {
        const info = await transporter.sendMail({
            from: `"XYZ Payments" <${process.env.BREVO_SENDER_EMAIL}>`,
            to,
            subject,
            text,
            html
        });

        return info;

    } catch (error) {

        console.error("❌ Email Error:", error);

        throw error;
    }
};

module.exports = sendEmail2;