const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");


// ==========================================================
// EXPORT DIRECTORY
// ==========================================================

const REPORTS_DIR = path.join(
    process.cwd(),
    "uploads",
    "reports",
    "merchants",
    "excel"
);


if (!fs.existsSync(REPORTS_DIR)) {

    fs.mkdirSync(
        REPORTS_DIR,
        {
            recursive: true
        }
    );

}


// ==========================================================
// EXPORT EXCEL
// ==========================================================

const exportExcel = async ({
    fileName,
    sheetName = "Report",
    columns = [],
    records = []
}) => {

    const timestamp =
        Date.now();


    const excelFile =
        `${fileName}_${timestamp}.xlsx`;


    const filePath =
        path.join(
            REPORTS_DIR,
            excelFile
        );


    const workbook =
        new ExcelJS.Workbook();


    const worksheet =
        workbook.addWorksheet(
            sheetName
        );


    worksheet.columns =
        columns;


    records.forEach(
        (record) => {

            worksheet.addRow(
                record
            );

        }
    );


    worksheet.getRow(1).font = {

        bold: true

    };


    worksheet.views = [

        {
            state: "frozen",
            ySplit: 1
        }

    ];


    await workbook.xlsx.writeFile(
        filePath
    );


    return {

        success:
            true,

        fileName:
            excelFile,

        filePath,

        contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    };

};


// ==========================================================
// DELETE EXCEL
// ==========================================================

const deleteExcel = async (
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
            "Excel cleanup failed:",
            error.message
        );

    }

};


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    exportExcel,

    deleteExcel

};