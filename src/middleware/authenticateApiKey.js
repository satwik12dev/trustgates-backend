const bcrypt = require("bcrypt");

const db = require("../config/pool");

const apiWhitelistQueries = require("../queries/merchant/apiWhitelist/apiWhitelist.query");

const authenticateApiKey = async (req, res, next) => {

    try {

        // ==============================================
        // Headers
        // ==============================================

        const publicKey = req.header("X-API-KEY");

        const secretKey = req.header("X-API-SECRET");

        if (!publicKey || !secretKey) {

            return res.status(401).json({

                success: false,

                message: "API credentials are required."

            });

        }

        // ==============================================
        // Find Credential
        // ==============================================

        const [credential] = await db.query(

            apiWhitelistQueries.GET_CREDENTIAL_BY_PUBLIC_KEY,

            [publicKey]

        );

        if (!credential.length) {

            return res.status(401).json({

                success: false,

                message: "Invalid API Key."

            });

        }

        const apiCredential = credential[0];

        // ==============================================
        // Active Check
        // ==============================================

        if (apiCredential.status !== "ACTIVE") {

            return res.status(403).json({

                success: false,

                message: "API credentials are inactive."

            });

        }

        // ==============================================
        // Verify Secret
        // ==============================================

        const isValid = await bcrypt.compare(

            secretKey,

            apiCredential.secret_key_hash

        );

        if (!isValid) {

            return res.status(401).json({

                success: false,

                message: "Invalid API Secret."

            });

        }

        // ==============================================
        // Check IP Whitelist
        // ==============================================

        const [ips] = await db.query(

            `
            SELECT ip_address
            FROM api_ip_whitelist
            WHERE credential_id = ?
            AND status = 'ACTIVE'
            `,

            [apiCredential.credential_id]

        );

        const requestIp =
            req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
            req.socket.remoteAddress;

        const isAllowed = ips.some(

            (ip) => ip.ip_address === requestIp

        );

        if (!isAllowed) {

            return res.status(403).json({

                success: false,

                message: "IP address is not whitelisted."

            });

        }

        // ==============================================
        // Update Last Used
        // ==============================================

        await db.query(

            apiWhitelistQueries.UPDATE_LAST_USED,

            [apiCredential.credential_id]

        );

        // ==============================================
        // Attach Merchant
        // ==============================================

        req.apiCredential = apiCredential;

        req.merchant = {

            merchantId: apiCredential.merchant_id

        };

        next();

    } catch (error) {

        next(error);

    }

};

module.exports = authenticateApiKey;