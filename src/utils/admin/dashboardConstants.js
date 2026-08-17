// src/utils/admin/dashboardConstants.js

/**
 * Transaction Status
 */
const TRANSACTION_STATUS = Object.freeze({
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
    PENDING: "PENDING",
    CHARGEBACK: "CHARGEBACK",
    REFUNDED: "REFUNDED"
});


/**
 * Payment Methods
 */
const PAYMENT_METHOD = Object.freeze({
    UPI: "UPI",
    CARD: "CARD",
    NETBANKING: "NETBANKING",
    WALLET: "WALLET",
    EMI: "EMI",
    PAYLATER: "PAYLATER"
});


/**
 * Payment Type
 */
const PAYMENT_TYPE = Object.freeze({
    PAYIN: "PAYIN",
    PAYOUT: "PAYOUT"
});


/**
 * Refund Status
 */
const REFUND_STATUS = Object.freeze({
    PENDING: "PENDING",
    PROCESSED: "PROCESSED",
    FAILED: "FAILED"
});


/**
 * Settlement Status
 */
const SETTLEMENT_STATUS = Object.freeze({
    PENDING: "PENDING",
    PROCESSING: "PROCESSING",
    SETTLED: "SETTLED"
});


/**
 * Wallet Status
 */
const WALLET_STATUS = Object.freeze({
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
    PENDING: "PENDING"
});


/**
 * Net Banking Status
 */
const NETBANKING_STATUS = Object.freeze({
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
    PENDING: "PENDING"
});


/**
 * Card Network
 */
const CARD_NETWORK = Object.freeze({
    VISA: "Visa",
    MASTERCARD: "Mastercard",
    RUPAY: "RuPay",
    AMERICAN_EXPRESS: "American Express",
    DINERS_CLUB: "Diners Club"
});


/**
 * Card Type
 */
const CARD_TYPE = Object.freeze({
    CREDIT: "Credit",
    DEBIT: "Debit"
});


/**
 * UPI Apps
 */
const UPI_APP = Object.freeze({
    GOOGLE_PAY: "Google Pay",
    PHONEPE: "PhonePe",
    PAYTM: "Paytm",
    BHIM: "BHIM",
    AMAZON_PAY: "Amazon Pay",
    CRED: "CRED",
    OTHER: "Other"
});


/**
 * Pay Later Providers
 */
const PAYLATER_PROVIDER = Object.freeze({
    SIMPL: "Simpl",
    LAZYPAY: "LazyPay",
    ICICI_PAYLATER: "ICICI PayLater",
    AMAZON_PAY_LATER: "Amazon Pay Later",
    FLIPKART_PAY_LATER: "Flipkart Pay Later"
});


/**
 * Pagination
 */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;


/**
 * Sorting
 */
const DEFAULT_SORT_BY = "created_at";
const DEFAULT_SORT_ORDER = "DESC";


/**
 * Dashboard Defaults
 */
const DEFAULT_DASHBOARD_FILTERS = Object.freeze({
    paymentType: null,
    merchantId: null,
    startDate: null,
    endDate: null
});


module.exports = {

    TRANSACTION_STATUS,

    PAYMENT_METHOD,

    PAYMENT_TYPE,

    REFUND_STATUS,

    SETTLEMENT_STATUS,

    WALLET_STATUS,

    NETBANKING_STATUS,

    CARD_NETWORK,

    CARD_TYPE,

    UPI_APP,

    PAYLATER_PROVIDER,

    DEFAULT_PAGE,

    DEFAULT_LIMIT,

    MAX_LIMIT,

    DEFAULT_SORT_BY,

    DEFAULT_SORT_ORDER,

    DEFAULT_DASHBOARD_FILTERS

};