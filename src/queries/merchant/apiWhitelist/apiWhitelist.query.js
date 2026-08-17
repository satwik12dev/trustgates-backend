const apiWhitelistQueries = {

    // ==========================================================
    // Check Credential Belongs To Merchant
    // ==========================================================

    CHECK_CREDENTIAL_BY_MERCHANT: `

        SELECT

            credential_id,
            merchant_id,
            status,
            environment

        FROM api_credentials

        WHERE credential_id = ?

          AND merchant_id = ?

        LIMIT 1

    `,


    // ==========================================================
    // Check IP Already Exists
    // ==========================================================

    CHECK_IP_EXISTS: `

        SELECT

            whitelist_id,
            credential_id,
            ip_address,
            status

        FROM api_ip_whitelist

        WHERE credential_id = ?

          AND ip_address = ?

          AND status = 'ACTIVE'

        LIMIT 1

    `,


    // ==========================================================
    // Create IP
    // ==========================================================

    CREATE_IP: `

        INSERT INTO api_ip_whitelist
        (
            credential_id,
            ip_address,
            status
        )

        VALUES
        (
            ?,
            ?,
            'ACTIVE'
        )

    `,


    // ==========================================================
    // Get All Whitelisted IPs
    // ==========================================================

    GET_IPS: `

        SELECT

            whitelist_id,
            credential_id,
            ip_address,
            status,
            created_at

        FROM api_ip_whitelist

        WHERE credential_id = ?

        ORDER BY created_at DESC

    `,


    // ==========================================================
    // Get IP By ID + Merchant Ownership
    // ==========================================================

    GET_IP_BY_ID_AND_MERCHANT: `

        SELECT

            w.whitelist_id,
            w.credential_id,
            w.ip_address,
            w.status,
            w.created_at,

            c.merchant_id,
            c.status AS credential_status

        FROM api_ip_whitelist w

        INNER JOIN api_credentials c

            ON c.credential_id =
               w.credential_id

        WHERE w.whitelist_id = ?

          AND c.merchant_id = ?

        LIMIT 1

    `,


    // ==========================================================
    // Update IP
    // ==========================================================

    UPDATE_IP: `

        UPDATE api_ip_whitelist w

        INNER JOIN api_credentials c

            ON c.credential_id =
               w.credential_id

        SET

            w.ip_address = ?

        WHERE w.whitelist_id = ?

          AND c.merchant_id = ?

          AND c.status != 'REVOKED'

    `,


    // ==========================================================
    // Update IP Status
    // ==========================================================

    UPDATE_IP_STATUS: `

        UPDATE api_ip_whitelist w

        INNER JOIN api_credentials c

            ON c.credential_id =
               w.credential_id

        SET

            w.status = ?

        WHERE w.whitelist_id = ?

          AND c.merchant_id = ?

          AND c.status != 'REVOKED'

    `,


    // ==========================================================
    // Delete IP
    // ==========================================================

    DELETE_IP: `

        DELETE w

        FROM api_ip_whitelist w

        INNER JOIN api_credentials c

            ON c.credential_id =
               w.credential_id

        WHERE w.whitelist_id = ?

          AND c.merchant_id = ?

          AND c.status != 'REVOKED'

    `

};


module.exports = apiWhitelistQueries;