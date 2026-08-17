const WALLET_AUDIT_QUERIES = {


    // ==================================================
    // Create Wallet Audit Log
    // ==================================================

    CREATE_AUDIT_LOG: `

        INSERT INTO wallet_audit_logs
        (

            wallet_id,

            merchant_id,

            action,

            amount,

            performed_by,

            performer_type,

            ip_address,

            user_agent,

            remarks,

            metadata

        )

        VALUES

        (

            ?,

            ?,

            ?,

            ?,

            ?,

            ?,

            ?,

            ?,

            ?,

            ?

        )

    `,


    // ==================================================
    // Get Wallet Audit Logs
    // ==================================================

    GET_WALLET_AUDIT_LOGS: `

        SELECT

            audit_id,

            action,

            amount,

            performed_by,

            performer_type,

            ip_address,

            user_agent,

            remarks,

            metadata,

            created_at


        FROM wallet_audit_logs


        WHERE wallet_id = ?


        ORDER BY created_at DESC


        LIMIT ?

        OFFSET ?

    `,


    // ==================================================
    // Get Merchant Audit Logs
    // ==================================================

    GET_MERCHANT_AUDIT_LOGS: `

        SELECT

            audit_id,

            wallet_id,

            action,

            amount,

            performed_by,

            performer_type,

            remarks,

            metadata,

            created_at


        FROM wallet_audit_logs


        WHERE merchant_id = ?


        ORDER BY created_at DESC


        LIMIT ?

        OFFSET ?

    `,


    // ==================================================
    // Get Audit By ID
    // ==================================================

    GET_AUDIT_BY_ID: `

        SELECT *

        FROM wallet_audit_logs

        WHERE audit_id = ?

    `,


    // ==================================================
    // Get Admin Actions
    // ==================================================

    GET_ADMIN_ACTIONS: `

        SELECT

            *

        FROM wallet_audit_logs


        WHERE performer_type = 'ADMIN'


        ORDER BY created_at DESC


        LIMIT ?

        OFFSET ?

    `,


    // ==================================================
    // Get System Actions
    // ==================================================

    GET_SYSTEM_ACTIONS: `

        SELECT

            *

        FROM wallet_audit_logs


        WHERE performer_type = 'SYSTEM'


        ORDER BY created_at DESC


        LIMIT ?

        OFFSET ?

    `
};


module.exports = WALLET_AUDIT_QUERIES;