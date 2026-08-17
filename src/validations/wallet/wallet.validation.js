const {
    BadRequestError,
    ConflictError,
    UnauthorizedError
} = require(
    "../../utils/errors"
);



// ==================================================
// Validate Wallet Creation
// ==================================================

const validateWalletCreation = (

    merchantId

) => {


    if(!merchantId){


        throw new BadRequestError(
            "Merchant id is required."
        );


    }


};



// ==================================================
// Validate Wallet Exists
// ==================================================

const validateWalletExists = (

    wallet

) => {


    if(!wallet){


        throw new BadRequestError(
            "Wallet not found."
        );


    }


};



// ==================================================
// Validate Wallet Active
// ==================================================

const validateWalletActive = (

    wallet

) => {


    if(

        !wallet ||

        wallet.wallet_status !== "ACTIVE"

    ){


        throw new ConflictError(
            "Wallet is not active."
        );


    }


};



// ==================================================
// Validate Wallet Ownership
// ==================================================

const validateWalletOwnership = (

    merchantId,

    wallet

) => {


    if(

        Number(wallet.merchant_id) !==

        Number(merchantId)

    ){


        throw new UnauthorizedError(
            "Wallet does not belong to merchant."
        );


    }


};



// ==================================================
// Validate Credit Amount
// ==================================================

const validateCreditAmount = (

    amount

) => {


    if(

        amount === undefined ||

        amount === null ||

        Number(amount) <= 0

    ){


        throw new BadRequestError(
            "Credit amount must be greater than zero."
        );


    }


};



// ==================================================
// Validate Debit Amount
// ==================================================

const validateDebitAmount = (

    amount

) => {


    if(

        amount === undefined ||

        amount === null ||

        Number(amount) <= 0

    ){


        throw new BadRequestError(
            "Debit amount must be greater than zero."
        );


    }


};



// ==================================================
// Validate Sufficient Balance
// ==================================================

const validateSufficientBalance = (

    availableBalance,

    debitAmount

) => {


    if(

        Number(debitAmount) >

        Number(availableBalance)

    ){


        throw new ConflictError(
            "Insufficient wallet balance."
        );


    }


};



// ==================================================
// Validate Pending Balance
// ==================================================

const validatePendingBalance = (

    pendingBalance

) => {


    if(

        Number(pendingBalance) <= 0

    ){


        throw new ConflictError(
            "No pending balance available."
        );


    }


};



// ==================================================
// Validate Block Amount
// ==================================================

const validateBlockAmount = (

    availableBalance,

    amount

) => {


    if(

        Number(amount) >

        Number(availableBalance)

    ){


        throw new ConflictError(
            "Block amount exceeds available balance."
        );


    }


};



// ==================================================
// Validate Unblock Amount
// ==================================================

const validateUnblockAmount = (

    blockedBalance,

    amount

) => {


    if(

        Number(amount) >

        Number(blockedBalance)

    ){


        throw new ConflictError(
            "Unblock amount exceeds blocked balance."
        );


    }


};



// ==================================================
// Validate Idempotency Key
// ==================================================

const validateIdempotencyKey = (

    key

) => {


    if(!key){


        throw new BadRequestError(
            "Idempotency key is required."
        );


    }


};



// ==================================================
// Validate Pagination
// ==================================================

const validatePagination = (

    page,

    limit

) => {


    if(

        page &&

        Number(page) <= 0

    ){


        throw new BadRequestError(
            "Invalid page number."
        );


    }



    if(

        limit &&

        Number(limit) <= 0

    ){


        throw new BadRequestError(
            "Invalid limit."
        );


    }


};



// ==================================================
// Export
// ==================================================

module.exports = {


    validateWalletCreation,

    validateWalletExists,

    validateWalletActive,

    validateWalletOwnership,

    validateCreditAmount,

    validateDebitAmount,

    validateSufficientBalance,

    validatePendingBalance,

    validateBlockAmount,

    validateUnblockAmount,

    validateIdempotencyKey,

    validatePagination


};