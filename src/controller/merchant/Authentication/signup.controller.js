const crypto = require("crypto");
const argon2 = require("argon2");

const pool = require("../../../config/pool");


// ==========================================================
// Argon2 Configuration
// ==========================================================

const ARGON2_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
};


// ==========================================================
// Helpers
// ==========================================================

const normalizeEmail = (email) => {

    return String(email || "")
        .trim()
        .toLowerCase();

};


const normalizeName = (value) => {

    return String(value || "")
        .trim()
        .replace(/\s+/g, " ");

};


const normalizePhone = (phone) => {

    return String(phone || "")
        .trim()
        .replace(/\s+/g, "");

};


// ==========================================================
// Merchant Code Generator
// ==========================================================

const generateMerchantCode = () => {

    const randomPart =
        crypto
            .randomBytes(5)
            .toString("hex")
            .toUpperCase();

    return `MER${randomPart}`;
};


// ==========================================================
// Merchant Signup
// ==========================================================

const signup = async (req, res) => {

    let connection;

    try {

        // ==================================================
        // Read Body
        // ==================================================

        let {
            merchantName,
            businessName,
            email,
            phone,
            website,
            password
        } = req.body || {};


        // ==================================================
        // Type Validation
        // ==================================================

        if (
            typeof merchantName !== "string" ||
            typeof businessName !== "string" ||
            typeof email !== "string" ||
            typeof phone !== "string" ||
            typeof password !== "string"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid input data."

            });

        }


        // ==================================================
        // Normalize
        // ==================================================

        merchantName =
            normalizeName(
                merchantName
            );

        businessName =
            normalizeName(
                businessName
            );

        email =
            normalizeEmail(
                email
            );

        phone =
            normalizePhone(
                phone
            );

        // IMPORTANT:
        // Never trim password.
        password =
            String(password);


        // ==================================================
        // Website Normalization
        // ==================================================

        if (
            website !== undefined &&
            website !== null
        ) {

            if (
                typeof website !== "string"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Website must be a valid string."

                });

            }

            website =
                website.trim();

        } else {

            website = null;

        }


        // ==================================================
        // Required Fields
        // ==================================================

        if (
            !merchantName ||
            !businessName ||
            !email ||
            !phone ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Merchant name, business name, email, phone and password are required."

            });

        }


        // ==================================================
        // Name Validation
        // ==================================================

        if (
            merchantName.length < 2 ||
            merchantName.length > 100
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Merchant name must be between 2 and 100 characters."

            });

        }


        if (
            businessName.length < 2 ||
            businessName.length > 150
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Business name must be between 2 and 150 characters."

            });

        }


        // ==================================================
        // Email Validation
        // ==================================================

        if (
            email.length > 255 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please provide a valid email address."

            });

        }


        // ==================================================
        // Phone Validation
        // ==================================================

        if (
            !/^[6-9]\d{9}$/.test(phone)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please provide a valid 10-digit Indian mobile number."

            });

        }


        // ==================================================
        // Website Validation
        // ==================================================

        if (website) {

            if (
                website.length > 500
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Website URL is too long."

                });

            }


            let parsedUrl;

            try {

                parsedUrl =
                    new URL(website);

            } catch {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please provide a valid website URL."

                });

            }


            if (
                !["http:", "https:"]
                    .includes(
                        parsedUrl.protocol
                    )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Website must use HTTP or HTTPS."

                });

            }

        }


        // ==================================================
        // Password Validation
        // ==================================================

        if (
            password.length < 8 ||
            password.length > 128
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must be between 8 and 128 characters."

            });

        }


        // ==================================================
        // Strong Password Policy
        // ==================================================

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,128}$/;


        if (
            !passwordRegex.test(password)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character."

            });

        }


        // ==================================================
        // Database Connection
        // ==================================================

        connection =
            await pool.getConnection();


        // ==================================================
        // Check Duplicate Email
        // ==================================================

        const [
            existingRows
        ] = await connection.query(

            `
                SELECT
                    merchant_id,
                    email
                FROM merchants
                WHERE email = ?
                LIMIT 1
            `,

            [
                email
            ]

        );


        if (
            existingRows.length
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "An account with this email already exists."

            });

        }


        // ==================================================
        // Hash Password With Argon2id
        // ==================================================

        const passwordHash =
            await argon2.hash(
                password,
                ARGON2_OPTIONS
            );


        // ==================================================
        // Generate Merchant Code
        // ==================================================

        let merchantCode;

        let insertResult;

        let insertAttempts = 0;


        // ==================================================
        // Transaction
        // ==================================================

        await connection.beginTransaction();


        // ==================================================
        // Insert Merchant
        // ==================================================

        while (
            insertAttempts < 3
        ) {

            merchantCode =
                generateMerchantCode();


            try {

                [
                    insertResult
                ] = await connection.query(

                    `
                        INSERT INTO merchants
                        (
                            merchant_name,
                            business_name,
                            email,
                            phone,
                            website,
                            password_hash,
                            email_verified,
                            approval_status,
                            kyc_status,
                            account_status,
                            merchant_code
                        )

                        VALUES
                        (
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            FALSE,
                            'PENDING',
                            'PENDING',
                            'HOLD',
                            ?
                        )
                    `,

                    [
                        merchantName,
                        businessName,
                        email,
                        phone,
                        website,
                        passwordHash,
                        merchantCode
                    ]

                );


                break;


            } catch (error) {

                // Duplicate merchant code
                if (
                    error.code ===
                    "ER_DUP_ENTRY" &&
                    String(error.sqlMessage || "")
                        .includes("merchant_code")
                ) {

                    insertAttempts++;

                    continue;

                }


                throw error;

            }

        }


        // ==================================================
        // Merchant Code Generation Failed
        // ==================================================

        if (
            !insertResult
        ) {

            throw new Error(
                "Unable to generate a unique merchant code."
            );

        }


        // ==================================================
        // Commit
        // ==================================================

        await connection.commit();


        // ==================================================
        // Response
        // ==================================================

        return res.status(201).json({

            success: true,

            message:
                "Signup successful. Please verify your email. Your account is pending admin approval.",

            merchant: {

                merchantId:
                    insertResult.insertId,

                merchantCode,

                merchantName,

                businessName,

                email,

                phone,

                website,

                approvalStatus:
                    "PENDING",

                kycStatus:
                    "PENDING",

                accountStatus:
                    "HOLD"

            }

        });


    } catch (error) {

        // ==================================================
        // Rollback
        // ==================================================

        if (connection) {

            try {

                await connection.rollback();

            } catch (rollbackError) {

                console.error(
                    "Signup Rollback Error:",
                    rollbackError
                );

            }

        }


        // ==================================================
        // Duplicate Entry
        // ==================================================

        if (
            error.code ===
            "ER_DUP_ENTRY"
        ) {

            const sqlMessage =
                String(
                    error.sqlMessage || ""
                );


            if (
                sqlMessage.includes("email")
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "An account with this email already exists."

                });

            }


            if (
                sqlMessage.includes("merchant_code")
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Unable to create merchant account. Please try again."

                });

            }

        }


        // ==================================================
        // Production Error Logging
        // ==================================================

        console.error(
            "Signup Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to create account at the moment. Please try again later."

        });


    } finally {

        if (connection) {

            connection.release();

        }

    }

};


module.exports = signup;