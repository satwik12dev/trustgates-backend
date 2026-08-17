const crypto = require("crypto");
const bcrypt = require("bcrypt");

const db = require("../../config/pool");

const apiCredentialQueries = require(
    "../../queries/merchant/apiCredential/apiCredential.query"
);


// ==========================================================
// Validate Merchant
// ==========================================================

const validateMerchant = async (
    merchantId
) => {

    const [
        merchant
    ] = await db.query(

        apiCredentialQueries.CHECK_MERCHANT_EXISTS,

        [
            merchantId
        ]

    );


    if (!merchant.length) {

        return {

            success: false,

            statusCode: 404,

            message:
                "Merchant not found."

        };

    }


    return {

        success: true,

        merchant:
            merchant[0]

    };

};


// ==========================================================
// Get Merchant API Credentials
// ==========================================================

const getApiCredentials = async (
    merchantId
) => {

    const merchantResult =
        await validateMerchant(
            merchantId
        );


    if (
        !merchantResult.success
    ) {

        return merchantResult;

    }


    const [
        credentials
    ] = await db.query(

        apiCredentialQueries.GET_API_CREDENTIALS,

        [
            merchantId
        ]

    );


    if (!credentials.length) {

        return {

            success: false,

            statusCode: 404,

            message:
                "API credentials not found."

        };

    }


    const data =
        credentials.map(
            (credential) => ({

                credentialId:
                    credential.credential_id,

                publicKey:
                    credential.public_key,

                environment:
                    credential.environment,

                status:
                    credential.status,

                lastUsedAt:
                    credential.last_used_at,

                createdAt:
                    credential.created_at,

                updatedAt:
                    credential.updated_at

            })
        );


    return {

        success: true,

        statusCode: 200,

        message:
            "API credentials fetched successfully.",

        data

    };

};


// ==========================================================
// Update API Status
// ==========================================================

const updateApiStatus = async (

    merchantId,

    credentialId,

    status

) => {

    // ======================================================
    // Validate Credential Ownership
    // ======================================================

    const [
        credential
    ] = await db.query(

        apiCredentialQueries.GET_CREDENTIAL_BY_ID,

        [
            credentialId,
            merchantId
        ]

    );


    if (!credential.length) {

        return {

            success: false,

            statusCode: 404,

            message:
                "API credential not found."

        };

    }


    const data =
        credential[0];


    // ======================================================
    // Revoked Credential Cannot Be Modified
    // ======================================================

    if (
        data.status ===
        "REVOKED"
    ) {

        return {

            success: false,

            statusCode: 400,

            message:
                "Revoked credential cannot be modified."

        };

    }


    // ======================================================
    // Prevent Invalid Status Transition
    // ======================================================

    if (
        status !== "ACTIVE" &&
        status !== "INACTIVE"
    ) {

        return {

            success: false,

            statusCode: 400,

            message:
                "Invalid API credential status."

        };

    }


    const [
        updated
    ] = await db.query(

        apiCredentialQueries.UPDATE_API_STATUS,

        [
            status,
            credentialId,
            merchantId
        ]

    );


    if (
        !updated.affectedRows
    ) {

        return {

            success: false,

            statusCode: 404,

            message:
                "API credential not found."

        };

    }


    return {

        success: true,

        statusCode: 200,

        message:
            "API status updated successfully.",

        data: {

            credentialId:
                Number(credentialId),

            status

        }

    };

};


// ==========================================================
// Regenerate API Credentials
// ==========================================================

const regenerateApiCredentials = async (

    merchantId,

    credentialId

) => {

    const connection =
        await db.getConnection();


    try {

        await connection.beginTransaction();


        // ==================================================
        // Check Credential Ownership
        // ==================================================

        const [
            credential
        ] = await connection.query(

            apiCredentialQueries.GET_CREDENTIAL_BY_ID,

            [
                credentialId,
                merchantId
            ]

        );


        if (!credential.length) {

            await connection.rollback();

            return {

                success: false,

                statusCode: 404,

                message:
                    "API credential not found."

            };

        }


        const oldCredential =
            credential[0];


        // ==================================================
        // Revoked Credential Cannot Be Regenerated
        // ==================================================

        if (
            oldCredential.status ===
            "REVOKED"
        ) {

            await connection.rollback();

            return {

                success: false,

                statusCode: 400,

                message:
                    "Revoked credential cannot be regenerated."

            };

        }


        // ==================================================
        // Generate Keys
        // ==================================================

        const prefix =
            oldCredential.environment ===
            "PRODUCTION"
                ? "live"
                : "test";


        const publicKey =
            `pk_${prefix}_` +
            crypto
                .randomBytes(24)
                .toString("hex");


        const secretKey =
            `sk_${prefix}_` +
            crypto
                .randomBytes(32)
                .toString("hex");


        // ==================================================
        // Hash Secret Key
        // ==================================================

        const secretHash =
            await bcrypt.hash(
                secretKey,
                12
            );


        // ==================================================
        // Inactivate Old Credential
        // ==================================================

        const [
            inactivated
        ] = await connection.query(

            apiCredentialQueries.INACTIVATE_API_CREDENTIAL,

            [
                credentialId,
                merchantId
            ]

        );


        if (
            inactivated.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to inactivate old API credential."
            );

        }


        // ==================================================
        // Create New Credential
        // ==================================================

        const [
            created
        ] = await connection.query(

            apiCredentialQueries.CREATE_API_CREDENTIAL,

            [

                merchantId,

                publicKey,

                secretHash,

                oldCredential.environment

            ]

        );


        if (
            created.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to create new API credential."
            );

        }


        await connection.commit();


        // ==================================================
        // IMPORTANT
        // ==================================================
        //
        // Secret key is returned ONLY NOW.
        // It cannot be reconstructed later because
        // only bcrypt hash is stored.
        //
        // ==================================================

        return {

            success: true,

            statusCode: 201,

            message:
                "API credentials regenerated successfully.",

            data: {

                credentialId:
                    created.insertId,

                publicKey,

                secretKey,

                environment:
                    oldCredential.environment,

                status:
                    "ACTIVE"

            }

        };

    }

    catch (error) {

        try {

            await connection.rollback();

        } catch (rollbackError) {

            console.error(
                "API Credential Rollback Error:",
                rollbackError
            );

        }

        throw error;

    }

    finally {

        connection.release();

    }

};


// ==========================================================
// Revoke API Credential
// ==========================================================

const revokeApiCredential = async (

    merchantId,

    credentialId

) => {

    // ======================================================
    // Ownership Check + Revoke
    // ======================================================

    const [
        updated
    ] = await db.query(

        apiCredentialQueries.REVOKE_API_CREDENTIAL,

        [
            credentialId,
            merchantId
        ]

    );


    if (
        !updated.affectedRows
    ) {

        return {

            success: false,

            statusCode: 404,

            message:
                "API credential not found."

        };

    }


    return {

        success: true,

        statusCode: 200,

        message:
            "API credential revoked successfully.",

        data: {

            credentialId:
                Number(credentialId),

            status:
                "REVOKED"

        }

    };

};


module.exports = {

    getApiCredentials,

    updateApiStatus,

    regenerateApiCredentials,

    revokeApiCredential

};