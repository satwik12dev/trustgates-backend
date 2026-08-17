const WALLET_AUDIT_QUERIES = require(
    "../../../queries/wallet/walletAudit.query"
);



// Create Wallet Audit Log

const createWalletAuditLog = async (

    connection,

    auditData

) => {


    const [

        result

    ] = await connection.query(

        WALLET_AUDIT_QUERIES.CREATE_AUDIT_LOG,

        [

            auditData.walletId,

            auditData.merchantId,

            auditData.action,

            Number(auditData.amount || 0),

            auditData.performedBy || null,

            auditData.performerType,

            auditData.ipAddress || null,

            auditData.userAgent || null,

            auditData.remarks || null,

            JSON.stringify(

                auditData.metadata || {}

            )

        ]

    );


    return result.insertId;

};



// Get Wallet Audit Logs

const getWalletAuditLogs = async (

    connection,

    {

        walletId,

        limit = 20,

        offset = 0

    }

) => {


    const [

        rows

    ] = await connection.query(

        WALLET_AUDIT_QUERIES.GET_WALLET_AUDIT_LOGS,

        [

            walletId,

            Number(limit),

            Number(offset)

        ]

    );


    return rows;

};



// Get Merchant Audit Logs

const getMerchantAuditLogs = async (

    connection,

    {

        merchantId,

        limit = 20,

        offset = 0

    }

) => {


    const [

        rows

    ] = await connection.query(

        WALLET_AUDIT_QUERIES.GET_MERCHANT_AUDIT_LOGS,

        [

            merchantId,

            Number(limit),

            Number(offset)

        ]

    );


    return rows;

};



// Get Audit By ID

const getAuditById = async (

    connection,

    auditId

) => {


    const [

        rows

    ] = await connection.query(

        WALLET_AUDIT_QUERIES.GET_AUDIT_BY_ID,

        [

            auditId

        ]

    );


    return rows[0] || null;

};



module.exports = {

    createWalletAuditLog,

    getWalletAuditLogs,

    getMerchantAuditLogs,

    getAuditById

};