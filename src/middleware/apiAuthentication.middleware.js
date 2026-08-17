const bcrypt = require("bcrypt");

const db = require("../config/pool");

const authenticationQueries = require("../queries/payment/authentication.query");

// ==========================================================
// API Authentication Middleware
// ==========================================================

const apiAuthentication = async (req, res, next) => {

    try {

        // ======================================================
        // Read API Headers
        // ======================================================

        const publicKey = req.header("X-API-KEY");

        const secretKey = req.header("X-API-SECRET");

        if (!publicKey || !secretKey) {

            return res.status(401).json({

                success: false,

                message: "API credentials are required."

            });

        }

        // ======================================================
        // Find API Credential
        // ======================================================

        const [credential] = await db.query(

            authenticationQueries.CHECK_API_CREDENTIAL,

            [publicKey]

        );

        if (!credential.length) {

            return res.status(401).json({

                success: false,

                message: "Invalid API credentials."

            });

        }

        const credentialData = credential[0];

        // ======================================================
        // Verify Secret Key
        // ======================================================

        const validSecret = await bcrypt.compare(

            secretKey,

            credentialData.secret_key_hash

        );

        if (!validSecret) {

            return res.status(401).json({

                success: false,

                message: "Invalid API credentials."

            });

        }

        // ======================================================
        // API Credential Status
        // ======================================================

        if (credentialData.status !== "ACTIVE") {

            return res.status(403).json({

                success: false,

                message: "API credential is inactive."

            });

        }

        // ======================================================
        // Get Merchant
        // ======================================================

        const [merchant] = await db.query(

            authenticationQueries.CHECK_MERCHANT,

            [credentialData.merchant_id]

        );

        if (!merchant.length) {

            return res.status(404).json({

                success: false,

                message: "Merchant not found."

            });

        }

        const merchantData = merchant[0];

        // ======================================================
        // Merchant Status
        // ======================================================

        if (merchantData.account_status !== "ACTIVE") {

            return res.status(403).json({

                success: false,

                message: "Merchant account is inactive."

            });

        }

        // ======================================================
        // Email Verification
        // ======================================================

        if (!merchantData.email_verified) {

            return res.status(403).json({

                success: false,

                message: "Merchant email is not verified."

            });

        }

        // ======================================================
        // KYC Status
        // ======================================================

        if (merchantData.kyc_status !== "APPROVED") {

            return res.status(403).json({

                success: false,

                message: "Merchant KYC is not approved."

            });

        }

        // ======================================================
        // Get Client IP
        // ======================================================

        // ======================================================
// Get Client IP
// ======================================================

let clientIp =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    req.ip;

// Normalize localhost IPv6
if (clientIp === "::1") {

    clientIp = "127.0.0.1";

}

// Normalize IPv4-mapped IPv6
if (clientIp.startsWith("::ffff:")) {

    clientIp = clientIp.replace("::ffff:", "");

}

        // ======================================================
        // Verify IP Whitelist
        // ======================================================

        const [whitelistedIp] = await db.query(

            authenticationQueries.CHECK_IP_WHITELIST,

            [

                credentialData.credential_id,

                clientIp

            ]

        );

        if (!whitelistedIp.length) {

            return res.status(403).json({

                success: false,

                message: "IP address is not whitelisted."

            });

        }
        // ======================================================
        // Update Last Used
        // ======================================================

        await db.query(

            authenticationQueries.UPDATE_LAST_USED,

            [

                credentialData.credential_id

            ]

        );

        // ======================================================
        // Attach Merchant
        // ======================================================

        req.merchant = {

            merchant_id: merchantData.merchant_id,

            merchant_code: merchantData.merchant_code,

            business_name: merchantData.business_name,

            merchant_name: merchantData.merchant_name,

            email: merchantData.email,

            account_status: merchantData.account_status,

            kyc_status: merchantData.kyc_status

        };

        // ======================================================
        // Attach API Credential
        // ======================================================

        req.apiCredential = {

            credential_id: credentialData.credential_id,

            merchant_id: credentialData.merchant_id,

            public_key: credentialData.public_key,

            environment: credentialData.environment,

            status: credentialData.status

        };

        next();

    } catch (error) {

        next(error);

    }

};

module.exports = apiAuthentication;