const db = require("../../../config/pool");

const {
    PAYOUT_ANALYTICS_QUERY,
    PAYOUT_HISTORY_QUERY
} = require("../../../queries/merchant/payout/payout.query");


const getPayoutAnalytics = async ({
    merchantId,
    startDate,
    endDate
}) => {

    try {

        // ==================================================
        // ANALYTICS
        // ==================================================

        let analyticsQuery =
            PAYOUT_ANALYTICS_QUERY;

        const analyticsParams = [
            merchantId
        ];


        // ==================================================
        // HISTORY
        // ==================================================

        let historyQuery =
            PAYOUT_HISTORY_QUERY;

        const historyParams = [
            merchantId
        ];


        // ==================================================
        // DATE FILTER
        // ==================================================

        if (startDate && endDate) {

            const nextDay =
                new Date(`${endDate}T00:00:00`);

            nextDay.setDate(
                nextDay.getDate() + 1
            );

            const formattedEndDate =
                nextDay
                    .toISOString()
                    .slice(0, 19)
                    .replace("T", " ");

            const formattedStartDate =
                `${startDate} 00:00:00`;


            analyticsQuery += `
                AND created_at >= ?
                AND created_at < ?
            `;

            analyticsParams.push(
                formattedStartDate,
                formattedEndDate
            );


            historyQuery += `
                AND tr.created_at >= ?
                AND tr.created_at < ?
            `;

            historyParams.push(
                formattedStartDate,
                formattedEndDate
            );
        }


        // ==================================================
        // EXECUTE BOTH
        // ==================================================

        const [
            [analyticsRows],
            [historyRows]
        ] = await Promise.all([

            db.query(
                analyticsQuery,
                analyticsParams
            ),

            db.query(
                historyQuery,
                historyParams
            )

        ]);


        const analytics =
            analyticsRows[0];


        // ==================================================
        // FORMAT ANALYTICS
        // ==================================================

        const payoutAnalytics = {

            totalPayoutTransactions:
                Number(
                    analytics?.total_payout_transactions || 0
                ),

            totalPayoutAmount:
                Number(
                    analytics?.total_payout_amount || 0
                ),

            successfulTransactions:
                Number(
                    analytics?.successful_transactions || 0
                ),

            successfulPayoutAmount:
                Number(
                    analytics?.successful_payout_amount || 0
                ),

            failedTransactions:
                Number(
                    analytics?.failed_transactions || 0
                ),

            createdTransactions:
                Number(
                    analytics?.created_transactions || 0
                ),

            processingTransactions:
                Number(
                    analytics?.processing_transactions || 0
                ),

            processedTransactions:
                Number(
                    analytics?.processed_transactions || 0
                ),

            successPercentage:
                Number(
                    analytics?.success_percentage || 0
                ),

            averagePayoutAmount:
                Number(
                    analytics?.average_payout_amount || 0
                ),

            totalPayoutFee:
                Number(
                    analytics?.total_payout_fee || 0
                ),

            totalDebitAmount:
                Number(
                    analytics?.total_debit_amount || 0
                )
        };


        // ==================================================
        // FORMAT HISTORY
        // ==================================================

        const history =
            historyRows.map(row => ({

                refundId:
                    row.refund_id,

                refundReference:
                    row.refund_reference,

                requestId:
                    row.request_id,

                transactionId:
                    row.transaction_id,

                transactionReference:
                    row.gateway_payment_id,

                orderId:
                    row.order_id ||
                    row.gateway_order_id,

                gatewayRefundId:
                    row.gateway_refund_id,

                gatewayPaymentId:
                    row.gateway_payment_id,

                amount:
                    Number(row.amount || 0),

                feeAmount:
                    Number(row.fee_amount || 0),

                totalDebitAmount:
                    Number(
                        row.total_debit_amount || 0
                    ),

                currency:
                    row.currency,

                refundType:
                    row.refund_type,

                status:
                    row.refund_status,

                paymentMethod:
                    row.payment_method,

                paymentType:
                    row.payment_type,

                transactionAmount:
                    Number(
                        row.transaction_amount || 0
                    ),

                reason:
                    row.refund_reason,

                completionSource:
                    row.completion_source,

                failureCode:
                    row.failure_code,

                failureMessage:
                    row.failure_message,

                processedAt:
                    row.processed_at,

                createdAt:
                    row.created_at,

                updatedAt:
                    row.updated_at

            }));


        // ==================================================
        // FINAL RESPONSE
        // ==================================================

        return {

            payoutAnalytics,

            history

        };

    } catch (error) {

        console.error(
            "Payout Analytics Service Error:",
            error
        );

        throw error;
    }
};


module.exports = {
    getPayoutAnalytics
};