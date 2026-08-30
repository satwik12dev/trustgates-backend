const {
    getApiCredentials,

    updateApiStatus,

    regenerateApiCredentials,

    revokeApiCredential

} = require(
    "../../../services/apiCredential/apiCredential.service"
);


const apiCredentialValidation = require(
    "../../../validations/apiCredential/apiCredential.validation"
);

const sendApiKeyRegeneratedEmail = require(
    "../../../services/email/sendApiKeyRegeneratedEmail"
);


// ==========================================================
// Get Merchant API Credentials
// ==========================================================

const getApiCredentialsmerchant = async(req,res,next)=>{

    try{


        const merchantId =
            req.user.merchant_id;



        const result =
            await getApiCredentials(

                merchantId

            );



        return res
            .status(result.statusCode)
            .json(result);


    }
    catch(error){

        next(error);

    }

};



// ==========================================================
// Update API Status
// ==========================================================

const updateApiStatusmerchant = async(req,res,next)=>{


    try{


        const {error} =
        apiCredentialValidation
        .updateApiStatusValidation
        .validate(
            req.body
        );



        if(error){

            return res.status(400).json({

                success:false,

                message:
                error.details[0].message

            });

        }



        const merchantId =
            req.user.merchant_id;



        const {
            credentialId
        } = req.params;



        const {
            status
        } = req.body;



        const result =
        await updateApiStatus(

            merchantId,

            credentialId,

            status

        );



        return res
        .status(result.statusCode)
        .json(result);


    }
    catch(error){

        next(error);

    }


};



// ==========================================================
// Regenerate API Credentials
// ==========================================================

const regenerateApiCredentialsmerchant = async(
    req,
    res,
    next
)=>{


    try{


        const merchantId =
            req.user.merchant_id;



        const {
            credentialId
        } = req.params;



        const result =
        await regenerateApiCredentials(

            merchantId,

            credentialId

        );



        if (result.success && req.user && req.user.email) {
            sendApiKeyRegeneratedEmail(
                req.user.merchant_name,
                req.user.email,
                {
                    keyType: "Production API Credentials",
                    time: new Date().toUTCString()
                }
            ).catch((err) => {
                console.error("Failed to send API key regenerated email:", err.message);
            });
        }

        return res
        .status(result.statusCode)
        .json(result);


    }
    catch(error){

        next(error);

    }


};




// ==========================================================
// Revoke API Credential
// ==========================================================

const revokeApiCredentialmerchant = async(
    req,
    res,
    next
)=>{


    try{


        const merchantId =
            req.user.merchant_id;



        const {
            credentialId
        } = req.params;



        const result =
        await revokeApiCredential(

            merchantId,

            credentialId

        );



        return res
        .status(result.statusCode)
        .json(result);


    }
    catch(error){

        next(error);

    }


};




// ==========================================================
// Export
// ==========================================================

module.exports = {
    getApiCredentialsmerchant,
    updateApiStatusmerchant,
    regenerateApiCredentialsmerchant,
    revokeApiCredentialmerchant
};