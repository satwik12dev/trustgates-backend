const {
    ConflictError
} = require(
    "../../utils/errors"
);


// ==================================================
// Update Wallet Balance
// ==================================================

const updateWalletBalanceService = async (

    connection,

    {

        walletId,

        availableBalance,

        pendingBalance,

        reservedBalance,

        blockedBalance,

        totalReceived,

        totalRefunded,

        totalSettled,

        version

    }

) => {


    // ==============================================
    // Validate Reserved Balance
    // ==============================================

    if (
        reservedBalance === undefined ||
        reservedBalance === null
    ) {

        throw new Error(
            "Reserved balance is required."
        );

    }


    // ==============================================
    // Update Wallet
    // ==============================================

    const [

        result

    ] = await connection.query(

        `

        UPDATE merchant_wallets

        SET

            available_balance = ?,

            pending_balance = ?,

            reserved_balance = ?,

            blocked_balance = ?,

            total_received = ?,

            total_refunded = ?,

            total_settled = ?,

            last_transaction_at = NOW(),

            version = version + 1,

            updated_at = NOW()

        WHERE wallet_id = ?

          AND version = ?

        `,

        [

            Number(availableBalance),

            Number(pendingBalance),

            Number(reservedBalance),

            Number(blockedBalance),

            Number(totalReceived),

            Number(totalRefunded),

            Number(totalSettled),

            walletId,

            version

        ]

    );


    // ==============================================
    // Optimistic Lock Check
    // ==============================================

    if (
        result.affectedRows === 0
    ) {

        throw new ConflictError(

            "Wallet balance update conflict. Please retry."

        );

    }


    // ==============================================
    // Success
    // ==============================================

    return true;

};


// ==================================================
// Export
// ==================================================

module.exports =
    updateWalletBalanceService;