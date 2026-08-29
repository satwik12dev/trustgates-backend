// ==========================================================
// Transaction Webhook Queries
// Razorpay
// ==========================================================


// ==========================================================
// Payment Provider
// ==========================================================

const GET_PAYMENT_PROVIDER_BY_MERCHANT = `
    SELECT
        provider_id,
        merchant_id,
        provider,
        provider_name,
        key_id,
        key_secret,
        webhook_secret,
        status
    FROM merchant_payment_providers
    WHERE merchant_id = ?
      AND provider = ?
      AND status = 'ACTIVE'
    LIMIT 1
`;


// ==========================================================
// Find Existing Transaction By Order ID
// ==========================================================

const FIND_TRANSACTION_BY_ORDER_ID = `
    SELECT
        transaction_id,
        merchant_id,
        transaction_ref,
        order_id,
        gateway_order_id,
        gateway_payment_id,
        gateway_reference,
        gateway_response,
        customer_name,
        customer_email,
        customer_phone,
        amount,
        currency,
        payment_method,
        gateway_name,
        payment_type,
        status,
        completion_source,
        merchant_fee,
        gateway_fee,
        gateway_tax,
        net_amount,
        settlement_status,
        settled_at,
        failure_code,
        failure_message,
        attempt_count,
        expires_at,
        idempotency_key,
        client_ip,
        user_agent,
        remarks,
        created_at,
        completed_at,
        updated_at
    FROM transactions
    WHERE merchant_id = ?
      AND order_id = ?
    LIMIT 1
`;


// ==========================================================
// Find Existing Transaction By Gateway Payment ID
// ==========================================================

const FIND_TRANSACTION_BY_GATEWAY_PAYMENT_ID = `
    SELECT
        transaction_id,
        merchant_id,
        transaction_ref,
        order_id,
        gateway_order_id,
        gateway_payment_id,
        gateway_reference,
        gateway_response,
        customer_name,
        customer_email,
        customer_phone,
        amount,
        currency,
        payment_method,
        gateway_name,
        payment_type,
        status,
        completion_source,
        merchant_fee,
        gateway_fee,
        gateway_tax,
        net_amount,
        settlement_status,
        settled_at,
        failure_code,
        failure_message,
        attempt_count,
        expires_at,
        idempotency_key,
        client_ip,
        user_agent,
        remarks,
        created_at,
        completed_at,
        updated_at
    FROM transactions
    WHERE merchant_id = ?
      AND gateway_payment_id = ?
    LIMIT 1
`;


// ==========================================================
// Find By Gateway Order ID
// ==========================================================

const FIND_TRANSACTION_BY_GATEWAY_ORDER = `
    SELECT
        transaction_id,
        merchant_id,
        transaction_ref,
        order_id,
        gateway_order_id,
        gateway_payment_id,
        gateway_reference,
        gateway_response,
        customer_name,
        customer_email,
        customer_phone,
        amount,
        currency,
        payment_method,
        gateway_name,
        payment_type,
        status,
        completion_source,
        merchant_fee,
        gateway_fee,
        gateway_tax,
        net_amount,
        settlement_status,
        settled_at,
        failure_code,
        failure_message,
        attempt_count,
        expires_at,
        idempotency_key,
        client_ip,
        user_agent,
        remarks,
        created_at,
        completed_at,
        updated_at
    FROM transactions
    WHERE merchant_id = ?
      AND gateway_order_id = ?
    LIMIT 1
`;


// ==========================================================
// Find By Transaction Reference
// ==========================================================

const FIND_TRANSACTION_BY_REF = `
    SELECT
        transaction_id,
        merchant_id,
        transaction_ref,
        order_id,
        gateway_order_id,
        gateway_payment_id,
        gateway_reference,
        gateway_response,
        customer_name,
        customer_email,
        customer_phone,
        amount,
        currency,
        payment_method,
        gateway_name,
        payment_type,
        status,
        completion_source,
        merchant_fee,
        gateway_fee,
        gateway_tax,
        net_amount,
        settlement_status,
        settled_at,
        failure_code,
        failure_message,
        attempt_count,
        expires_at,
        idempotency_key,
        client_ip,
        user_agent,
        remarks,
        created_at,
        completed_at,
        updated_at
    FROM transactions
    WHERE transaction_ref = ?
    LIMIT 1
`;


// ==========================================================
// Create Main Transaction
// ==========================================================

const CREATE_TRANSACTION = `
    INSERT INTO transactions
    (
        merchant_id,
        transaction_ref,
        order_id,
        gateway_order_id,
        gateway_payment_id,
        gateway_reference,
        gateway_response,
        customer_name,
        customer_email,
        customer_phone,
        amount,
        currency,
        payment_method,
        gateway_name,
        payment_type,
        status,
        completion_source,
        merchant_fee,
        gateway_fee,
        gateway_tax,
        settlement_status,
        failure_code,
        failure_message,
        attempt_count,
        expires_at,
        idempotency_key,
        client_ip,
        user_agent,
        remarks
    )
    VALUES
    (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
    )
`;


// ==========================================================
// Update Main Transaction
// ==========================================================

const UPDATE_TRANSACTION = `
    UPDATE transactions
    SET
        gateway_payment_id = COALESCE(?, gateway_payment_id),
        gateway_reference = COALESCE(?, gateway_reference),
        gateway_response = COALESCE(?, gateway_response),
        payment_method = COALESCE(?, payment_method),
        status = ?,
        completion_source = ?,
        failure_code = ?,
        failure_message = ?,
        completed_at = ?,
        attempt_count = ?,
        settlement_status = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE transaction_id = ?
`;


// ==========================================================
// Update Transaction Status
// ==========================================================

const UPDATE_TRANSACTION_STATUS = `
    UPDATE transactions
    SET
        status = ?,
        completion_source = ?,
        failure_code = ?,
        failure_message = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE transaction_id = ?
`;


// ==========================================================
// Increment Attempt Count
// ==========================================================

const INCREMENT_ATTEMPT_COUNT = `
    UPDATE transactions
    SET
        attempt_count = attempt_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE transaction_id = ?
`;


// ==========================================================
// UPI
// ==========================================================

const FIND_UPI_TRANSACTION = `
    SELECT
        transaction_upi_id,
        transaction_id
    FROM transaction_upi
    WHERE transaction_id = ?
    LIMIT 1
`;


const CREATE_TRANSACTION_UPI = `
    INSERT INTO transaction_upi
    (
        transaction_id,
        vpa,
        payer_name,
        payer_account_type,
        rrn,
        npci_transaction_id,
        bank_reference,
        gateway_response_code,
        gateway_response_message
    )
    VALUES
    (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
    )
`;


const UPDATE_TRANSACTION_UPI = `
    UPDATE transaction_upi
    SET
        vpa = COALESCE(?, vpa),
        payer_name = COALESCE(?, payer_name),
        payer_account_type = COALESCE(?, payer_account_type),
        rrn = COALESCE(?, rrn),
        npci_transaction_id = COALESCE(?, npci_transaction_id),
        bank_reference = COALESCE(?, bank_reference),
        gateway_response_code = COALESCE(?, gateway_response_code),
        gateway_response_message = COALESCE(?, gateway_response_message),
        updated_at = CURRENT_TIMESTAMP
    WHERE transaction_id = ?
`;


// ==========================================================
// CARD
// ==========================================================

const FIND_CARD_TRANSACTION = `
    SELECT
        transaction_card_id,
        transaction_id
    FROM transaction_card
    WHERE transaction_id = ?
    LIMIT 1
`;


const CREATE_TRANSACTION_CARD = `
    INSERT INTO transaction_card
    (
        transaction_id,
        card_network,
        card_type,
        last_four,
        issuer,
        bank_name,
        auth_code,
        gateway_reference,
        country
    )
    VALUES
    (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
    )
`;


const UPDATE_TRANSACTION_CARD = `
    UPDATE transaction_card
    SET
        card_network = COALESCE(?, card_network),
        card_type = COALESCE(?, card_type),
        last_four = COALESCE(?, last_four),
        issuer = COALESCE(?, issuer),
        bank_name = COALESCE(?, bank_name),
        auth_code = COALESCE(?, auth_code),
        gateway_reference = COALESCE(?, gateway_reference),
        country = COALESCE(?, country),
        updated_at = CURRENT_TIMESTAMP
    WHERE transaction_id = ?
`;


// ==========================================================
// NETBANKING
// ==========================================================

const FIND_NETBANKING_TRANSACTION = `
    SELECT
        transaction_netbanking_id,
        transaction_id
    FROM transaction_netbanking
    WHERE transaction_id = ?
    LIMIT 1
`;


const CREATE_TRANSACTION_NETBANKING = `
    INSERT INTO transaction_netbanking
    (
        transaction_id,
        bank_code,
        bank_name,
        bank_transaction_id,
        gateway_reference
    )
    VALUES
    (
        ?,
        ?,
        ?,
        ?,
        ?
    )
`;


const UPDATE_TRANSACTION_NETBANKING = `
    UPDATE transaction_netbanking
    SET
        bank_code = COALESCE(?, bank_code),
        bank_name = COALESCE(?, bank_name),
        bank_transaction_id = COALESCE(?, bank_transaction_id),
        gateway_reference = COALESCE(?, gateway_reference),
        updated_at = CURRENT_TIMESTAMP
    WHERE transaction_id = ?
`;


// ==========================================================
// WALLET
// ==========================================================

const FIND_WALLET_TRANSACTION = `
    SELECT
        transaction_wallet_id,
        transaction_id
    FROM transaction_wallet
    WHERE transaction_id = ?
    LIMIT 1
`;


const CREATE_TRANSACTION_WALLET = `
    INSERT INTO transaction_wallet
    (
        transaction_id,
        wallet_name,
        wallet_transaction_id,
        gateway_reference
    )
    VALUES
    (
        ?,
        ?,
        ?,
        ?
    )
`;


const UPDATE_TRANSACTION_WALLET = `
    UPDATE transaction_wallet
    SET
        wallet_name = COALESCE(?, wallet_name),
        wallet_transaction_id = COALESCE(?, wallet_transaction_id),
        gateway_reference = COALESCE(?, gateway_reference),
        updated_at = CURRENT_TIMESTAMP
    WHERE transaction_id = ?
`;


// ==========================================================
// EMI
// ==========================================================

const FIND_EMI_TRANSACTION = `
    SELECT
        transaction_emi_id,
        transaction_id
    FROM transaction_emi
    WHERE transaction_id = ?
    LIMIT 1
`;


const CREATE_TRANSACTION_EMI = `
    INSERT INTO transaction_emi
    (
        transaction_id,
        issuer,
        tenure,
        interest_rate,
        gateway_reference
    )
    VALUES
    (
        ?,
        ?,
        ?,
        ?,
        ?
    )
`;


const UPDATE_TRANSACTION_EMI = `
    UPDATE transaction_emi
    SET
        issuer = COALESCE(?, issuer),
        tenure = COALESCE(?, tenure),
        interest_rate = COALESCE(?, interest_rate),
        gateway_reference = COALESCE(?, gateway_reference),
        updated_at = CURRENT_TIMESTAMP
    WHERE transaction_id = ?
`;


// ==========================================================
// PAYLATER
// ==========================================================

const FIND_PAYLATER_TRANSACTION = `
    SELECT
        transaction_paylater_id,
        transaction_id
    FROM transaction_paylater
    WHERE transaction_id = ?
    LIMIT 1
`;


const CREATE_TRANSACTION_PAYLATER = `
    INSERT INTO transaction_paylater
    (
        transaction_id,
        provider_name,
        loan_reference,
        due_date,
        gateway_reference
    )
    VALUES
    (
        ?,
        ?,
        ?,
        ?,
        ?
    )
`;


const UPDATE_TRANSACTION_PAYLATER = `
    UPDATE transaction_paylater
    SET
        provider_name = COALESCE(?, provider_name),
        loan_reference = COALESCE(?, loan_reference),
        due_date = COALESCE(?, due_date),
        gateway_reference = COALESCE(?, gateway_reference),
        updated_at = CURRENT_TIMESTAMP
    WHERE transaction_id = ?
`;


// ==========================================================
// Export
// ==========================================================

module.exports = {

    // Provider
    GET_PAYMENT_PROVIDER_BY_MERCHANT,

    // Main transaction
    FIND_TRANSACTION_BY_ORDER_ID,
    FIND_TRANSACTION_BY_GATEWAY_PAYMENT_ID,
    FIND_TRANSACTION_BY_GATEWAY_ORDER,
    FIND_TRANSACTION_BY_REF,

    CREATE_TRANSACTION,
    UPDATE_TRANSACTION,
    UPDATE_TRANSACTION_STATUS,
    INCREMENT_ATTEMPT_COUNT,

    // UPI
    FIND_UPI_TRANSACTION,
    CREATE_TRANSACTION_UPI,
    UPDATE_TRANSACTION_UPI,

    // Card
    FIND_CARD_TRANSACTION,
    CREATE_TRANSACTION_CARD,
    UPDATE_TRANSACTION_CARD,

    // Netbanking
    FIND_NETBANKING_TRANSACTION,
    CREATE_TRANSACTION_NETBANKING,
    UPDATE_TRANSACTION_NETBANKING,

    // Wallet
    FIND_WALLET_TRANSACTION,
    CREATE_TRANSACTION_WALLET,
    UPDATE_TRANSACTION_WALLET,

    // EMI
    FIND_EMI_TRANSACTION,
    CREATE_TRANSACTION_EMI,
    UPDATE_TRANSACTION_EMI,

    // Paylater
    FIND_PAYLATER_TRANSACTION,
    CREATE_TRANSACTION_PAYLATER,
    UPDATE_TRANSACTION_PAYLATER
};