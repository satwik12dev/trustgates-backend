const net = require("net");

const db = require("../../config/pool");

const apiWhitelistQueries = require(
    "../../queries/merchant/apiWhitelist/apiWhitelist.query"
);


// ==========================================================
// Normalize + Validate IP
// ==========================================================

const validateIpAddress = (ipAddress) => {

    if (
        typeof ipAddress !== "string"
    ) {

        return null;

    }


    const normalizedIp =
        ipAddress.trim();


    if (!normalizedIp) {

        return null;

    }


    // ======================================================
    // IPv4 / IPv6
    // ======================================================

    if (
        net.isIP(normalizedIp) === 0
    ) {

        return null;

    }


    return normalizedIp;

};


// ==========================================================
// Validate Credential Ownership
// ==========================================================

const getMerchantCredential = async (

    merchantId,

    credentialId

) => {

    const [
        credential
    ] = await db.query(

        apiWhitelistQueries
            .CHECK_CREDENTIAL_BY_MERCHANT,

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


    return {

        success: true,

        credential:
            credential[0]

    };

};


// ==========================================================
// Add IP To Whitelist
// ==========================================================

const addIpToWhitelist = async (

    merchantId,

    credentialId,

    ipAddress

) => {

    const connection =
        await db.getConnection();


    try {

        await connection.beginTransaction();


        // ==================================================
        // Validate IP
        // ==================================================

        const normalizedIp =
            validateIpAddress(
                ipAddress
            );


        if (!normalizedIp) {

            await connection.rollback();

            return {

                success: false,

                statusCode: 400,

                message:
                    "Invalid IPv4 or IPv6 address."

            };

        }


        // ==================================================
        // Check Credential Ownership
        // ==================================================

        const [
            credential
        ] = await connection.query(

            apiWhitelistQueries
                .CHECK_CREDENTIAL_BY_MERCHANT,

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


        const credentialData =
            credential[0];


        // ==================================================
        // Credential Must Be ACTIVE
        // ==================================================

        if (
            credentialData.status !==
            "ACTIVE"
        ) {

            await connection.rollback();

            return {

                success: false,

                statusCode: 400,

                message:
                    "API credential is not active."

            };

        }


        // ==================================================
        // Duplicate IP Check
        // ==================================================

        const [
            existingIp
        ] = await connection.query(

            apiWhitelistQueries
                .CHECK_IP_EXISTS,

            [
                credentialId,
                normalizedIp
            ]

        );


        if (
            existingIp.length
        ) {

            await connection.rollback();

            return {

                success: false,

                statusCode: 409,

                message:
                    "IP address already exists."

            };

        }


        // ==================================================
        // Insert IP
        // ==================================================

        const [
            result
        ] = await connection.query(

            apiWhitelistQueries.CREATE_IP,

            [
                credentialId,
                normalizedIp
            ]

        );


        if (
            result.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to add IP address."
            );

        }


        await connection.commit();


        return {

            success: true,

            statusCode: 201,

            message:
                "IP address added successfully.",

            data: {

                whitelistId:
                    result.insertId,

                credentialId:
                    Number(credentialId),

                ipAddress:
                    normalizedIp,

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
                "Whitelist rollback error:",
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
// Get Whitelisted IPs
// ==========================================================

const getWhitelistIps = async (

    merchantId,

    credentialId

) => {

    // ======================================================
    // Ownership Check
    // ======================================================

    const credentialResult =
        await getMerchantCredential(

            merchantId,

            credentialId

        );


    if (
        !credentialResult.success
    ) {

        return credentialResult;

    }


    // ======================================================
    // Fetch IPs
    // ======================================================

    const [
        ips
    ] = await db.query(

        apiWhitelistQueries.GET_IPS,

        [
            credentialId
        ]

    );


    const data =
        ips.map(
            (ip) => ({

                whitelistId:
                    ip.whitelist_id,

                credentialId:
                    ip.credential_id,

                ipAddress:
                    ip.ip_address,

                status:
                    ip.status,

                createdAt:
                    ip.created_at

            })
        );


    return {

        success: true,

        statusCode: 200,

        message:
            "Whitelist IPs fetched successfully.",

        total:
            data.length,

        data

    };

};


// ==========================================================
// Update IP Address
// ==========================================================

const updateIp = async (

    merchantId,

    whitelistId,

    ipAddress

) => {

    const connection =
        await db.getConnection();


    try {

        await connection.beginTransaction();


        // ==================================================
        // Validate IP
        // ==================================================

        const normalizedIp =
            validateIpAddress(
                ipAddress
            );


        if (!normalizedIp) {

            await connection.rollback();

            return {

                success: false,

                statusCode: 400,

                message:
                    "Invalid IPv4 or IPv6 address."

            };

        }


        // ==================================================
        // Check Ownership
        // ==================================================

        const [
            existingIp
        ] = await connection.query(

            apiWhitelistQueries
                .GET_IP_BY_ID_AND_MERCHANT,

            [
                whitelistId,
                merchantId
            ]

        );


        if (!existingIp.length) {

            await connection.rollback();

            return {

                success: false,

                statusCode: 404,

                message:
                    "Whitelisted IP not found."

            };

        }


        const currentIp =
            existingIp[0];


        // ==================================================
        // Revoked Credential
        // ==================================================

        if (
            currentIp.credential_status ===
            "REVOKED"
        ) {

            await connection.rollback();

            return {

                success: false,

                statusCode: 400,

                message:
                    "Cannot modify IP for a revoked API credential."

            };

        }


        // ==================================================
        // Duplicate Check
        // ==================================================

        const [
            duplicate
        ] = await connection.query(

            apiWhitelistQueries
                .CHECK_IP_EXISTS,

            [
                currentIp.credential_id,
                normalizedIp
            ]

        );


        if (
            duplicate.length &&
            Number(
                duplicate[0].whitelist_id
            ) !== Number(
                whitelistId
            )
        ) {

            await connection.rollback();

            return {

                success: false,

                statusCode: 409,

                message:
                    "IP address already exists."

            };

        }


        // ==================================================
        // Update
        // ==================================================

        const [
            updated
        ] = await connection.query(

            apiWhitelistQueries.UPDATE_IP,

            [

                normalizedIp,

                whitelistId,

                merchantId

            ]

        );


        if (
            updated.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to update IP address."
            );

        }


        await connection.commit();


        return {

            success: true,

            statusCode: 200,

            message:
                "IP address updated successfully.",

            data: {

                whitelistId:
                    Number(whitelistId),

                ipAddress:
                    normalizedIp

            }

        };

    }

    catch (error) {

        try {

            await connection.rollback();

        } catch (rollbackError) {

            console.error(
                "Whitelist update rollback error:",
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
// Update IP Status
// ==========================================================

const updateIpStatus = async (

    merchantId,

    whitelistId,

    status

) => {

    // ======================================================
    // Validate Status
    // ======================================================

    if (
        status !== "ACTIVE" &&
        status !== "INACTIVE"
    ) {

        return {

            success: false,

            statusCode: 400,

            message:
                "Invalid IP whitelist status."

        };

    }


    const connection =
        await db.getConnection();


    try {

        await connection.beginTransaction();


        // ==================================================
        // Ownership Check
        // ==================================================

        const [
            existingIp
        ] = await connection.query(

            apiWhitelistQueries
                .GET_IP_BY_ID_AND_MERCHANT,

            [
                whitelistId,
                merchantId
            ]

        );


        if (!existingIp.length) {

            await connection.rollback();

            return {

                success: false,

                statusCode: 404,

                message:
                    "Whitelisted IP not found."

            };

        }


        if (
            existingIp[0].credential_status ===
            "REVOKED"
        ) {

            await connection.rollback();

            return {

                success: false,

                statusCode: 400,

                message:
                    "Cannot modify IP for a revoked API credential."

            };

        }


        // ==================================================
        // Update Status
        // ==================================================

        const [
            updated
        ] = await connection.query(

            apiWhitelistQueries
                .UPDATE_IP_STATUS,

            [

                status,

                whitelistId,

                merchantId

            ]

        );


        if (
            updated.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to update IP status."
            );

        }


        await connection.commit();


        return {

            success: true,

            statusCode: 200,

            message:
                "IP status updated successfully.",

            data: {

                whitelistId:
                    Number(whitelistId),

                status

            }

        };

    }

    catch (error) {

        try {

            await connection.rollback();

        } catch (rollbackError) {

            console.error(
                "Whitelist status rollback error:",
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
// Delete IP
// ==========================================================

const deleteIp = async (

    merchantId,

    whitelistId

) => {

    const connection =
        await db.getConnection();


    try {

        await connection.beginTransaction();


        // ==================================================
        // Ownership Check
        // ==================================================

        const [
            existingIp
        ] = await connection.query(

            apiWhitelistQueries
                .GET_IP_BY_ID_AND_MERCHANT,

            [
                whitelistId,
                merchantId
            ]

        );


        if (!existingIp.length) {

            await connection.rollback();

            return {

                success: false,

                statusCode: 404,

                message:
                    "Whitelisted IP not found."

            };

        }


        if (
            existingIp[0].credential_status ===
            "REVOKED"
        ) {

            await connection.rollback();

            return {

                success: false,

                statusCode: 400,

                message:
                    "Cannot delete IP for a revoked API credential."

            };

        }


        // ==================================================
        // Delete
        // ==================================================

        const [
            deleted
        ] = await connection.query(

            apiWhitelistQueries.DELETE_IP,

            [

                whitelistId,

                merchantId

            ]

        );


        if (
            deleted.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to delete IP address."
            );

        }


        await connection.commit();


        return {

            success: true,

            statusCode: 200,

            message:
                "IP address deleted successfully.",

            data: {

                whitelistId:
                    Number(whitelistId)

            }

        };

    }

    catch (error) {

        try {

            await connection.rollback();

        } catch (rollbackError) {

            console.error(
                "Whitelist delete rollback error:",
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
// Exports
// ==========================================================

module.exports = {

    addIpToWhitelist,

    getWhitelistIps,

    updateIp,

    updateIpStatus,

    deleteIp

};