// ==========================================================
// Refund Audit Queries
// ==========================================================

const REFUND_AUDIT_QUERIES = {

    // ======================================================
    // Create Audit Log
    // ======================================================

    CREATE_AUDIT_LOG: `

        INSERT INTO refund_audit_logs (

            request_id,

            old_status,

            new_status,

            action,

            performed_by,

            performer_type,

            remarks,

            metadata

        )

        VALUES (

            ?, ?, ?, ?, ?, ?, ?, ?

        )

    `,

    // ======================================================
    // Get Audit Log By ID
    // ======================================================

    GET_AUDIT_BY_ID: `

        SELECT *

        FROM refund_audit_logs

        WHERE audit_id = ?

    `,

    // ======================================================
    // Get Audit Logs By Request
    // ======================================================

    GET_AUDIT_BY_REQUEST: `

        SELECT *

        FROM refund_audit_logs

        WHERE request_id = ?

        ORDER BY created_at DESC

    `,

    // ======================================================
    // List Audit Logs
    // ======================================================

    LIST_AUDIT_LOGS: `

        SELECT *

        FROM refund_audit_logs

        ORDER BY created_at DESC

        LIMIT ?

        OFFSET ?

    `,

    // ======================================================
    // Count Audit Logs
    // ======================================================

    COUNT_AUDIT_LOGS: `

        SELECT

            COUNT(*) AS total

        FROM refund_audit_logs

    `,

    // ======================================================
    // Get Latest Audit
    // ======================================================

    GET_LATEST_AUDIT: `

        SELECT *

        FROM refund_audit_logs

        WHERE request_id = ?

        ORDER BY audit_id DESC

        LIMIT 1

    `,

    // ======================================================
    // Delete Old Audit Logs (Cron)
    // ======================================================

    DELETE_OLD_AUDIT_LOGS: `

        DELETE

        FROM refund_audit_logs

        WHERE created_at < ?

    `

};

// ==========================================================
// Export
// ==========================================================

module.exports = REFUND_AUDIT_QUERIES;