const fs = require("fs/promises");
const path = require("path");

const pool = require("../../config/pool");
const ApiError = require("../../utils/kyc/APIError");


// ==========================================================
// Merchant KYC Upload Service
// ==========================================================
//
// Flow:
//
// New KYC
//     ↓
// PENDING
//     ↓
// Admin Review
//
// APPROVED
//     ↓
// No re-upload
//
// REJECTED
//     ↓
// Contact Admin
//     ↓
// Admin sets kyc_resubmission_allowed = 1
//     ↓
// Merchant re-uploads
//     ↓
// PENDING
//     ↓
// kyc_resubmission_allowed automatically becomes 0
//
// ==========================================================


const uploadKycService = async (
    merchantId,
    data,
    files
) => {

    let connection;

    // ======================================================
    // Track physical files created by this request
    // ======================================================

    const uploadedFiles = [];


    try {

        // ==================================================
        // Validate Merchant ID
        // ==================================================

        const numericMerchantId =
            Number(merchantId);


        if (
            !Number.isInteger(
                numericMerchantId
            ) ||
            numericMerchantId <= 0
        ) {

            throw new ApiError(
                400,
                "Invalid merchant ID."
            );

        }


        // ==================================================
        // Get Database Connection
        // ==================================================

        connection =
            await pool.getConnection();


        // ==================================================
        // Start Transaction
        // ==================================================

        await connection.beginTransaction();


        // ==================================================
        // 1. Check Merchant
        // ==================================================

        const [
            merchantRows
        ] = await connection.query(

            `
                SELECT

                    merchant_id,
                    email_verified,
                    kyc_status,
                    account_status

                FROM merchants

                WHERE merchant_id = ?

                  AND deleted_at IS NULL

                LIMIT 1
            `,

            [
                numericMerchantId
            ]

        );


        // ==================================================
        // Merchant Not Found
        // ==================================================

        if (
            !merchantRows.length
        ) {

            throw new ApiError(
                404,
                "Merchant not found."
            );

        }


        const merchant =
            merchantRows[0];


        // ==================================================
        // 2. Email Verification Check
        // ==================================================

        if (
            !Boolean(
                merchant.email_verified
            )
        ) {

            throw new ApiError(
                403,
                "Please verify your email before submitting KYC."
            );

        }


        // ==================================================
        // 3. Get Existing KYC
        // ==================================================

        const [
            existingKyc
        ] = await connection.query(

            `
                SELECT

                    kyc_id,
                    kyc_status,
                    kyc_resubmission_allowed,
                    pan_document,
                    aadhaar_document

                FROM merchant_kyc

                WHERE merchant_id = ?

                LIMIT 1
            `,

            [
                numericMerchantId
            ]

        );


        let existingKycRecord = null;


        if (
            existingKyc.length
        ) {

            existingKycRecord =
                existingKyc[0];

        }


        // ==================================================
        // 4. Existing KYC Rules
        // ==================================================

        if (
            existingKycRecord
        ) {

            const currentStatus =
                existingKycRecord.kyc_status;


            // ------------------------------------------------
            // PENDING
            // ------------------------------------------------
            //
            // Already under review.
            //
            // ------------------------------------------------

            if (
                currentStatus ===
                "PENDING"
            ) {

                throw new ApiError(
                    409,
                    "Your KYC is already under review."
                );

            }


            // ------------------------------------------------
            // APPROVED
            // ------------------------------------------------
            //
            // Approved KYC cannot be replaced
            // by merchant.
            //
            // ------------------------------------------------

            if (
                currentStatus ===
                "APPROVED"
            ) {

                throw new ApiError(
                    409,
                    "Your KYC has already been approved."
                );

            }


            // ------------------------------------------------
            // REJECTED
            // ------------------------------------------------

            if (
                currentStatus ===
                "REJECTED"
            ) {

                const resubmissionAllowed =
                    Boolean(
                        existingKycRecord
                            .kyc_resubmission_allowed
                    );


                // --------------------------------------------
                // Admin has NOT allowed resubmission
                // --------------------------------------------

                if (
                    !resubmissionAllowed
                ) {

                    throw new ApiError(
                        409,
                        "Your KYC was rejected. Please contact support for resubmission."
                    );

                }

            }

        }


        // ==================================================
        // 5. Validate Files
        // ==================================================

        if (
            !files ||
            !files.pan_document ||
            !files.pan_document.length ||
            !files.aadhaar_document ||
            !files.aadhaar_document.length
        ) {

            throw new ApiError(
                400,
                "PAN and Aadhaar documents are required."
            );

        }


        // ==================================================
        // Only One PAN + One Aadhaar
        // ==================================================

        if (
            files.pan_document.length !== 1 ||
            files.aadhaar_document.length !== 1
        ) {

            throw new ApiError(
                400,
                "Exactly one PAN document and one Aadhaar document are required."
            );

        }


        // ==================================================
        // Get Files
        // ==================================================

        const panFile =
            files.pan_document[0];

        const aadhaarFile =
            files.aadhaar_document[0];


        // ==================================================
        // Validate Physical File Paths
        // ==================================================

        if (
            !panFile ||
            !panFile.path
        ) {

            throw new ApiError(
                400,
                "PAN document upload failed."
            );

        }


        if (
            !aadhaarFile ||
            !aadhaarFile.path
        ) {

            throw new ApiError(
                400,
                "Aadhaar document upload failed."
            );

        }


        // ==================================================
        // Track Files For Rollback Cleanup
        // ==================================================

        uploadedFiles.push(
            panFile.path
        );

        uploadedFiles.push(
            aadhaarFile.path
        );


        // ==================================================
        // Validate Generated Filenames
        // ==================================================

        if (
            !panFile.filename ||
            !aadhaarFile.filename
        ) {

            throw new ApiError(
                400,
                "Uploaded document information is invalid."
            );

        }


        const panDocument =
            path.basename(
                panFile.filename
            );


        const aadhaarDocument =
            path.basename(
                aadhaarFile.filename
            );


        // ==================================================
        // Validate PAN/Aadhaar Data
        // ==================================================

        const panNumber =
            String(
                data?.pan_number || ""
            )
                .trim()
                .toUpperCase();


        const aadhaarNumber =
            String(
                data?.aadhaar_number || ""
            )
                .trim();


        // ==================================================
        // PAN Validation
        // ==================================================

        if (
            !/^[A-Z]{5}[0-9]{4}[A-Z]$/
                .test(panNumber)
        ) {

            throw new ApiError(
                400,
                "Invalid PAN number."
            );

        }


        // ==================================================
        // Aadhaar Validation
        // ==================================================

        if (
            !/^\d{12}$/.test(
                aadhaarNumber
            )
        ) {

            throw new ApiError(
                400,
                "Invalid Aadhaar number."
            );

        }


        // ==================================================
        // 6. Insert / Update KYC
        // ==================================================

        if (
            existingKycRecord
        ) {

            // ------------------------------------------------
            // RE-SUBMISSION
            // ------------------------------------------------

            await connection.query(

                `
                    UPDATE merchant_kyc

                    SET

                        pan_number = ?,

                        aadhaar_number = ?,

                        pan_document = ?,

                        aadhaar_document = ?,

                        kyc_status = 'PENDING',

                        kyc_resubmission_allowed = FALSE,

                        verification_notes = NULL,

                        verified_by = NULL,

                        verified_at = NULL,

                        updated_at = NOW(),
                        kyc_submitted = TRUE
                    WHERE merchant_id = ?

                      AND kyc_status = 'REJECTED'

                      AND kyc_resubmission_allowed = TRUE

                    LIMIT 1
                `,

                [

                    panNumber,

                    aadhaarNumber,

                    panDocument,

                    aadhaarDocument,

                    numericMerchantId

                ]

            );

        } else {

            // ------------------------------------------------
            // FIRST KYC SUBMISSION
            // ------------------------------------------------

            await connection.query(

    `INSERT INTO merchant_kyc
(
    merchant_id,
    pan_number,
    aadhaar_number,
    pan_document,
    aadhaar_document,
    kyc_status,
    kyc_resubmission_allowed,
    kyc_submitted
)
VALUES
(
    ?,
    ?,
    ?,
    ?,
    ?,
    'PENDING',
    FALSE,
    TRUE
)`,

    [

        numericMerchantId,

        panNumber,

        aadhaarNumber,

        panDocument,

        aadhaarDocument

    ]

);

        }


        // ==================================================
        // 7. Commit Transaction
        // ==================================================

        await connection.commit();


        // ==================================================
        // 8. Success Response
        // ==================================================

        return {

            status:
                "PENDING",

            accountStatus:
                merchant.account_status,

            emailVerified:
                Boolean(
                    merchant.email_verified
                ),

            merchantId:
                numericMerchantId,

            documents: {

                pan:
                    panDocument,

                aadhaar:
                    aadhaarDocument

            }

        };


    } catch (error) {

        // ==================================================
        // Rollback Database
        // ==================================================

        if (connection) {

            try {

                await connection.rollback();

            } catch (rollbackError) {

                console.error(
                    "KYC DB Rollback Error:",
                    rollbackError
                );

            }

        }


        // ==================================================
        // Delete Physical Files
        // ==================================================
        //
        // If DB transaction fails after Multer already
        // saved the files, remove those files.
        //
        // ==================================================

        for (
            const filePath of uploadedFiles
        ) {

            if (!filePath) {
                continue;
            }


            try {

                await fs.unlink(
                    path.resolve(filePath)
                );


            } catch (fileError) {

                // ------------------------------------------
                // File already doesn't exist
                // ------------------------------------------

                if (
                    fileError.code ===
                    "ENOENT"
                ) {

                    continue;

                }


                console.error(
                    "KYC File Cleanup Error:",
                    fileError
                );

            }

        }


        throw error;


    } finally {

        // ==================================================
        // Release DB Connection
        // ==================================================

        if (connection) {

            connection.release();

        }

    }

};


module.exports = {
    uploadKycService
};