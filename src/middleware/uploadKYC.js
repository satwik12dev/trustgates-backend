const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// ==========================================================
// CONFIG
// ==========================================================

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const UPLOAD_ROOT = path.join(
    process.cwd(),
    "uploads",
    "kyc"
);


// ==========================================================
// ALLOWED TYPES
// ==========================================================

const ALLOWED_MIME_TYPES = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png"
]);

const ALLOWED_EXTENSIONS = new Set([
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png"
]);

const ALLOWED_FIELDS = new Set([
    "pan_document",
    "aadhaar_document"
]);


// ==========================================================
// GET MERCHANT ID
// ==========================================================
//
// ADMIN:
//     req.params.merchantId
//
// MERCHANT:
//     req.user.merchant_id
//
// Merchant cannot choose another merchantId.
// ==========================================================

const getMerchantId = (req) => {

    // ------------------------------------------------------
    // ADMIN
    // ------------------------------------------------------

    if (req.admin?.admin_id) {

        const merchantId =
            String(
                req.params?.merchantId || ""
            ).trim();

        if (
            !/^[1-9]\d*$/.test(
                merchantId
            )
        ) {
            return null;
        }

        return merchantId;
    }


    // ------------------------------------------------------
    // MERCHANT
    // ------------------------------------------------------

    if (req.user?.merchant_id) {

        const merchantId =
            String(
                req.user.merchant_id
            ).trim();

        if (
            !/^[1-9]\d*$/.test(
                merchantId
            )
        ) {
            return null;
        }

        return merchantId;
    }


    return null;
};


// ==========================================================
// GET DOCUMENT DIRECTORY
// ==========================================================

const getMerchantDirectory = (
    merchantId
) => {

    return path.join(
        UPLOAD_ROOT,
        `merchant_${merchantId}`
    );

};


// ==========================================================
// MULTER STORAGE
// ==========================================================

const storage = multer.diskStorage({

    destination: (
        req,
        file,
        cb
    ) => {

        try {

            const merchantId =
                getMerchantId(req);


            if (!merchantId) {

                return cb(
                    new Error(
                        "Unable to determine merchant."
                    )
                );

            }


            const merchantDir =
                getMerchantDirectory(
                    merchantId
                );


            if (!fs.existsSync(merchantDir)) {

                fs.mkdirSync(
                    merchantDir,
                    {
                        recursive: true,
                        mode: 0o750
                    }
                );

            }


            cb(
                null,
                merchantDir
            );

        } catch (error) {

            cb(error);

        }

    },


    filename: (
        req,
        file,
        cb
    ) => {

        try {

            const merchantId =
                getMerchantId(req);


            if (!merchantId) {

                return cb(
                    new Error(
                        "Invalid merchant."
                    )
                );

            }


            const extension =
                path.extname(
                    file.originalname || ""
                ).toLowerCase();


            let documentType;


            if (
                file.fieldname ===
                "pan_document"
            ) {

                documentType = "pan";

            } else if (
                file.fieldname ===
                "aadhaar_document"
            ) {

                documentType = "aadhaar";

            } else {

                return cb(
                    new Error(
                        "Invalid document field."
                    )
                );

            }


            // Never use original filename.
            const randomId =
                crypto
                    .randomBytes(16)
                    .toString("hex");


            const filename =
                `${documentType}_${merchantId}_${randomId}${extension}`;


            cb(
                null,
                filename
            );

        } catch (error) {

            cb(error);

        }

    }

});


// ==========================================================
// FILE FILTER
// ==========================================================

const fileFilter = (
    req,
    file,
    cb
) => {

    // ------------------------------------------------------
    // Field validation
    // ------------------------------------------------------

    if (
        !ALLOWED_FIELDS.has(
            file.fieldname
        )
    ) {

        return cb(
            new Error(
                "Invalid document field."
            ),
            false
        );

    }


    const extension =
        path.extname(
            file.originalname || ""
        ).toLowerCase();


    const mimeType =
        String(
            file.mimetype || ""
        ).toLowerCase();


    // ------------------------------------------------------
    // Extension validation
    // ------------------------------------------------------

    if (
        !ALLOWED_EXTENSIONS.has(
            extension
        )
    ) {

        return cb(
            new Error(
                "Invalid file extension. Only PDF, JPG, JPEG and PNG files are allowed."
            ),
            false
        );

    }


    // ------------------------------------------------------
    // MIME validation
    // ------------------------------------------------------

    if (
        !ALLOWED_MIME_TYPES.has(
            mimeType
        )
    ) {

        return cb(
            new Error(
                "Invalid file type. Only PDF, JPG, JPEG and PNG files are allowed."
            ),
            false
        );

    }


    // ------------------------------------------------------
    // Extension + MIME consistency
    // ------------------------------------------------------

    const validCombination =

        (
            extension === ".pdf" &&
            mimeType === "application/pdf"
        )

        ||

        (
            [".jpg", ".jpeg"].includes(
                extension
            ) &&
            mimeType === "image/jpeg"
        )

        ||

        (
            extension === ".png" &&
            mimeType === "image/png"
        );


    if (!validCombination) {

        return cb(
            new Error(
                "File extension and MIME type do not match."
            ),
            false
        );

    }


    cb(
        null,
        true
    );

};


// ==========================================================
// MULTER
// ==========================================================

const multerUpload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize:
            MAX_FILE_SIZE,

        files: 2,

        fields: 10,

        parts: 12,

        fieldNameSize: 100,

        fieldSize: 10 * 1024

    }

}).fields([

    {
        name: "pan_document",
        maxCount: 1
    },

    {
        name: "aadhaar_document",
        maxCount: 1
    }

]);


// ==========================================================
// FILE SIGNATURE VALIDATION
// ==========================================================

const validateFileSignature = (
    filePath,
    extension
) => {

    const buffer =
        Buffer.alloc(16);


    const fd =
        fs.openSync(
            filePath,
            "r"
        );


    try {

        fs.readSync(
            fd,
            buffer,
            0,
            buffer.length,
            0
        );

    } finally {

        fs.closeSync(fd);

    }


    // ------------------------------------------------------
    // PDF
    // ------------------------------------------------------

    if (
        extension === ".pdf"
    ) {

        return (
            buffer
                .subarray(0, 5)
                .toString() ===
            "%PDF-"
        );

    }


    // ------------------------------------------------------
    // JPEG
    // ------------------------------------------------------

    if (
        [".jpg", ".jpeg"]
            .includes(extension)
    ) {

        return (
            buffer[0] === 0xff &&
            buffer[1] === 0xd8 &&
            buffer[2] === 0xff
        );

    }


    // ------------------------------------------------------
    // PNG
    // ------------------------------------------------------

    if (
        extension === ".png"
    ) {

        return (
            buffer[0] === 0x89 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x4e &&
            buffer[3] === 0x47 &&
            buffer[4] === 0x0d &&
            buffer[5] === 0x0a &&
            buffer[6] === 0x1a &&
            buffer[7] === 0x0a
        );

    }


    return false;

};


// ==========================================================
// CLEANUP
// ==========================================================

const cleanupUploadedFiles = (
    files
) => {

    if (!files) {
        return;
    }


    Object.values(files)
        .flat()
        .forEach(file => {

            try {

                if (
                    file?.path &&
                    fs.existsSync(
                        file.path
                    )
                ) {

                    fs.unlinkSync(
                        file.path
                    );

                }

            } catch (error) {

                console.error(
                    "KYC file cleanup error:",
                    error.message
                );

            }

        });

};


// ==========================================================
// MIDDLEWARE
// ==========================================================

const uploadKycMiddleware = (
    req,
    res,
    next
) => {

    // ------------------------------------------------------
    // Authentication / merchant resolution
    // ------------------------------------------------------

    const merchantId =
        getMerchantId(req);


    if (!merchantId) {

        return res.status(401).json({

            success: false,

            message:
                "Unable to determine authenticated merchant."

        });

    }


    // ------------------------------------------------------
    // Multer
    // ------------------------------------------------------

    multerUpload(
        req,
        res,
        (err) => {

            // ------------------------------------------------
            // Multer errors
            // ------------------------------------------------

            if (
                err instanceof
                multer.MulterError
            ) {

                cleanupUploadedFiles(
                    req.files
                );


                if (
                    err.code ===
                    "LIMIT_FILE_SIZE"
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "File size limit exceeded. Maximum 5 MB allowed per document."

                    });

                }


                if (
                    err.code ===
                    "LIMIT_FILE_COUNT"
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Too many files uploaded. Maximum 2 documents allowed."

                    });

                }


                if (
                    err.code ===
                    "LIMIT_UNEXPECTED_FILE"
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            `Unexpected file field '${err.field}'. Only pan_document and aadhaar_document are allowed.`

                    });

                }


                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid file upload."

                });

            }


            // ------------------------------------------------
            // Custom errors
            // ------------------------------------------------

            if (err) {

                cleanupUploadedFiles(
                    req.files
                );


                return res.status(400).json({

                    success: false,

                    message:
                        err.message ||
                        "File upload validation failed."

                });

            }


            // ------------------------------------------------
            // Required files
            // ------------------------------------------------

            const panFile =
                req.files?.pan_document?.[0];

            const aadhaarFile =
                req.files?.aadhaar_document?.[0];


            if (
                !panFile ||
                !aadhaarFile
            ) {

                cleanupUploadedFiles(
                    req.files
                );


                return res.status(400).json({

                    success: false,

                    message:
                        "Both PAN and Aadhaar documents are required."

                });

            }


            // ------------------------------------------------
            // Magic-byte validation
            // ------------------------------------------------

            const files = [
                panFile,
                aadhaarFile
            ];


            for (
                const file of files
            ) {

                const extension =
                    path.extname(
                        file.originalname
                    ).toLowerCase();


                let validSignature;


                try {

                    validSignature =
                        validateFileSignature(
                            file.path,
                            extension
                        );

                } catch (error) {

                    cleanupUploadedFiles(
                        req.files
                    );


                    return res.status(400).json({

                        success: false,

                        message:
                            "Unable to validate uploaded document."

                    });

                }


                if (
                    !validSignature
                ) {

                    cleanupUploadedFiles(
                        req.files
                    );


                    return res.status(400).json({

                        success: false,

                        message:
                            "Uploaded file content does not match its declared file type."

                    });

                }

            }


            // ------------------------------------------------
            // Sanitized upload information
            // ------------------------------------------------

            req.kycUpload = {

                merchantId,

                panDocument:
                    panFile.filename,

                aadhaarDocument:
                    aadhaarFile.filename

            };


            next();

        }

    );

};


module.exports =
    uploadKycMiddleware;