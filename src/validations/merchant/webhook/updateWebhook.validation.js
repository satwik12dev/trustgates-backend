// ==========================================================
// Update Merchant Webhook Validation
// ==========================================================


const validateUpdateWebhook = (data) => {


    const {

        webhookUrl,

        events,

        status


    } = data;



    // ==========================================
    // Check At Least One Field
    // ==========================================

    if (

        webhookUrl === undefined &&

        events === undefined &&

        status === undefined

    ) {


        throw new Error(
            "At least one field is required to update."
        );


    }



    // ==========================================
    // Webhook URL Validation
    // ==========================================

    if(webhookUrl !== undefined){


        const urlRegex =
            /^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/.*)?$/;



        if(!urlRegex.test(webhookUrl)){


            throw new Error(
                "Invalid webhook URL."
            );


        }


    }



    // ==========================================
    // Events Validation
    // ==========================================

    if(events !== undefined){


        if(!Array.isArray(events)){


            throw new Error(
                "Events must be an array."
            );


        }



        if(events.length === 0){


            throw new Error(
                "Events cannot be empty."
            );


        }



        const allowedEvents = [


            "payment.success",

            "payment.failed",

            "payment.pending",

            "refund.processed",

            "refund.failed"


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


    }



    // ==========================================
    // Status Validation
    // ==========================================

    if(status !== undefined){


        const allowedStatus = [


            "ACTIVE",

            "INACTIVE"


        ];



        if(!allowedStatus.includes(status)){


            throw new Error(
                "Invalid webhook status."
            );


        }


    }



    return true;


};



module.exports = {

    validateUpdateWebhook

};