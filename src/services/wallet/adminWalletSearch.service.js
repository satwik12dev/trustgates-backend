const pool = require(
    "../../config/pool"
);


const ADMIN_WALLET_QUERIES = require(
    "../../queries/wallet/adminWallet.query"
);


// ==================================================
// Search Admin Wallet
// ==================================================

const adminWalletSearchService = async (filters) => {


    const connection = await pool.getConnection();


    try {


        const {

            merchantId,

            walletId,

            merchantName,

            email,

            merchantCode,

            status,

            page = 1,

            limit = 20


        } = filters;



        const offset =

            (

                Number(page) - 1

            )

            *

            Number(limit);



        let query =

            ADMIN_WALLET_QUERIES.SEARCH_WALLETS;



        const params = [];



        // ==========================================
        // Filters
        // ==========================================


        if (merchantId) {


            query += `

            AND mw.merchant_id = ?

            `;


            params.push(

                merchantId

            );


        }



        if (walletId) {


            query += `

            AND mw.wallet_id = ?

            `;


            params.push(

                walletId

            );


        }



        if (merchantName) {


            query += `

            AND m.merchant_name LIKE ?

            `;


            params.push(

                `%${merchantName}%`

            );


        }



        if (email) {


            query += `

            AND m.email LIKE ?

            `;


            params.push(

                `%${email}%`

            );


        }



        if (merchantCode) {


            query += `

            AND m.merchant_code = ?

            `;


            params.push(

                merchantCode

            );


        }



        if (status) {


            query += `

            AND mw.wallet_status = ?

            `;


            params.push(

                status

            );


        }



        query += `

        ORDER BY mw.created_at DESC

        LIMIT ? OFFSET ?

        `;



        params.push(

            Number(limit),

            Number(offset)

        );



        const [

            rows

        ] = await connection.query(

            query,

            params

        );



        return {


            page:

                Number(page),



            limit:

                Number(limit),



            count:

                rows.length,



            wallets:

                rows.map(wallet => ({



                    walletId:

                        wallet.wallet_id,



                    merchantId:

                        wallet.merchant_id,



                    merchantName:

                        wallet.merchant_name,



                    email:

                        wallet.email,



                    merchantCode:

                        wallet.merchant_code,



                    balance: {

                        available:
                            Number(wallet.available_balance),

                        pending:
                            Number(wallet.pending_balance),

                        reserved:
                            Number(wallet.reserved_balance),

                        blocked:
                            Number(wallet.blocked_balance)

                    },
                    totals: {


                        received:

                            Number(
                                wallet.total_received
                            ),



                        refunded:

                            Number(
                                wallet.total_refunded
                            ),



                        settled:

                            Number(
                                wallet.total_settled
                            )


                    },



                    currency:

                        wallet.currency,



                    status:

                        wallet.wallet_status,



                    createdAt:

                        wallet.created_at



                }))


        };


    }

    finally {


        connection.release();


    }


};



module.exports = adminWalletSearchService;