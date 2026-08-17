const fs = require("fs");
const path = require("path");
const { createObjectCsvWriter } = require("csv-writer");


// ==========================================================
// EXPORT DIRECTORY
// ==========================================================

const REPORTS_DIR = path.join(
    process.cwd(),
    "uploads",
    "reports",
    "merchants",
    "csv"
);


// ==========================================================
// CREATE DIRECTORY
// ==========================================================

if (!fs.existsSync(REPORTS_DIR)) {

    fs.mkdirSync(
        REPORTS_DIR,
        {
            recursive: true
        }
    );

}


// ==========================================================
// EXPORT CSV
// ==========================================================

const exportCSV = async ({
    fileName,
    headers,
    records
}) => {

    const timestamp =
        Date.now();


    const csvFile =
        `${fileName}_${timestamp}.csv`;


    const filePath =
        path.join(
            REPORTS_DIR,
            csvFile
        );


    const csvWriter =
        createObjectCsvWriter({

            path:
                filePath,

            header:
                headers

        });


    await csvWriter.writeRecords(
        records
    );


    return {

        success:
            true,

        fileName:
            csvFile,

        filePath,

        contentType:
            "text/csv"

    };

};


// ==========================================================
// DELETE CSV
// ==========================================================

const deleteCSV = async (
    filePath
) => {

    try {

        if (
            filePath &&
            fs.existsSync(filePath)
        ) {

            await fs.promises.unlink(
                filePath
            );

        }

    } catch (error) {

        console.error(
            "CSV cleanup failed:",
            error.message
        );

    }

};


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    exportCSV,

    deleteCSV

};