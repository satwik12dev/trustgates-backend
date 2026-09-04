const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");

const REPORTS_DIR = path.join(process.cwd(), "uploads", "reports/admin");

// Create reports directory if it doesn't exist
if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/**
 * Export data to Excel
 * @param {Object} options
 * @param {String} options.fileName
 * @param {String} options.sheetName
 * @param {Array} options.columns
 * @param {Array} options.records
 * @returns {Promise<Object>}
 */
const exportExcel = async ({
    fileName,
    sheetName = "Report",
    columns,
    records,
}) => {
    try {
        const workbook = new ExcelJS.Workbook();

        workbook.creator = "Payment Gateway";
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet(sheetName);

        worksheet.columns = columns;

        // Header Styling
        worksheet.getRow(1).font = {
            bold: true,
            color: { argb: "FFFFFFFF" },
        };

        worksheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "4472C4" },
        };

        worksheet.getRow(1).alignment = {
            vertical: "middle",
            horizontal: "center",
        };

        // Add Rows
        records.forEach((record) => {
            worksheet.addRow(record);
        });

        // Auto Width
        worksheet.columns.forEach((column) => {
            let maxLength = column.header.length;

            column.eachCell({ includeEmpty: true }, (cell) => {
                const cellValue = cell.value ? cell.value.toString() : "";
                maxLength = Math.max(maxLength, cellValue.length);
            });

            column.width = Math.min(maxLength + 4, 40);
        });

        // Border
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
            });
        });

        const timestamp = Date.now();
        const excelFile = `${fileName}_${timestamp}.xlsx`;

        const filePath = path.join(REPORTS_DIR, excelFile);

        await workbook.xlsx.writeFile(filePath);

        return {
            success: true,
            fileName: excelFile,
            filePath,
            downloadPath: `/uploads/reports/admin/${excelFile}`,
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Delete exported Excel file
 */
const deleteExcel = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

module.exports = {
    exportExcel,
    deleteExcel,
};