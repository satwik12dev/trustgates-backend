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


// ==========================================================
// Admin Wallet Analytics Service
// ==========================================================

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
    // Validate Recent Limit
    // ======================================================

    const parsedRecentLimit =
        Number(recentLimit);

    if (
        !Number.isInteger(parsedRecentLimit) ||
        parsedRecentLimit < 1 ||
        parsedRecentLimit > 100
    ) {
        throw new Error(
            "recentLimit must be between 1 and 100."
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


    const queryDateFrom =
        `${finalDateFrom} 00:00:00`;


    const queryDateTo =
        `${endDate
            .toISOString()
            .slice(0, 10)
        } 00:00:00`;


    // ======================================================
    // Fetch Admin Wallet
    // ======================================================

    const wallet =
        await getAdminWallet(
            connection
        );


    if (!wallet) {

        throw new Error(
            "Active admin wallet not found."
        );

    }


    // ======================================================
    // Admin Wallet ID
    // ======================================================

    const adminWalletId =
        Number(
            wallet.admin_wallet_id
        );


    // ======================================================
    // Fetch Analytics
    // ======================================================

    const [
        summary,
        feeRevenue,
        sourceRevenue,
        merchantRevenue,
        refundFees,
        dailyRevenue,
        recentTransactions,
        reconciliation
    ] = await Promise.all([

        // ----------------------------------------------
        // Summary
        // ----------------------------------------------

        getAdminWalletSummary(
            connection,
            queryDateFrom,
            queryDateTo
        ),


        // ----------------------------------------------
        // Fee Revenue
        // ----------------------------------------------

        getFeeRevenue(
            connection,
            queryDateFrom,
            queryDateTo
        ),


        // ----------------------------------------------
        // Source Revenue
        // ----------------------------------------------

        getSourceRevenue(
            connection,
            queryDateFrom,
            queryDateTo
        ),


        // ----------------------------------------------
        // Merchant Revenue
        // ----------------------------------------------

        getMerchantRevenue(
            connection,
            queryDateFrom,
            queryDateTo
        ),


        // ----------------------------------------------
        // Refund Fees
        // ----------------------------------------------

        getRefundFeeAnalytics(
            connection,
            queryDateFrom,
            queryDateTo
        ),


        // ----------------------------------------------
        // Daily Revenue
        // ----------------------------------------------

        getDailyRevenue(
            connection,
            queryDateFrom,
            queryDateTo
        ),


        // ----------------------------------------------
        // Recent Transactions
        // ----------------------------------------------

        getRecentTransactions(
            connection,
            queryDateFrom,
            queryDateTo,
            parsedRecentLimit
        ),


        // ----------------------------------------------
        // Reconciliation
        // ----------------------------------------------

        getReconciliation(
            connection,
            adminWalletId
        )

    ]);


    // ======================================================
    // Current Wallet Balance
    // ======================================================

    const currentBalance =
        Number(
            wallet.balance
        );


    // ======================================================
    // Reconciliation
    // ======================================================

    const calculatedBalance =
        Number(
            reconciliation.calculated_balance || 0
        );


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


        // ==================================================
        // Wallet
        // ==================================================

        wallet: {

            adminWalletId:
                adminWalletId,

            balance:
                currentBalance,

            currency:
                wallet.currency,

            status:
                wallet.status

        },


        // ==================================================
        // Summary
        // ==================================================

        summary: {

            totalCredits:
                Number(
                    summary.total_credits || 0
                ),

            totalDebits:
                Number(
                    summary.total_debits || 0
                ),

            netMovement:
                Number(
                    summary.total_credits || 0
                ) -
                Number(
                    summary.total_debits || 0
                ),

            completedTransactions:
                Number(
                    summary.completed_transactions || 0
                ),

            pendingTransactions:
                Number(
                    summary.pending_transactions || 0
                ),

            failedTransactions:
                Number(
                    summary.failed_transactions || 0
                ),

            reversedTransactions:
                Number(
                    summary.reversed_transactions || 0
                )

        },


        // ==================================================
        // Revenue
        // ==================================================

        revenue: {

            total:
                Number(
                    feeRevenue.total_fee_revenue || 0
                ),

            transactionCount:
                Number(
                    feeRevenue.fee_transaction_count || 0
                ),

            averageFee:
                Number(
                    feeRevenue.average_fee || 0
                )

        },


        // ==================================================
        // Refund Fees
        // ==================================================

        refundFees: {

            total:
                Number(
                    refundFees.refund_fee_revenue || 0
                ),

            transactionCount:
                Number(
                    refundFees.refund_fee_transactions || 0
                ),

            averageFee:
                Number(
                    refundFees.average_refund_fee || 0
                )

        },


        // ==================================================
        // Source Revenue
        // ==================================================

        sourceRevenue:
            sourceRevenue.map(
                row => ({

                    source:
                        row.source,

                    revenue:
                        Number(
                            row.revenue || 0
                        ),

                    transactionCount:
                        Number(
                            row.transaction_count || 0
                        )

                })
            ),


        // ==================================================
        // Merchant Revenue
        // ==================================================

        merchantRevenue:
            merchantRevenue.map(
                row => ({

                    merchantId:
                        row.merchant_id,

                    totalRevenue:
                        Number(
                            row.total_revenue || 0
                        ),

                    transactionCount:
                        Number(
                            row.transaction_count || 0
                        ),

                    lastTransactionAt:
                        row.last_transaction_at

                })
            ),


        // ==================================================
        // Daily Revenue
        // ==================================================

        dailyRevenue:
            dailyRevenue.map(
                row => ({

                    date:
                        row.date,

                    revenue:
                        Number(
                            row.revenue || 0
                        ),

                    transactionCount:
                        Number(
                            row.transaction_count || 0
                        )

                })
            ),


        // ==================================================
        // Recent Transactions
        // ==================================================

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
                        Number(
                            row.amount || 0
                        ),

                    feeAmount:
                        Number(
                            row.fee_amount || 0
                        ),

                    totalAmount:
                        Number(
                            row.total_amount || 0
                        ),

                    balanceBefore:
                        Number(
                            row.balance_before || 0
                        ),

                    balanceAfter:
                        Number(
                            row.balance_after || 0
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


        // ==================================================
        // Reconciliation
        // ==================================================

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