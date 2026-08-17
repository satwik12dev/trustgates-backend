const pool =
    require(
        "../../../config/pool"
    );


const {
    GET_ALL_MERCHANT_KYC,

    GET_MERCHANT_KYC_BY_ID,
    GET_KYC_BY_ID
} =
    require(
        "../../../queries/admin/kycDocument/getKyc.query"
    );


// ==========================================================
// Get All Merchant KYC
// ==========================================================

const getAllMerchantKycService = async () => {

    const connection =
        await pool.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            GET_ALL_MERCHANT_KYC

        );


        return rows;

    } finally {

        connection.release();

    }

};


// ==========================================================
// Get KYC By Merchant ID
// ==========================================================

const getMerchantKycByIdService = async (
    merchantId
) => {

    const connection =
        await pool.getConnection();

    try {

        const [
            rows
        ] = await connection.query(

            GET_MERCHANT_KYC_BY_ID,

            [
                merchantId
            ]

        );


        return rows[0] || null;

    } finally {

        connection.release();

    }

};

const getKycByIdService = async (kycId) => {

    const connection =
        await pool.getConnection();

    try {

        const [
            rows
        ] = await connection.query(
            GET_KYC_BY_ID,
            [kycId]
        );

        return rows[0] || null;

    } finally {

        connection.release();

    }
};

module.exports = {

    getAllMerchantKycService,

    getMerchantKycByIdService,
    getKycByIdService

};