const refundWalletService = async (

    connection,

    {
        merchantId,
        amount,
        referenceId,
        requestReference

    }

) => {


    // ==========================================
    // Lock Wallet
    // ==========================================

    const [walletRows] = await connection.query(

        `
        SELECT *
        FROM merchant_wallets
        WHERE merchant_id = ?
        FOR UPDATE
        `,

        [
            merchantId
        ]

    );


    if(!walletRows.length){

        throw new Error(
            "Merchant wallet not found."
        );

    }


    const wallet = walletRows[0];


    const refundAmount = Number(amount);



    // ==========================================
    // Check Pending Balance
    // ==========================================

    if(
        Number(wallet.pending_balance)
        <
        refundAmount
    ){

        throw new Error(
            "Insufficient pending balance for refund."
        );

    }



    const balanceBefore =
        Number(wallet.pending_balance);



    const balanceAfter =
        balanceBefore - refundAmount;



    // ==========================================
    // Update Wallet
    // ==========================================

    await connection.query(

        `
        UPDATE merchant_wallets

        SET

        pending_balance = pending_balance - ?,

        total_refunded = total_refunded + ?,

        last_transaction_at = NOW()

        WHERE wallet_id = ?

        `,

        [

            refundAmount,

            refundAmount,

            wallet.wallet_id

        ]

    );




    // ==========================================
    // Wallet Ledger Entry
    // ==========================================

    await connection.query(

        `
        INSERT INTO wallet_transactions

        (

            wallet_id,

            merchant_id,

            transaction_type,

            source,

            amount,

            balance_before,

            balance_after,

            reference_type,

            reference_id,

            idempotency_key,

            status,

            description

        )

        VALUES

        (

            ?,
            ?,
            'DEBIT',
            'REFUND',
            ?,
            ?,
            ?,
            'REFUND_REQUEST',
            ?,
            ?,
            'COMPLETED',
            ?

        )

        `,

        [

            wallet.wallet_id,

            merchantId,

            refundAmount,

            balanceBefore,

            balanceAfter,

            referenceId,

            `REFUND_${requestReference}`,

            "Refund processed and adjusted from pending balance."

        ]

    );



    return {

        walletId:
            wallet.wallet_id,

        refundedAmount:
            refundAmount,

        balanceBefore,

        balanceAfter

    };


};


module.exports = refundWalletService;