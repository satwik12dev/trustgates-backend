const REFUND_AUDIT_QUERIES = require("../../../../queries/refund/refundAudit.query");

// ==========================================================
// Create Audit Log
// ==========================================================

const createAuditLog = async (

    connection,

    audit

) => {

    const [result] = await connection.query(

        REFUND_AUDIT_QUERIES.CREATE_AUDIT_LOG,

        [

            audit.requestId,

            audit.oldStatus,

            audit.newStatus,

            audit.action,

            audit.performedBy,

            audit.performerType,

            audit.remarks || null,

            JSON.stringify(

                audit.metadata || {}

            )

        ]

    );

    return result.insertId;

};

// ==========================================================
// Get Audit By ID
// ==========================================================

const getAuditById = async (

    connection,

    auditId

) => {

    const [rows] = await connection.query(

        REFUND_AUDIT_QUERIES.GET_AUDIT_BY_ID,

        [

            auditId

        ]

    );

    return rows[0] || null;

};

// ==========================================================
// Get Audit By Request
// ==========================================================

const getAuditByRequest = async (

    connection,

    requestId

) => {

    const [rows] = await connection.query(

        REFUND_AUDIT_QUERIES.GET_AUDIT_BY_REQUEST,

        [

            requestId

        ]

    );

    return rows;

};

// ==========================================================
// Get Latest Audit
// ==========================================================

const getLatestAudit = async (

    connection,

    requestId

) => {

    const [rows] = await connection.query(

        REFUND_AUDIT_QUERIES.GET_LATEST_AUDIT,

        [

            requestId

        ]

    );

    return rows[0] || null;

};

// ==========================================================
// List Audit Logs
// ==========================================================

const listAuditLogs = async (

    connection,

    limit,

    offset

) => {

    const [rows] = await connection.query(

        REFUND_AUDIT_QUERIES.LIST_AUDIT_LOGS,

        [

            limit,

            offset

        ]

    );

    return rows;

};

// ==========================================================
// Count Audit Logs
// ==========================================================

const countAuditLogs = async (

    connection

) => {

    const [rows] = await connection.query(

        REFUND_AUDIT_QUERIES.COUNT_AUDIT_LOGS

    );

    return rows[0].total;

};

// ==========================================================
// Delete Old Audit Logs
// ==========================================================

const deleteOldAuditLogs = async (

    connection,

    beforeDate

) => {

    const [result] = await connection.query(

        REFUND_AUDIT_QUERIES.DELETE_OLD_AUDIT_LOGS,

        [

            beforeDate

        ]

    );

    return result.affectedRows;

};

// ==========================================================
// Export
// ==========================================================

module.exports = {

    createAuditLog,

    getAuditById,

    getAuditByRequest,

    getLatestAudit,

    listAuditLogs,

    countAuditLogs,

    deleteOldAuditLogs

};