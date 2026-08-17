const db = require("../../../config/pool");

const {
    PAYIN_ANALYTICS_QUERY
} = require("../../../queries/merchant/payin/payin.query");

const getPayinAnalytics = async ({
    merchantId,
    startDate,
    endDate
}) => {

    try {

        // ==================================================
        // Base Query
        // ==================================================

        let query = PAYIN_ANALYTICS_QUERY;

        const params = [merchantId];


        // ==================================================
        // Date Filter
        // ==================================================

        if (startDate && endDate) {

            const nextDay = new Date(
                `${endDate}T00:00:00`
            );

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


            query += `
                AND created_at >= ?
                AND created_at < ?
            `;

            params.push(
                formattedStartDate,
                formattedEndDate
            );
        }


        // ==================================================
        // Execute Query
        // ==================================================

        const [rows] = await db.query(
            query,
            params
        );


        const analytics =
            rows[0] || {};


        // ==================================================
        // Return Analytics
        // ==================================================

        return {

            // ----------------------------------------------
            // Total Payin
            // ----------------------------------------------

            totalPayinTransactions:
                Number(
                    analytics.total_payin_transactions || 0
                ),

            totalPayinAmount:
                Number(
                    analytics.total_payin_amount || 0
                ),


            // ----------------------------------------------
            // SUCCESS
            // ----------------------------------------------

            successfulTransactions:
                Number(
                    analytics.successful_transactions || 0
                ),

            successfulPayinAmount:
                Number(
                    analytics.successful_payin_amount || 0
                ),


            // ----------------------------------------------
            // FAILED
            // ----------------------------------------------

            failedTransactions:
                Number(
                    analytics.failed_transactions || 0
                ),


            // ----------------------------------------------
            // CREATED
            // ----------------------------------------------

            createdTransactions:
                Number(
                    analytics.created_transactions || 0
                ),


            // ----------------------------------------------
            // PENDING
            // ----------------------------------------------

            pendingTransactions:
                Number(
                    analytics.pending_transactions || 0
                ),


            // ----------------------------------------------
            // AUTHORIZED
            // ----------------------------------------------

            authorizedTransactions:
                Number(
                    analytics.authorized_transactions || 0
                ),


            // ----------------------------------------------
            // CANCELLED
            // ----------------------------------------------

            cancelledTransactions:
                Number(
                    analytics.cancelled_transactions || 0
                ),


            // ----------------------------------------------
            // REFUNDED
            // ----------------------------------------------

            refundedTransactions:
                Number(
                    analytics.refunded_transactions || 0
                ),


            // ----------------------------------------------
            // PARTIALLY REFUNDED
            // ----------------------------------------------

            partiallyRefundedTransactions:
                Number(
                    analytics.partially_refunded_transactions || 0
                ),


            // ----------------------------------------------
            // CHARGEBACK
            // ----------------------------------------------

            chargebackTransactions:
                Number(
                    analytics.chargeback_transactions || 0
                ),


            // ----------------------------------------------
            // SUCCESS RATE
            // ----------------------------------------------

            successPercentage:
                Number(
                    analytics.success_percentage || 0
                ),


            // ----------------------------------------------
            // AVERAGE
            // ----------------------------------------------

            averagePayinAmount:
                Number(
                    analytics.average_payin_amount || 0
                ),


            // ----------------------------------------------
            // FEES
            // ----------------------------------------------

            totalMerchantFee:
                Number(
                    analytics.total_merchant_fee || 0
                ),

            totalGatewayFee:
                Number(
                    analytics.total_gateway_fee || 0
                ),

            totalGatewayTax:
                Number(
                    analytics.total_gateway_tax || 0
                ),


            // ----------------------------------------------
            // NET AMOUNT
            // ----------------------------------------------

            totalNetAmount:
                Number(
                    analytics.total_net_amount || 0
                )

        };

    } catch (error) {

        console.error(
            "Payin Analytics Service Error:",
            error
        );

        throw error;
    }
};


module.exports = {
    getPayinAnalytics
};