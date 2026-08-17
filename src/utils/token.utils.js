const jwt = require("jsonwebtoken");

const createVerificationToken = (
    merchantId,
    email,
    otpHash
) => {

    return jwt.sign(
        {
            merchantId,
            email,
            otpHash
        },
        process.env.EMAIL_VERIFICATION_SECRET,
        {
            expiresIn: "10m"
        }
    );

};

module.exports = createVerificationToken;