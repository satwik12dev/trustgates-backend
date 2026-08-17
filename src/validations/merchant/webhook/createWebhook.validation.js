// ==========================================================
// Create Merchant Webhook Validation
// ==========================================================


const validateCreateWebhook = (data) => {


    const {
        webhookUrl,
        events
    } = data;



    // ==========================================
    // Required Fields
    // ==========================================

    if(!webhookUrl || !events){


        throw new Error(
            "Webhook URL and events are required."
        );


    }



    // ==========================================
    // URL Validation
    // ==========================================

    const url = new URL(webhookUrl);

if(
    !["http:","https:"].includes(url.protocol)
){
    throw new Error(
        "Invalid webhook URL."
    );
}



    // ==========================================
    // Events Validation
    // ==========================================

    if(!Array.isArray(events)){


        throw new Error(
            "Events must be an array."
        );


    }



    if(events.length === 0){


        throw new Error(
            "At least one webhook event is required."
        );


    }



    // ==========================================
    // Allowed Events
    // ==========================================

    const allowedEvents = [


        "payment.success",

        "payment.failed",

        "payment.pending",

        "refund.processed",

        "refund.failed",

        "refund.created"
    ];



    const invalidEvents = events.filter(

        event =>
            !allowedEvents.includes(event)

    );



    if(invalidEvents.length > 0){


        throw new Error(

            `Invalid webhook events: ${invalidEvents.join(", ")}`

        );


    }



    return true;


};



module.exports = {

    validateCreateWebhook

};