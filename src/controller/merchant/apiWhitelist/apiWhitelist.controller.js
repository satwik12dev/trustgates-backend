const {
    addIpToWhitelist,
    getWhitelistIps,
    updateIp,
    updateIpStatus,
    deleteIp
} = require(
    "../../../services/apiWhitelist/apiWhitelist.service"
);


// ==========================================================
// Add IP To Whitelist
// ==========================================================

const addIpToWhitelistMerchant = async (
    req,
    res,
    next
) => {

    try {

        const merchantId =
            req.user.merchant_id;


        const {
            credentialId
        } = req.params;


        const {
            ipAddress
        } = req.body;


        const result =
            await addIpToWhitelist(

                merchantId,

                credentialId,

                ipAddress

            );


        return res
            .status(result.statusCode)
            .json(result);

    }

    catch (error) {

        next(error);

    }

};


// ==========================================================
// Get Whitelist IPs
// ==========================================================

const getWhitelistIpsMerchant = async (
    req,
    res,
    next
) => {

    try {

        const merchantId =
            req.user.merchant_id;


        const {
            credentialId
        } = req.params;


        const result =
            await getWhitelistIps(

                merchantId,

                credentialId

            );


        return res
            .status(result.statusCode)
            .json(result);

    }

    catch (error) {

        next(error);

    }

};


// ==========================================================
// Update IP Address
// ==========================================================

const updateIpMerchant = async (
    req,
    res,
    next
) => {

    try {

        const merchantId =
            req.user.merchant_id;


        const {
            whitelistId
        } = req.params;


        const {
            ipAddress
        } = req.body;


        const result =
            await updateIp(

                merchantId,

                whitelistId,

                ipAddress

            );


        return res
            .status(result.statusCode)
            .json(result);

    }

    catch (error) {

        next(error);

    }

};


// ==========================================================
// Update IP Status
// ==========================================================

const updateIpStatusMerchant = async (
    req,
    res,
    next
) => {

    try {

        const merchantId =
            req.user.merchant_id;


        const {
            whitelistId
        } = req.params;


        const {
            status
        } = req.body;


        const result =
            await updateIpStatus(

                merchantId,

                whitelistId,

                status

            );


        return res
            .status(result.statusCode)
            .json(result);

    }

    catch (error) {

        next(error);

    }

};


// ==========================================================
// Delete IP
// ==========================================================

const deleteIpMerchant = async (
    req,
    res,
    next
) => {

    try {

        const merchantId =
            req.user.merchant_id;


        const {
            whitelistId
        } = req.params;


        const result =
            await deleteIp(

                merchantId,

                whitelistId

            );


        return res
            .status(result.statusCode)
            .json(result);

    }

    catch (error) {

        next(error);

    }

};


// ==========================================================
// Exports
// ==========================================================

module.exports = {

    addIpToWhitelistMerchant,

    getWhitelistIpsMerchant,

    updateIpMerchant,

    updateIpStatusMerchant,

    deleteIpMerchant

};