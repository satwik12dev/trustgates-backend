const fs = require("fs");
const path = require("path");
const { createObjectCsvWriter } = require("csv-writer");

const REPORTS_DIR = path.join(process.cwd(), "uploads", "reports/admin");

// Create reports directory if it doesn't exist
if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
}


const exportCSV = async ({ fileName, headers, records }) => {
    try {
        const timestamp = Date.now();
        const csvFile = `${fileName}_${timestamp}.csv`;

        const filePath = path.join(REPORTS_DIR, csvFile);

        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: headers,
        });

        await csvWriter.writeRecords(records);

        return {
            success: true,
            fileName: csvFile,
            filePath,
            downloadPath: `/uploads/reports/admin/${csvFile}`,
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Delete exported file (optional)
 */
const deleteCSV = async (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

module.exports = {
    exportCSV,
    deleteCSV,
};