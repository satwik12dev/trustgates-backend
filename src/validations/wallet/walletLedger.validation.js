const {
    BadRequestError
} = require(
    "../../utils/errors"
);



// ==================================================
// Validate Ledger Entry
// ==================================================

const validateLedgerEntry = ({

    walletId,

    merchantId,

    amount,

    referenceType,

    referenceId,

    idempotencyKey


}) => {



    if(

        !walletId ||

        !merchantId

    ){


        throw new BadRequestError(
            "Wallet information is required."
        );


    }



    if(

        amount === undefined ||

        amount === null ||

        Number(amount) <= 0

    ){


        throw new BadRequestError(
            "Ledger amount must be greater than zero."
        );


    }



    if(

        !referenceType ||

        !referenceId

    ){


        throw new BadRequestError(
            "Reference information is required."
        );


    }



    if(!idempotencyKey){


        throw new BadRequestError(
            "Idempotency key is required."
        );


    }


};



// ==================================================
// Validate Transaction Type
// ==================================================

const validateTransactionType = (

    type

) => {


    const allowedTypes = [

        "CREDIT",

        "DEBIT"

    ];



    if(

        !allowedTypes.includes(type)

    ){


        throw new BadRequestError(
            "Invalid wallet transaction type."
        );


    }


};



// ==================================================
// Validate Ledger Source
// ==================================================

const validateLedgerSource = (

    source

) => {


    const allowedSources = [

        "PAYMENT",

        "REFUND",

        "SETTLEMENT",

        "FEE",

        "ADJUSTMENT"

    ];



    if(

        !allowedSources.includes(source)

    ){


        throw new BadRequestError(
            "Invalid wallet ledger source."
        );


    }


};



// ==================================================
// Validate Reference Type
// ==================================================

const validateReferenceType = (

    type

) => {


    const allowedTypes = [

        "PAYMENT",

        "REFUND",

        "SETTLEMENT",

        "ADJUSTMENT"

    ];



    if(

        !allowedTypes.includes(type)

    ){


        throw new BadRequestError(
            "Invalid wallet reference type."
        );


    }


};



// ==================================================
// Validate Ledger Status
// ==================================================

const validateLedgerStatus = (

    status

) => {


    const allowedStatus = [

        "PENDING",

        "COMPLETED",

        "FAILED",

        "REVERSED"

    ];



    if(

        !allowedStatus.includes(status)

    ){


        throw new BadRequestError(
            "Invalid wallet ledger status."
        );


    }


};



// ==================================================
// Export
// ==================================================

module.exports = {


    validateLedgerEntry,

    validateTransactionType,

    validateLedgerSource,

    validateReferenceType,

    validateLedgerStatus


};