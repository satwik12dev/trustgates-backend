const crypto = require("crypto");

const db = require("../../../config/pool");
const redis = require("../../../config/redis");

const {
    sendAdminForgotPasswordOtp
} = require("./adminOtp.service");


const OTP_EXPIRY_SECONDS = 10 * 60;


const generateOtp = () => {

    return crypto
        .randomInt(
            100000,
            1000000
        )
        .toString();
};


const hashOtp = (
    otp
) => {

    return crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
};


const forgotPasswordService = async (
    email
) => {

    const normalizedEmail =
        typeof email === "string"
            ? email.trim().toLowerCase()
            : "";


    if (!normalizedEmail) {

        throw new Error(
            "Invalid email."
        );
    }


    const [rows] =
        await db.query(
            `
            SELECT
                admin_id,
                email,
                full_name,
                status
            FROM admins
            WHERE email = ?
            LIMIT 1
            `,
            [normalizedEmail]
        );


    if (!rows.length) {

        return {
            success: true,

            message:
                "If an admin account exists with this email, an OTP has been sent."
        };
    }


    const admin =
        rows[0];


    if (
        admin.status !== "ACTIVE"
    ) {

        return {
            success: true,

            message:
                "If an admin account exists with this email, an OTP has been sent."
        };
    }


    const otp =
        generateOtp();


    const otpHash =
        hashOtp(otp);


    const redisKey =
        `admin:forgot-password:otp:${normalizedEmail}`;


    const otpData = {

        adminId:
            admin.admin_id,

        otpHash,

        attempts: 0,

        createdAt:
            Date.now()
    };


    await redis.set(
        redisKey,
        JSON.stringify(otpData),
        {
            EX:
                OTP_EXPIRY_SECONDS
        }
    );


    try {

        await sendAdminForgotPasswordOtp({
            email:
                admin.email,

            name:
                admin.full_name,

            otp
        });

    } catch (error) {

        await redis.del(
            redisKey
        );

        throw error;
    }


    return {

        success: true,

        message:
            "If an admin account exists with this email, an OTP has been sent."
    };
};


module.exports = {
    forgotPasswordService,
    generateOtp,
    hashOtp
};