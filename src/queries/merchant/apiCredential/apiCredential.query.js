const apiCredentialQueries = {

    // ==========================================================
    // Check Merchant Exists
    // ==========================================================

    CHECK_MERCHANT_EXISTS: `

        SELECT

            merchant_id,
            merchant_code,
            business_name,
            merchant_name,
            email,
            approval_status,
            kyc_status,
            account_status

        FROM merchants

        WHERE merchant_id = ?

          AND deleted_at IS NULL

        LIMIT 1

    `,


    // ==========================================================
    // Get All API Credentials
    // ==========================================================

    GET_API_CREDENTIALS: `

        SELECT

            credential_id,
            merchant_id,
            public_key,
            environment,
            status,
            last_used_at,
            created_at,
            updated_at

        FROM api_credentials

        WHERE merchant_id = ?

        ORDER BY created_at DESC

    `,


    // ==========================================================
    // Get Credential By ID + Merchant
    // ==========================================================

    GET_CREDENTIAL_BY_ID: `

        SELECT

            credential_id,
            merchant_id,
            public_key,
            secret_key_hash,
            environment,
            status,
            last_used_at,
            created_at,
            updated_at

        FROM api_credentials

        WHERE credential_id = ?

          AND merchant_id = ?

        LIMIT 1

    `,


    // ==========================================================
    // Create API Credential
    // ==========================================================

    CREATE_API_CREDENTIAL: `

        INSERT INTO api_credentials
        (
            merchant_id,
            public_key,
            secret_key_hash,
            environment,
            status
        )

        VALUES
        (
            ?,
            ?,
            ?,
            ?,
            'ACTIVE'
        )

    `,


    // ==========================================================
    // Update API Status
    // ==========================================================

    UPDATE_API_STATUS: `

        UPDATE api_credentials

        SET

            status = ?,

            updated_at = NOW()

        WHERE credential_id = ?

          AND merchant_id = ?

    `,


    // ==========================================================
    // Inactivate API Credential
    // ==========================================================

    INACTIVATE_API_CREDENTIAL: `

        UPDATE api_credentials

        SET

            status = 'INACTIVE',

            updated_at = NOW()

        WHERE credential_id = ?

          AND merchant_id = ?

    `,


    // ==========================================================
    // Revoke API Credential
    // ==========================================================

    REVOKE_API_CREDENTIAL: `

        UPDATE api_credentials

        SET

            status = 'REVOKED',

            updated_at = NOW()

        WHERE credential_id = ?

          AND merchant_id = ?

          AND status != 'REVOKED'

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


module.exports = apiCredentialQueries;