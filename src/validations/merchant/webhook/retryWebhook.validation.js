const validateRetryWebhook = (logId)=>{

    if(!logId){
        throw new Error(
            "Webhook log id required."
        );
    }

    if(isNaN(logId)){
        throw new Error(
            "Invalid webhook log id."
        );
    }
    return true;
};

module.exports = validateRetryWebhook;