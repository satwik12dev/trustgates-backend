// ==========================================================
// Refund Processor Queries
// ==========================================================

const REFUND_PROCESSOR_QUERIES = {

    // ======================================================
    // Create Gateway Refund
    // ======================================================

    CREATE_GATEWAY_REFUND: `

        INSERT INTO transaction_refunds (

            request_id,

            refund_reference,

            merchant_id,

            transaction_id,

            gateway_refund_id,

            gateway_payment_id,

            gateway_order_id,

            amount,

            fee_amount,

            total_debit_amount,

            currency,

            refund_type,

            refund_status,

            refund_reason,

            gateway_response,

            completion_source,

            processed_at

        )

        VALUES (

            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?

        )

    `,


    // ======================================================
    // Get Gateway Refund By ID
    // ======================================================

    GET_GATEWAY_REFUND: `

        SELECT *

        FROM transaction_refunds

        WHERE refund_id = ?

    `,


    // ======================================================
    // Get Gateway Refund By Request
    // ======================================================

    GET_GATEWAY_REFUND_BY_REQUEST: `

        SELECT *

        FROM transaction_refunds

        WHERE request_id = ?

    `,


    // ======================================================
    // Get Gateway Refund By Gateway Refund ID
    // ======================================================

    GET_GATEWAY_REFUND_BY_GATEWAY_ID: `

        SELECT *

        FROM transaction_refunds

        WHERE gateway_refund_id = ?

    `,


    // ======================================================
    // Update Refund Processing
    // ======================================================

    UPDATE_GATEWAY_REFUND_PROCESSING: `

        UPDATE transaction_refunds

        SET

            refund_status = 'PROCESSING',

            gateway_response = ?,

            updated_at = NOW()

        WHERE refund_id = ?

          AND refund_status = 'PROCESSING'

    `,


    // ======================================================
    // Update Refund Success
    // ======================================================

    UPDATE_GATEWAY_REFUND_SUCCESS: `

        UPDATE transaction_refunds

        SET

            refund_status = 'PROCESSED',

            gateway_response = ?,

            completion_source = ?,

            processed_at = NOW(),

            updated_at = NOW()

        WHERE refund_id = ?

          AND refund_status = 'PROCESSING'

    `,


    // ======================================================
    // Update Refund Failed
    // ======================================================

    UPDATE_GATEWAY_REFUND_FAILED: `

        UPDATE transaction_refunds

        SET

            refund_status = 'FAILED',

            gateway_response = ?,

            completion_source = ?,

            failure_code = ?,

            failure_message = ?,

            updated_at = NOW()

        WHERE refund_id = ?

          AND refund_status = 'PROCESSING'

    `,


    // ======================================================
    // Update Transaction Refund Status
    // ======================================================

    UPDATE_TRANSACTION_STATUS: `

        UPDATE transactions

        SET

            status = ?,

            updated_at = NOW()

        WHERE transaction_id = ?

    `,


    // ======================================================
    // Lock Transaction
    // ======================================================

    LOCK_TRANSACTION: `

        SELECT *

        FROM transactions

        WHERE transaction_id = ?

        FOR UPDATE

    `,


    // ======================================================
    // Get Total Refunded Amount
    // ======================================================

    GET_TOTAL_REFUNDED_AMOUNT: `

        SELECT

            COALESCE(
                SUM(amount),
                0
            ) AS refunded_amount

        FROM transaction_refunds

        WHERE transaction_id = ?

          AND refund_status = 'PROCESSED'

    `,


    // ======================================================
    // Get Pending Approved Requests
    // ======================================================

    GET_REQUESTS_FOR_PROCESSOR: `

        SELECT *

        FROM refund_requests

        WHERE status = 'APPROVED'

        ORDER BY approved_at ASC

        LIMIT ?

    `,


    // ======================================================
    // Lock Gateway Refund
    // ======================================================

    LOCK_GATEWAY_REFUND: `

        SELECT *

        FROM transaction_refunds

        WHERE refund_id = ?

        FOR UPDATE

    `,


    // ======================================================
    // Get Transaction By ID
    // ======================================================

    GET_TRANSACTION_BY_ID: `

        SELECT *

        FROM transactions

        WHERE transaction_id = ?

    `,


    // ======================================================
    // Update Transaction Status
    // ======================================================

    UPDATE_TRANSACTION_STATUS: `

        UPDATE transactions

        SET

            status = ?,

            updated_at = NOW()

        WHERE transaction_id = ?

    `,


    // ======================================================
    // Update Request Completed
    // ======================================================

    UPDATE_REQUEST_COMPLETED: `

        UPDATE refund_requests

        SET

            status = 'COMPLETED',

            processed_amount = ?,

            updated_at = CURRENT_TIMESTAMP

        WHERE request_id = ?

    `,


    // ======================================================
    // Update Request Failed
    // ======================================================

    UPDATE_REQUEST_FAILED: `

        UPDATE refund_requests

        SET

            status = 'FAILED',

            remarks = ?,

            updated_at = NOW()

        WHERE request_id = ?

    `,


    // ======================================================
    // Get Processing Refunds
    // ======================================================

    GET_PROCESSING_REFUNDS: `

        SELECT

            refund_id,
            refund_reference,
            request_id,
            merchant_id,
            transaction_id,

            gateway_refund_id,
            gateway_payment_id,
            gateway_order_id,

            amount,
            fee_amount,
            total_debit_amount,

            currency,
            refund_type,
            refund_status,

            refund_reason,
            gateway_response,

            completion_source,
            failure_code,
            failure_message,

            processed_at,
            created_at,
            updated_at

        FROM transaction_refunds

        WHERE refund_status = 'PROCESSING'

          AND gateway_refund_id IS NOT NULL

          AND updated_at <=
              NOW() - INTERVAL 5 MINUTE

        ORDER BY updated_at ASC

        LIMIT 100

    `,


    // ======================================================
    // Create Rejected Refund
    // ======================================================

    CREATE_REJECTED_REFUND: `

        INSERT INTO transaction_refunds (

            request_id,

            refund_reference,

            merchant_id,

            transaction_id,

            amount,

            fee_amount,

            total_debit_amount,

            currency,

            refund_type,

            refund_status,

            refund_reason,

            failure_code,

            failure_message,

            processed_at

        )

        VALUES (

            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, 'FAILED',
            ?, ?, ?, NOW()

        )

    `,


    // ======================================================
    // Create Cancelled Refund
    // ======================================================

    CREATE_CANCLE_REFUND: `

        INSERT INTO transaction_refunds (

            request_id,

            refund_reference,

            merchant_id,

            transaction_id,

            amount,

            fee_amount,

            total_debit_amount,

            currency,

            refund_type,

            refund_status,

            refund_reason,

            failure_code,

            failure_message,

            processed_at

        )

        VALUES (

            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, 'CANCELLED',
            ?, ?, ?, NOW()

        )

    `

};


// ==========================================================
// Export
// ==========================================================

module.exports =
    REFUND_PROCESSOR_QUERIES;