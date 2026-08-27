const {
    getAdminWallet,
    getAdminWalletSummary,
    getFeeRevenue,
    getSourceRevenue,
    getMerchantRevenue,
    getDailyRevenue,
    getRefundFeeAnalytics,
    getRecentTransactions,
    getReconciliation
} = require(
    "./helpers/adminWalletAnalytics.helper"
);


const getAdminWalletAnalyticsService = async (
    connection,
    {
        dateFrom = null,
        dateTo = null,
        recentLimit = 20
    } = {}
) => {

    // ======================================================
    // Date Defaults
    // ======================================================

    const today =
        new Date()
            .toISOString()
            .slice(0, 10);

    const finalDateFrom =
        dateFrom || today;

    const finalDateTo =
        dateTo || today;


    // ======================================================
    // Validate Date Format
    // ======================================================

    const dateRegex =
        /^\d{4}-\d{2}-\d{2}$/;

    if (
        !dateRegex.test(finalDateFrom) ||
        !dateRegex.test(finalDateTo)
    ) {
        throw new Error(
            "Invalid date format. Use YYYY-MM-DD."
        );
    }


    // ======================================================
    // Validate Date Range
    // ======================================================

    if (
        finalDateFrom >
        finalDateTo
    ) {
        throw new Error(
            "dateFrom cannot be greater than dateTo."
        );
    }


    // ======================================================
    // Exclusive End Date
    // ======================================================

    const endDate =
        new Date(
            `${finalDateTo}T00:00:00`
        );

    endDate.setDate(
        endDate.getDate() + 1
    );

    const queryDateTo =
        endDate
            .toISOString()
            .slice(0, 19)
            .replace("T", " ");


    const queryDateFrom =
        `${finalDateFrom} 00:00:00`;


    // ======================================================
    // Fetch Analytics
    // ======================================================

    const [
        wallet,
        summary,
        feeRevenue,
        sourceRevenue,
        merchantRevenue,
        refundFees,
        dailyRevenue,
        recentTransactions,
        reconciliation
    ] = await Promise.all([

        getAdminWallet(
            connection
        ),

        getAdminWalletSummary(
            connection,
            queryDateFrom,
            queryDateTo
        ),

        getFeeRevenue(
            connection,
            queryDateFrom,
            queryDateTo
        ),

        getSourceRevenue(
            connection,
            queryDateFrom,
            queryDateTo
        ),

        getMerchantRevenue(
            connection,
            queryDateFrom,
            queryDateTo
        ),

        getRefundFeeAnalytics(
            connection,
            queryDateFrom,
            queryDateTo
        ),

        getDailyRevenue(
            connection,
            queryDateFrom,
            queryDateTo
        ),

        getRecentTransactions(
            connection,
            recentLimit
        ),

        getReconciliation(
            connection
        )

    ]);


    if (!wallet) {

        throw new Error(
            "Active admin wallet not found."
        );

    }


    // ======================================================
    // Reconciliation
    // ======================================================

    const calculatedBalance =
        Number(
            reconciliation.total_credits
        ) -
        Number(
            reconciliation.total_debits
        );

    const currentBalance =
        Number(wallet.balance);

    const difference =
        currentBalance -
        calculatedBalance;


    // ======================================================
    // Response
    // ======================================================

    return {

        period: {

            dateFrom:
                finalDateFrom,

            dateTo:
                finalDateTo

        },


        wallet: {

            adminWalletId:
                wallet.admin_wallet_id,

            balance:
                currentBalance,

            currency:
                wallet.currency,

            status:
                wallet.status

        },


        summary: {

            totalCredits:
                Number(
                    summary.total_credits
                ),

            totalDebits:
                Number(
                    summary.total_debits
                ),

            netMovement:
                Number(
                    summary.total_credits
                ) -
                Number(
                    summary.total_debits
                ),

            completedTransactions:
                Number(
                    summary.completed_transactions
                ),

            pendingTransactions:
                Number(
                    summary.pending_transactions
                ),

            failedTransactions:
                Number(
                    summary.failed_transactions
                ),

            reversedTransactions:
                Number(
                    summary.reversed_transactions
                )

        },


        revenue: {

            total:
                Number(
                    feeRevenue.total_fee_revenue
                ),

            transactionCount:
                Number(
                    feeRevenue.fee_transaction_count
                ),

            averageFee:
                Number(
                    feeRevenue.average_fee
                )

        },


        refundFees: {

            total:
                Number(
                    refundFees.refund_fee_revenue
                ),

            transactionCount:
                Number(
                    refundFees.refund_fee_transactions
                ),

            averageFee:
                Number(
                    refundFees.average_refund_fee
                )

        },


        sourceRevenue:
            sourceRevenue.map(
                row => ({

                    source:
                        row.source,

                    revenue:
                        Number(
                            row.revenue
                        ),

                    transactionCount:
                        Number(
                            row.transaction_count
                        )

                })
            ),


        merchantRevenue:
            merchantRevenue.map(
                row => ({

                    merchantId:
                        row.merchant_id,

                    totalRevenue:
                        Number(
                            row.total_revenue
                        ),

                    transactionCount:
                        Number(
                            row.transaction_count
                        ),

                    lastTransactionAt:
                        row.last_transaction_at

                })
            ),


        dailyRevenue:
            dailyRevenue.map(
                row => ({

                    date:
                        row.date,

                    revenue:
                        Number(
                            row.revenue
                        ),

                    transactionCount:
                        Number(
                            row.transaction_count
                        )

                })
            ),


        recentTransactions:
            recentTransactions.map(
                row => ({

                    transactionId:
                        row.admin_wallet_transaction_id,

                    adminWalletId:
                        row.admin_wallet_id,

                    merchantId:
                        row.merchant_id,

                    refundId:
                        row.refund_id,

                    transactionType:
                        row.transaction_type,

                    source:
                        row.source,

                    amount:
                        Number(row.amount),

                    feeAmount:
                        Number(row.fee_amount),

                    totalAmount:
                        Number(row.total_amount),

                    balanceBefore:
                        Number(
                            row.balance_before
                        ),

                    balanceAfter:
                        Number(
                            row.balance_after
                        ),

                    referenceType:
                        row.reference_type,

                    referenceId:
                        row.reference_id,

                    status:
                        row.status,

                    description:
                        row.description,

                    createdAt:
                        row.created_at

                })
            ),


        reconciliation: {

            walletBalance:
                currentBalance,

            calculatedBalance,

            difference,

            status:
                Math.abs(
                    difference
                ) < 0.01
                    ? "MATCHED"
                    : "MISMATCH"

        }

    };

};


module.exports =
    getAdminWalletAnalyticsService;