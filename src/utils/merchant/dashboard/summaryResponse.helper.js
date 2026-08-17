const buildDashboardSummaryResponse = (
    transactionSummary,
    walletSummary
) => {

    const transactionData = transactionSummary || {};
    const walletData = walletSummary || {};

    return {

    success: true,

    data: {

        totalPayIn:
            Number(
                transactionData.total_payin || 0
            ),

        totalPayOut:
            Number(
                transactionData.total_payout || 0
            ),

        totalTransactions:
            Number(
                transactionData.total_transactions || 0
            ),

        successfulTransactions:
            Number(
                transactionData.successful_transactions || 0
            ),

        failedTransactions:
            Number(
                transactionData.failed_transactions || 0
            ),

        pendingTransactions:
            Number(
                transactionData.pending_transactions || 0
            ),

        authorizedTransactions:
            Number(
                transactionData.authorized_transactions || 0
            ),

        cancelledTransactions:
            Number(
                transactionData.cancelled_transactions || 0
            ),

        refundCount:
            Number(
                transactionData.refund_count || 0
            ),

        chargebacks:
            Number(
                transactionData.chargebacks || 0
            ),

        successRate:
            Number(
                transactionData.success_rate || 0
            ),

        avgTransaction:
            Number(
                transactionData.avg_transaction || 0
            ),

        availableBalance:
            Number(
                walletData.available_balance || 0
            ),

        settledAmount:
            Number(
                walletData.total_settled || 0
            ),

        refundedAmount:
            Number(
                transactionData.refunded_amount || 0
            ),

        pendingBalance:
            Number(
                walletData.pending_balance || 0
            )

    }

};
};

module.exports = {
    buildDashboardSummaryResponse
};