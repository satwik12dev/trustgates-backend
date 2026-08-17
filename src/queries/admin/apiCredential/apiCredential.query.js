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
    // Check Existing ACTIVE API Credentials
    // ==========================================================

    CHECK_API_CREDENTIALS: `

        SELECT
            credential_id,
            merchant_id,
            environment,
            status

        FROM api_credentials

        WHERE merchant_id = ?
          AND environment = ?
          AND status = 'ACTIVE'

        LIMIT 1

    `,


    // ==========================================================
    // Create API Credentials
    // ==========================================================

    CREATE_API_CREDENTIALS: `

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
    // Get Merchant API Credentials
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
    // Get Credential By ID
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

        LIMIT 1

    `,


    // ==========================================================
    // Get Credential By Public Key
    // ==========================================================

    GET_CREDENTIAL_BY_PUBLIC_KEY: `

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
    // Update API Status
    // ==========================================================

    UPDATE_API_STATUS: `

        UPDATE api_credentials

        SET
            status = ?,
            updated_at = NOW()

        WHERE credential_id = ?

    `,


    // ==========================================================
    // Make Old Credential Inactive
    // ==========================================================

    INACTIVATE_API_CREDENTIAL: `

        UPDATE api_credentials

        SET
            status = 'INACTIVE',
            updated_at = NOW()

        WHERE credential_id = ?
          AND status = 'ACTIVE'

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

    `,


    // ==========================================================
    // Delete API Credentials
    // ==========================================================

    DELETE_API_CREDENTIALS: `

        DELETE FROM api_credentials

        WHERE credential_id = ?

    `
};


module.exports = apiCredentialQueries;