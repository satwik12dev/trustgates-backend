const crypto = require("crypto");
const bcrypt = require("bcrypt");

const createWalletService = require(
    "../wallet/createWallet.service"
);

const {
    checkWalletExists
} = require(
    "../wallet/helpers/wallet.helper"
);

const apiCredentialQueries = require(
    "../../queries/merchant/apiCredential/apiCredential.query"
);

const activateMerchantIfEligible = async (
    connection,
    merchantId
) => {

    // ==========================================
    // Get Merchant
    // ==========================================

    const [merchants] =
        await connection.query(
            `
            SELECT
                merchant_id,
                email_verified,
                kyc_status,
                account_status
            FROM merchants
            WHERE merchant_id = ?
            FOR UPDATE
            `,
            [merchantId]
        );

    if (!merchants.length) {

        throw new Error(
            "Merchant not found."
        );

    }

    const merchant = merchants[0];

    // ==========================================
    // Check Eligibility
    // ==========================================

    const emailVerified =
        Boolean(merchant.email_verified);

    const kycApproved =
        merchant.kyc_status === "APPROVED";

    if (!emailVerified || !kycApproved) {

        return {

            activated: false,

            eligible: false,

            alreadyActive:
                merchant.account_status === "ACTIVE",

            merchantId,

            emailVerified,

            kycStatus:
                merchant.kyc_status,

            accountStatus:
                merchant.account_status,

            wallet: null,

            apiCredentials: null

        };

    }

    // ==========================================
    // Activate Merchant
    // ==========================================

    if (merchant.account_status !== "ACTIVE") {

        const [activationResult] =
            await connection.query(
                `
                UPDATE merchants
                SET
                    account_status = 'ACTIVE'
                WHERE merchant_id = ?
                `,
                [merchantId]
            );

        if (
            activationResult.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to activate merchant."
            );

        }

    }

    // ==========================================
    // Ensure Wallet Exists
    // ==========================================

    let wallet = null;
    let walletCreated = false;

    const walletExists =
        await checkWalletExists(
            connection,
            merchantId
        );

    if (!walletExists) {

        wallet =
            await createWalletService(
                connection,
                {
                    merchantId,
                    currency: "INR"
                }
            );

        walletCreated = true;

    } else {

        const [walletRows] =
            await connection.query(
                `
                SELECT
                    wallet_id,
                    merchant_id,
                    currency,
                    wallet_status
                FROM merchant_wallets
                WHERE merchant_id = ?
                LIMIT 1
                `,
                [merchantId]
            );

        if (walletRows.length) {

            wallet = {

                walletId:
                    walletRows[0].wallet_id,

                merchantId:
                    walletRows[0].merchant_id,

                currency:
                    walletRows[0].currency,

                status:
                    walletRows[0].wallet_status

            };

        }

    }

    // ==========================================
    // Check Existing ACTIVE API Credential
    // ==========================================

    const [existingCredentials] =
        await connection.query(
            `
            SELECT
                credential_id,
                public_key,
                environment,
                status
            FROM api_credentials
            WHERE merchant_id = ?
              AND status = 'ACTIVE'
            ORDER BY created_at DESC
            LIMIT 1
            `,
            [merchantId]
        );

    let apiCredentials = null;
    let apiCredentialsCreated = false;

    // ==========================================
    // Create API Credential If Missing
    // ==========================================

    if (!existingCredentials.length) {

        const environment = "SANDBOX";

        const prefix =
            environment === "PRODUCTION"
                ? "live"
                : "test";

        const publicKey =
            `pk_${prefix}_` +
            crypto
                .randomBytes(24)
                .toString("hex");

        const secretKey =
            `sk_${prefix}_` +
            crypto
                .randomBytes(32)
                .toString("hex");

        const secretHash =
            await bcrypt.hash(
                secretKey,
                12
            );

        const [createdCredential] =
            await connection.query(
                apiCredentialQueries.CREATE_API_CREDENTIAL,
                [
                    merchantId,
                    publicKey,
                    secretHash,
                    environment
                ]
            );

        if (
            createdCredential.affectedRows !== 1
        ) {

            throw new Error(
                "Failed to create API credentials."
            );

        }

        apiCredentialsCreated = true;

        apiCredentials = {

            credentialId:
                createdCredential.insertId,

            publicKey,

            secretKey,

            environment,

            status: "ACTIVE"

        };

    } else {

        // ==========================================
        // Existing Credentials
        // ==========================================

        apiCredentials = {

            credentialId:
                existingCredentials[0]
                    .credential_id,

            publicKey:
                existingCredentials[0]
                    .public_key,

            environment:
                existingCredentials[0]
                    .environment,

            status:
                existingCredentials[0]
                    .status

        };

    }

    // ==========================================
    // Final Result
    // ==========================================

    return {

        activated: true,

        eligible: true,

        alreadyActive:
            merchant.account_status === "ACTIVE",

        merchantId,

        emailVerified: true,

        kycStatus: "APPROVED",

        accountStatus: "ACTIVE",

        walletCreated,

        apiCredentialsCreated,

        wallet,

        apiCredentials

    };

};

module.exports =
    activateMerchantIfEligible;