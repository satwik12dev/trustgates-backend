const jwt = require("jsonwebtoken");

const generateToken = (merchant_id, email) => {
    return jwt.sign(
        {
            merchant_id,
            email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m"
        }
    );
};

module.exports = generateToken;