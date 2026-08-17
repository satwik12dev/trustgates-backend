// ==========================================================
// Refund Request Queries
// ==========================================================

const REFUND_REQUEST_QUERIES = {

    // ======================================================
    // Create Refund Request
    // ======================================================

    CREATE_REFUND_REQUEST: `
    INSERT INTO refund_requests (

    request_reference,
    merchant_id,
    transaction_id,
    transaction_reference,
    requested_amount,
    approved_amount,
    currency,
    refund_type,
    reason,
    source,
    requested_by,
    metadata

)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `,

    // ======================================================
    // Get Refund Request By ID
    // ======================================================

    GET_REFUND_REQUEST_BY_ID: `

        SELECT *

        FROM refund_requests

        WHERE request_id = ?

    `,

    // ======================================================
    // Get Refund Request By Reference
    // ======================================================

    GET_REFUND_REQUEST_BY_REFERENCE: `

        SELECT *

        FROM refund_requests

        WHERE request_id = ?

    `,

    // ======================================================
    // Get Refund Request By Transaction
    // ======================================================

    GET_REQUEST_BY_TRANSACTION: `

        SELECT *

        FROM refund_requests

        WHERE transaction_id = ?

        ORDER BY request_id DESC

    `,

    // ======================================================
    // Check Existing Pending Request
    // ======================================================

    CHECK_EXISTING_PENDING_REQUEST: `

        SELECT

            request_id,

            status

        FROM refund_requests

        WHERE transaction_id = ?

        AND status IN (

            'REQUESTED',

            'APPROVED',

            'PROCESSING'

        )

        LIMIT 1

    `,

    // ======================================================
    // Lock Refund Request
    // ======================================================

    LOCK_REFUND_REQUEST: `

        SELECT *

        FROM refund_requests

        WHERE request_id = ?

        FOR UPDATE

    `,

    // ======================================================
    // List Merchant Refund Requests
    // ======================================================

    LIST_REFUND_REQUESTS: `

        SELECT *

        FROM refund_requests

        WHERE merchant_id = ?

        ORDER BY created_at DESC

        LIMIT ?

        OFFSET ?

    `,

    // ======================================================
    // Count Merchant Refund Requests
    // ======================================================

    COUNT_REFUND_REQUESTS: `

        SELECT

            COUNT(*) AS total

        FROM refund_requests

        WHERE merchant_id = ?

    `,

    // ======================================================
    // APPROVE Refund Request
    // ======================================================

    APPROVE_REFUND_REQUEST: `

    UPDATE refund_requests

    SET

        status = 'APPROVED',

        approved_amount = ?,

        fee_amount = ?,

        total_debit_amount = ?,

        approved_by = ?,

        approved_at = NOW(),

        remarks = ?,

        updated_at = NOW()

    WHERE request_id = ?

`,

    // ======================================================
    // Reject Refund Request
    // ======================================================

    REJECT_REFUND_REQUEST: `

        UPDATE refund_requests

        SET

            status = 'REJECTED',

            rejected_by = ?,

            rejected_at = NOW(),

            remarks = ?,

            updated_at = NOW()

        WHERE request_id = ?

    `,

    // ======================================================
    // Cancel Refund Request
    // ======================================================

    CANCEL_REFUND_REQUEST: `

        UPDATE refund_requests

        SET

            status = 'CANCELLED',

            cancelled_by = ?,

            cancelled_at = NOW(),

            remarks = ?,

            updated_at = NOW()

        WHERE request_id = ?

    `,

    // ======================================================
    // Update Request Status
    // ======================================================

    UPDATE_REQUEST_STATUS: `

        UPDATE refund_requests
SET
    status = ?,
    processed_amount = ?,
    updated_at = NOW()
WHERE request_id = ?

    `,

    // ======================================================
    // Get Approved Requests
    // ======================================================

    GET_APPROVED_REQUESTS: `

        SELECT *

        FROM refund_requests

        WHERE status = 'APPROVED'

        ORDER BY approved_at ASC

    `,
    // ======================================================
    // Get Transaction
    // ======================================================

    GET_TRANSACTION: `

    SELECT

        transaction_id,

        transaction_ref,

        amount,

        currency,

        status,

        merchant_id

    FROM transactions

    WHERE

        merchant_id = ?

        AND transaction_ref = ?

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

    WHERE

        transaction_id = ?

        AND refund_status = 'PROCESSED'

`,

// ======================================================
// Create Failed Refund Record
// ======================================================

CREATE_FAILED_REFUND: `

INSERT INTO transaction_refunds (

    refund_reference,
    request_id,
    merchant_id,
    transaction_id,
    amount,
    currency,
    refund_type,
    refund_status,
    refund_reason,
    failure_code,
    failure_message,
    processed_at

)

VALUES (

    ?, ?, ?, ?, ?, ?, ?, 'FAILED', ?, ?, ?, NOW()

)
`,

};

// ==========================================================
// Export
// ==========================================================

module.exports = REFUND_REQUEST_QUERIES;