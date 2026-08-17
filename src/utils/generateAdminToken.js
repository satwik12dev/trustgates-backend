const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateAdminToken = (
    admin,
    tokenFamilyId = crypto.randomUUID(),
    sessionId = crypto.randomUUID()
) => {

    const tokenVersion =
        Number(admin.token_version);

    if (
        !Number.isInteger(tokenVersion) ||
        tokenVersion < 0
    ) {
        throw new Error(
            "Invalid admin token version."
        );
    }

    const accessToken = jwt.sign(
        {
            admin_id:
                admin.admin_id,

            role:
                admin.role,

            type:
                "ADMIN",

            token_version:
                tokenVersion,

            session_id:
                sessionId
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "1h",
            algorithm: "HS256"
        }
    );


    const refreshToken = jwt.sign(
        {
            admin_id:
                admin.admin_id,

            type:
                "ADMIN_REFRESH",

            token_family_id:
                tokenFamilyId,

            session_id:
                sessionId
        },

        process.env.JWT_REFRESH_SECRET,

        {
            expiresIn: "7d",
            algorithm: "HS256"
        }
    );


    return {
        accessToken,
        refreshToken,
        tokenFamilyId,
        sessionId
    };
};


module.exports =
    generateAdminToken;