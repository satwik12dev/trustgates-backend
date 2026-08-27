const db = require("../../config/pool");

const getAdminWalletAnalyticsService =
    require(
        "../../services/adminWallet/adminWalletAnalytics.service"
    );

// ==========================================================
// Admin Wallet Analytics
// ==========================================================

const getAdminWalletAnalytics = async (
    req,
    res,
    next
) => {

    try {

        const {
            dateFrom,
            dateTo,
            recentLimit
        } = req.query;


        const analytics =
            await getAdminWalletAnalyticsService(

                db,

                {
                    dateFrom:
                        dateFrom || null,

                    dateTo:
                        dateTo || null,

                    recentLimit:
                        recentLimit
                            ? Number(recentLimit)
                            : 20
                }

            );


        return res.status(200).json({

            success: true,

            message:
                "Admin wallet analytics fetched successfully.",

            data:
                analytics

        });

    } catch (error) {

        next(error);

    }

};


module.exports = {
    getAdminWalletAnalytics
};