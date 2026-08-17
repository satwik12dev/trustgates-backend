const redis = require("../../config/redis");


// ==========================================================
// Central Security Lock
// ==========================================================

const SECURITY_LOCK_TTL = 12 * 60 * 60; // 12 hours


// ==========================================================
// Key Helpers
// ==========================================================

const getLockKey = (merchantId) => {
    return `security:lock:${merchantId}`;
};


const getEmailOtpAttemptsKey = (merchantId) => {
    return `security:attempts:email-otp:${merchantId}`;
};


// ==========================================================
// Check Security Lock
// ==========================================================

const isMerchantSecurityLocked = async (
    merchantId
) => {

    if (!merchantId) {
        return false;
    }

    const lockKey =
        getLockKey(merchantId);

    const lock =
        await redis.get(lockKey);

    return Boolean(lock);
};


// ==========================================================
// Get Security Lock Details
// ==========================================================

const getMerchantSecurityLock = async (
    merchantId
) => {

    if (!merchantId) {
        return null;
    }

    const lockKey =
        getLockKey(merchantId);

    const lock =
        await redis.get(lockKey);

    if (!lock) {
        return null;
    }

    let data;

    try {
        data = JSON.parse(lock);
    } catch {
        data = {
            reason: "SECURITY_LOCK"
        };
    }

    const ttl =
        await redis.ttl(lockKey);

    return {
        ...data,
        retryAfter:
            ttl > 0
                ? ttl
                : SECURITY_LOCK_TTL
    };
};


// ==========================================================
// Create Security Lock
// ==========================================================

const lockMerchant = async ({
    merchantId,
    reason
}) => {

    if (!merchantId) {
        throw new Error(
            "Merchant ID is required."
        );
    }

    const lockKey =
        getLockKey(merchantId);

    const lockData = {

        reason:
            reason || "SECURITY_LOCK",

        merchantId:
            Number(merchantId),

        lockedAt:
            new Date().toISOString()

    };

    await redis.set(

        lockKey,

        JSON.stringify(lockData),

        {
            EX: SECURITY_LOCK_TTL
        }

    );

    return {

        locked: true,

        retryAfter:
            SECURITY_LOCK_TTL

    };
};


// ==========================================================
// Unlock Merchant
// ==========================================================

const unlockMerchant = async (
    merchantId
) => {

    if (!merchantId) {
        return;
    }

    await redis.del(
        getLockKey(merchantId)
    );

};


// ==========================================================
// Email OTP Failed Attempt
// ==========================================================
//
// 5 wrong OTP attempts
//       ↓
// 12 hour central security lock
//
// ==========================================================

const recordEmailOtpFailure = async (
    merchantId
) => {

    if (!merchantId) {
        throw new Error(
            "Merchant ID is required."
        );
    }

    const attemptsKey =
        getEmailOtpAttemptsKey(
            merchantId
        );


    // ------------------------------------------------------
    // Already locked?
    // ------------------------------------------------------

    if (
        await isMerchantSecurityLocked(
            merchantId
        )
    ) {

        const lock =
            await getMerchantSecurityLock(
                merchantId
            );

        return {

            locked: true,

            attempts: 5,

            retryAfter:
                lock?.retryAfter ||
                SECURITY_LOCK_TTL

        };

    }


    // ------------------------------------------------------
    // Increment attempts
    // ------------------------------------------------------

    const attempts =
        await redis.incr(
            attemptsKey
        );


    // Keep attempt counter for 12 hours
    if (
        attempts === 1
    ) {

        await redis.expire(
            attemptsKey,
            SECURITY_LOCK_TTL
        );

    }


    // ------------------------------------------------------
    // 5th wrong OTP
    // ------------------------------------------------------

    if (
        attempts >= 5
    ) {

        const lock =
            await lockMerchant({

                merchantId,

                reason:
                    "EMAIL_VERIFICATION_OTP_FAILED"

            });


        // Counter no longer needed
        await redis.del(
            attemptsKey
        );


        return {

            locked: true,

            attempts,

            retryAfter:
                lock.retryAfter

        };

    }


    return {

        locked: false,

        attempts,

        remainingAttempts:
            5 - attempts

    };

};


// ==========================================================
// Clear Email OTP Attempts
// ==========================================================
//
// Call after successful email verification.
//
// ==========================================================

const clearEmailOtpAttempts = async (
    merchantId
) => {

    if (!merchantId) {
        return;
    }

    await redis.del(
        getEmailOtpAttemptsKey(
            merchantId
        )
    );

};


// ==========================================================
// Generic Security Lock Middleware
// ==========================================================

const checkMerchantSecurityLock = async (
    merchantId
) => {

    return await getMerchantSecurityLock(
        merchantId
    );

};


module.exports = {

    SECURITY_LOCK_TTL,

    getLockKey,

    isMerchantSecurityLocked,

    getMerchantSecurityLock,

    lockMerchant,

    unlockMerchant,

    recordEmailOtpFailure,

    clearEmailOtpAttempts,

    checkMerchantSecurityLock

};