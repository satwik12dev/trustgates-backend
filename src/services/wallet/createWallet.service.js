const WALLET_QUERIES = require(
    "../../queries/wallet/wallet.query"
);


const {

    checkWalletExists

} = require(
    "./helpers/wallet.helper"
);


const {

    createWalletAuditLog

} = require(
    "./helpers/walletAudit.helper"
);


const {

    validateWalletCreation

} = require(
    "./helpers/walletValidation.helper"
);


const generateWalletReference = require(
    "../../utils/wallet/walletReference.generator"
);


const {

    ConflictError

} = require(
    "../../utils/errors"
);



// ==================================================
// Create Merchant Wallet
// ==================================================

const createWalletService = async (

    connection,

    {

        merchantId,

        currency = "INR"

    }

) => {



    // ==========================================
    // Validate Input
    // ==========================================

    validateWalletCreation(

        merchantId

    );



    // ==========================================
    // Check Existing Wallet
    // ==========================================

    const walletExists = await checkWalletExists(

        connection,

        merchantId

    );



    if(walletExists){


        throw new ConflictError(

            "Wallet already exists for this merchant."

        );


    }



    // ==========================================
    // Create Wallet
    // ==========================================

    const [

        result

    ] = await connection.query(

        WALLET_QUERIES.CREATE_WALLET,

        [

            merchantId,

            currency

        ]

    );



    const walletId = result.insertId;



    // ==========================================
    // Create Audit Log
    // ==========================================

    await createWalletAuditLog(

        connection,

        {

            walletId,


            merchantId,


            action:

                "WALLET_CREATED",



            amount:

                0,



            performedBy:

                merchantId,



            performerType:

                "SYSTEM",



            remarks:

                "Merchant wallet created during signup.",



            metadata: {


                reference:

                    generateWalletReference(
                        "CREATE"
                    )


            }


        }

    );



    return {


        walletId,


        merchantId,


        currency,


        status:

            "ACTIVE"


    };


};



module.exports = createWalletService;