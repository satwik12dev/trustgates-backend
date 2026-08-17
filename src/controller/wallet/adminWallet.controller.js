const pool = require(
    "../../config/pool"
);


const getWalletService = require(
    "../../services/wallet/getWallet.service"
);


const adminWalletSearchService = require(
    "../../services/wallet/adminWalletSearch.service"
);


const blockWalletBalanceService = require(
    "../../services/wallet/blockWalletBalance.service"
);


const unblockWalletBalanceService = require(
    "../../services/wallet/unblockWalletBalance.service"
);


const adjustWalletBalanceService = require(
    "../../services/wallet/adjustWalletBalance.service"
);



// ==================================================
// Get Merchant Wallet By ID
// ==================================================

const getAdminWalletController = async (

    req,

    res,

    next

) => {


    try {


        const {

            merchantId

        } = req.params;



        const wallet = await getWalletService(

            merchantId

        );



        return res.status(200).json({

            success:true,

            data:wallet

        });


    }

    catch(error){

        next(error);

    }


};




// ==================================================
// Search Merchant Wallet
// ==================================================

const searchWalletController = async (

    req,

    res,

    next

) => {


    try {


        const result = await adminWalletSearchService(

            req.query

        );



        return res.status(200).json({

            success:true,

            data:result

        });


    }

    catch(error){

        next(error);

    }


};




// ==================================================
// Block Wallet Balance
// ==================================================

const blockWalletController = async (

    req,

    res,

    next

) => {


    const connection = await pool.getConnection();


    try {


        await connection.beginTransaction();



        const result = await blockWalletBalanceService(

            connection,

            {

                merchantId:

                    req.body.merchantId,


                amount:

                    req.body.amount,


                referenceId:

                    req.body.referenceId,


                idempotencyKey:

                    req.body.idempotencyKey,


                reason:

                    req.body.reason


            }

        );



        await connection.commit();



        return res.status(200).json({

            success:true,

            data:result

        });



    }

    catch(error){


        await connection.rollback();

        next(error);


    }

    finally{


        connection.release();


    }


};




// ==================================================
// Unblock Wallet Balance
// ==================================================

const unblockWalletController = async (

    req,

    res,

    next

) => {


    const connection = await pool.getConnection();


    try {


        await connection.beginTransaction();



        const result = await unblockWalletBalanceService(

            connection,

            {


                merchantId:

                    req.body.merchantId,


                amount:

                    req.body.amount,


                referenceId:

                    req.body.referenceId,


                idempotencyKey:

                    req.body.idempotencyKey,


                reason:

                    req.body.reason


            }

        );



        await connection.commit();



        return res.status(200).json({

            success:true,

            data:result

        });



    }

    catch(error){


        await connection.rollback();


        next(error);


    }

    finally{


        connection.release();


    }


};




// ==================================================
// Adjust Wallet Balance
// ==================================================

const adjustWalletController = async (

    req,

    res,

    next

) => {


    const connection = await pool.getConnection();


    try {


        await connection.beginTransaction();



        const result = await adjustWalletBalanceService(

            connection,

            {


                merchantId:

                    req.body.merchantId,


                amount:

                    req.body.amount,


                type:

                    req.body.type,


                referenceId:

                    req.body.referenceId,


                idempotencyKey:

                    req.body.idempotencyKey,


                reason:

                    req.body.reason,


                performedBy:

                    req.user.admin_id


            }

        );



        await connection.commit();



        return res.status(200).json({

            success:true,

            data:result

        });



    }

    catch(error){


        await connection.rollback();


        next(error);


    }

    finally{


        connection.release();


    }


};





module.exports = {


    getAdminWalletController,

    searchWalletController,

    blockWalletController,

    unblockWalletController,

    adjustWalletController


};