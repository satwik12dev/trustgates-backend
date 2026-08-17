const authenticationQueries = {

    // ==========================================================
    // Check API Credential
    // ==========================================================

    CHECK_API_CREDENTIAL: `
        SELECT

            credential_id,

            merchant_id,

            public_key,

            secret_key_hash,

            environment,

            status,

            last_used_at

        FROM api_credentials

        WHERE public_key = ?

        LIMIT 1
    `,

    // ==========================================================
    // Check Merchant
    // ==========================================================

    CHECK_MERCHANT: `
        SELECT

            merchant_id,

            merchant_code,

            business_name,

            merchant_name,

            email,

            email_verified,

            approval_status,

            kyc_status,

            account_status

        FROM merchants

        WHERE merchant_id = ?

          AND deleted_at IS NULL

        LIMIT 1
    `,

    // ==========================================================
    // Check IP Whitelist
    // ==========================================================

    CHECK_IP_WHITELIST: `
        SELECT

            whitelist_id,

            ip_address,

            status

        FROM api_ip_whitelist

        WHERE

            credential_id = ?

            AND ip_address = ?

            AND status = 'ACTIVE'

        LIMIT 1
    `,

    // ==========================================================
    // Update Last Used
    // ==========================================================

    UPDATE_LAST_USED: `
        UPDATE api_credentials

        SET

            last_used_at = NOW()

        WHERE credential_id = ?
    `

};

module.exports = authenticationQueries;