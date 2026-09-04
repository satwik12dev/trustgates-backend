const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

// ============================================================
// EXPORT DIRECTORY
// ============================================================

const EXPORT_PATH = path.join(
    process.cwd(),
    "uploads",
    "reports",
    "admin"
);

const verifyExportDirectory = () => {

    if (!fs.existsSync(EXPORT_PATH)) {
        fs.mkdirSync(EXPORT_PATH, {
            recursive: true
        });
    }

    return EXPORT_PATH;
};

verifyExportDirectory();


// ============================================================
// PAGE CONFIGURATION
// ============================================================

const PAGE = {

    WIDTH: 595,

    HEIGHT: 842,

    MARGIN: 36,

    TOP: 30,

    BOTTOM: 42,

    CONTENT_TOP: 132,

    CONTENT_BOTTOM: 770,

    TABLE_HEADER_HEIGHT: 27,

    TABLE_ROW_HEIGHT: 24

};


// ============================================================
// COLORS
// ============================================================

const COLORS = {

    navy: "#13233F",

    navyDark: "#0B172D",

    blue: "#246BCE",

    blueLight: "#EAF2FF",

    gold: "#C9A24D",

    goldLight: "#F7F0DF",

    green: "#087A3D",

    greenLight: "#E8F6EE",

    red: "#B42332",

    redLight: "#FDEBEC",

    orange: "#A86B00",

    orangeLight: "#FFF5DD",

    purple: "#6941C6",

    purpleLight: "#F4F0FF",

    cyan: "#087E8B",

    cyanLight: "#E7F7F8",

    black: "#101828",

    text: "#344054",

    muted: "#667085",

    lightText: "#98A2B3",

    border: "#D0D5DD",

    borderLight: "#EAECF0",

    background: "#F8FAFC",

    rowAlt: "#F9FAFB",

    white: "#FFFFFF"

};


// ============================================================
// FONTS
// ============================================================

const FONT = {

    regular: "Helvetica",

    bold: "Helvetica-Bold",

    italic: "Helvetica-Oblique"

};


// ============================================================
// BANK / ORGANIZATION DETAILS
// ============================================================

const BANK_CONFIG = {

    name:
        "PAYMENT GATEWAY FINANCIAL SERVICES",

    subtitle:
        "OFFICIAL FINANCIAL REPORT",

    ifsc:
        "PGFS0000001",

    micr:
        "110001001",

    footer:
        "This is a computer-generated statement and does not require a physical signature.",

    security:
        "This report contains confidential financial information intended only for authorized personnel."

};


// ============================================================
// BASIC HELPERS
// ============================================================

const safeNumber = (value) => {

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

};


const formatCurrency = (value) => {

    return `₹ ${safeNumber(value).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,

            maximumFractionDigits: 2
        }
    )}`;

};


const formatNumber = (value) => {

    return safeNumber(value)
        .toLocaleString("en-IN");

};


const formatPercent = (value) => {

    return `${safeNumber(value).toFixed(2)}%`;

};


const formatDate = (value) => {

    if (!value) {
        return "-";
    }

    try {

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return new Intl.DateTimeFormat(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        ).format(date);

    } catch {

        return String(value);

    }

};


const formatDateTime = (value) => {

    if (!value) {
        return "-";
    }

    try {

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return new Intl.DateTimeFormat(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }
        ).format(date);

    } catch {

        return String(value);

    }

};
// ============================================================
// FORMAT CELL VALUE
// ============================================================

const formatCellValue = (key, record = {}) => {

    if (!record) {
        return "-";
    }

    const value = record[key];

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }

    const lowerKey =
        String(key).toLowerCase();

    // --------------------------------------------------------
    // AMOUNT
    // --------------------------------------------------------

    if (
        key === "amount" ||
        lowerKey === "transaction_amount"
    ) {
        return formatCurrency(value);
    }

    // --------------------------------------------------------
    // DATE / TIME
    // --------------------------------------------------------

    if (
        lowerKey.includes("created_at") ||
        lowerKey.includes("createdat") ||
        lowerKey.includes("updated_at") ||
        lowerKey.includes("updatedat") ||
        lowerKey.includes("completed_at") ||
        lowerKey.includes("completedat") ||
        lowerKey.includes("processed_at") ||
        lowerKey.includes("processedat") ||
        lowerKey.includes("settled_at") ||
        lowerKey.includes("settledat") ||
        lowerKey === "date" ||
        lowerKey.includes("datetime")
    ) {
        return formatDateTime(value);
    }

    // --------------------------------------------------------
    // PERCENTAGE
    // --------------------------------------------------------

    if (
        lowerKey.includes("percentage") ||
        lowerKey.includes("percent") ||
        lowerKey.includes("rate")
    ) {
        return formatPercent(value);
    }

    // --------------------------------------------------------
    // COUNT / INTEGER
    // --------------------------------------------------------

    if (
        lowerKey === "day" ||
        lowerKey === "rank" ||
        lowerKey.includes("count") ||
        lowerKey.includes("transactions")
    ) {
        return formatNumber(value);
    }

    // --------------------------------------------------------
    // OBJECT / ARRAY
    // --------------------------------------------------------

    if (
        typeof value === "object"
    ) {

        try {

            return JSON.stringify(
                value
            );

        } catch {

            return String(value);

        }

    }

    // --------------------------------------------------------
    // DEFAULT
    // --------------------------------------------------------

    return String(value);
};

const formatDateTimeFull = (value) => {

    if (!value) {
        return "-";
    }

    try {

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return new Intl.DateTimeFormat(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            }
        ).format(date);

    } catch {

        return String(value);

    }

};


const truncate = (
    value,
    maxLength = 30
) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }

    const text = String(value);

    if (text.length <= maxLength) {
        return text;
    }

    return `${text.substring(0, maxLength - 3)}...`;

};


const prettyLabel = (
    key = ""
) => {

    return String(key)
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();

};


// ============================================================
// IMPORTANT
// FIELDS THAT MUST NEVER APPEAR IN PDF
// ============================================================

const EXCLUDED_FIELDS = new Set([

    "gateway_fee",

    "gatewayFee",

    "fee",

    "fees",

    "tax",

    "gst",

    "gst_amount",

    "gstAmount",

    "total_fee",

    "totalFee",

    "net_amount",

    "netAmount",

    "commission",

    "commission_amount",

    "commissionAmount"

]);


// ============================================================
// REMOVE FINANCIAL FIELDS NOT REQUIRED IN PDF
// ============================================================

const cleanSummary = (
    summary = {}
) => {

    const cleaned = {};

    Object.entries(summary || {})
        .forEach(
            ([key, value]) => {

                if (
                    EXCLUDED_FIELDS.has(key)
                ) {
                    return;
                }

                const lowerKey =
                    String(key).toLowerCase();

                if (
                    lowerKey.includes("fee") ||
                    lowerKey.includes("tax") ||
                    lowerKey.includes("gst") ||
                    lowerKey.includes("commission")
                ) {
                    return;
                }

                cleaned[key] = value;

            }
        );

    return cleaned;

};


// ============================================================
// STATUS STYLE
// ============================================================

const getStatusStyle = (
    status
) => {

    const value =
        String(status || "UNKNOWN")
            .toUpperCase();

    if (
        [
            "SUCCESS",
            "SUCCESSFUL",
            "PAID",
            "SETTLED",
            "COMPLETED",
            "APPROVED",
            "PROCESSED"
        ].includes(value)
    ) {

        return {

            bg:
                COLORS.greenLight,

            text:
                COLORS.green,

            border:
                "#A6D9BA"

        };

    }

    if (
        [
            "FAILED",
            "REJECTED",
            "DECLINED",
            "CANCELLED",
            "ERROR"
        ].includes(value)
    ) {

        return {

            bg:
                COLORS.redLight,

            text:
                COLORS.red,

            border:
                "#F1AEB5"

        };

    }

    if (
        [
            "PENDING",
            "PROCESSING",
            "CREATED",
            "INITIATED",
            "AWAITING"
        ].includes(value)
    ) {

        return {

            bg:
                COLORS.orangeLight,

            text:
                COLORS.orange,

            border:
                "#EBCB84"

        };

    }

    if (
        [
            "REFUNDED",
            "REVERSED",
            "RETURNED"
        ].includes(value)
    ) {

        return {

            bg:
                COLORS.cyanLight,

            text:
                COLORS.cyan,

            border:
                "#9AD7DC"

        };

    }

    if (
        [
            "CHARGEBACK",
            "DISPUTED",
            "FRAUD"
        ].includes(value)
    ) {

        return {

            bg:
                COLORS.purpleLight,

            text:
                COLORS.purple,

            border:
                "#CFC1F4"

        };

    }

    return {

        bg:
            "#F2F4F7",

        text:
            COLORS.text,

        border:
            COLORS.border

    };

};


// ============================================================
// DRAW BOX
// ============================================================

const drawBox = (
    doc,
    x,
    y,
    width,
    height,
    fill,
    border = fill,
    radius = 5
) => {

    doc.save();

    doc
        .fillColor(fill)
        .strokeColor(border)
        .lineWidth(0.5)
        .roundedRect(
            x,
            y,
            width,
            height,
            radius
        )
        .fillAndStroke();

    doc.restore();

};


// ============================================================
// DRAW LINE
// ============================================================

const drawLine = (
    doc,
    x1,
    y1,
    x2,
    y2,
    color = COLORS.borderLight,
    width = 0.5
) => {

    doc.save();

    doc
        .strokeColor(color)
        .lineWidth(width)
        .moveTo(x1, y1)
        .lineTo(x2, y2)
        .stroke();

    doc.restore();

};


// ============================================================
// CREATE PDF DOCUMENT
// ============================================================

const createDocument = () => {

    return new PDFDocument({

        size:
            "A4",

        layout:
            "portrait",

        margins: {

            top:
                PAGE.TOP,

            left:
                PAGE.MARGIN,

            right:
                PAGE.MARGIN,

            bottom:
                PAGE.BOTTOM

        },

        autoFirstPage:
            true,

        bufferPages:
            true,

        info: {

            Title:
                "Payment Gateway Financial Report",

            Author:
                BANK_CONFIG.name,

            Subject:
                "Financial Transaction Report",

            Creator:
                "Payment Gateway Core API",

            Producer:
                "PDFKit"

        }

    });

};


// ============================================================
// CREATE WRITE STREAM
// ============================================================

const createWriteStream = (
    fileName = "financial_report"
) => {

    verifyExportDirectory();

    const cleanName =
        String(fileName)
            .replace(
                /[^a-zA-Z0-9_-]/g,
                "_"
            );

    const generatedFileName =
        `${cleanName}_${Date.now()}.pdf`;

    const filePath =
        path.join(
            EXPORT_PATH,
            generatedFileName
        );

    return {

        stream:
            fs.createWriteStream(
                filePath
            ),

        filePath,

        fileName:
            generatedFileName

    };

};


// ============================================================
// ADD PAGE
// ============================================================

const addPage = (
    doc
) => {

    doc.addPage({

        size:
            "A4",

        layout:
            "portrait",

        margins: {

            top:
                PAGE.TOP,

            left:
                PAGE.MARGIN,

            right:
                PAGE.MARGIN,

            bottom:
                PAGE.BOTTOM

        }

    });

    return PAGE.CONTENT_TOP;

};


// ============================================================
// DRAW HEADER
// ============================================================

const drawHeader = (
    doc,
    {
        title,
        reportDate,
        generatedBy,
        filters = {}
    }
) => {

    // ========================================================
    // TOP GOLD STRIPE
    // ========================================================

    doc
        .fillColor(COLORS.gold)
        .rect(
            0,
            0,
            PAGE.WIDTH,
            4
        )
        .fill();


    // ========================================================
    // TOP NAVY STRIPE
    // ========================================================

    doc
        .fillColor(COLORS.navy)
        .rect(
            0,
            4,
            PAGE.WIDTH,
            3
        )
        .fill();


    // ========================================================
    // LEFT BRAND
    // ========================================================

    const brandWidth = 300;

    doc
        .font(FONT.bold)
        .fontSize(15)
        .fillColor(COLORS.navy)
        .text(
            BANK_CONFIG.name,
            PAGE.MARGIN,
            26,
            {
                width:
                    brandWidth,

                lineBreak:
                    false
            }
        );


    doc
        .font(FONT.regular)
        .fontSize(7)
        .fillColor(COLORS.muted)
        .text(
            BANK_CONFIG.subtitle,
            PAGE.MARGIN,
            47,
            {
                width:
                    brandWidth,

                lineBreak:
                    false
            }
        );


    doc
        .font(FONT.regular)
        .fontSize(6)
        .fillColor(COLORS.lightText)
        .text(
            `IFSC: ${BANK_CONFIG.ifsc}  |  MICR: ${BANK_CONFIG.micr}`,
            PAGE.MARGIN,
            61,
            {
                width:
                    brandWidth,

                lineBreak:
                    false
            }
        );


    // ========================================================
    // RIGHT META BOX
    // ========================================================

    const metaWidth = 205;

    const metaX =
        PAGE.WIDTH -
        PAGE.MARGIN -
        metaWidth;

    const metaY = 23;

    const metaHeight = 58;

    drawBox(
        doc,
        metaX,
        metaY,
        metaWidth,
        metaHeight,
        COLORS.background,
        COLORS.borderLight,
        5
    );


    const reference =
        `PG-${Date.now()
            .toString()
            .slice(-8)}`;


    const metadata = [

        [
            "REFERENCE",
            reference
        ],

        [
            "REPORT DATE",
            formatDate(
                reportDate ||
                new Date()
            )
        ],

        [
            "GENERATED BY",
            generatedBy ||
            "ADMIN"
        ],

        [
            "GENERATED AT",
            formatDateTime(
                new Date()
            )
        ]

    ];


    let metadataY =
        metaY + 7;


    metadata.forEach(
        ([label, value]) => {

            doc
                .font(FONT.bold)
                .fontSize(5.8)
                .fillColor(COLORS.muted)
                .text(
                    label,
                    metaX + 8,
                    metadataY,
                    {
                        width:
                            70,

                        lineBreak:
                            false
                    }
                );


            doc
                .font(FONT.regular)
                .fontSize(5.8)
                .fillColor(COLORS.black)
                .text(
                    truncate(
                        value,
                        30
                    ),
                    metaX + 78,
                    metadataY,
                    {
                        width:
                            metaWidth - 86,

                        align:
                            "right",

                        lineBreak:
                            false
                    }
                );


            metadataY += 12;

        }
    );


    // ========================================================
    // REPORT TITLE
    // ========================================================

    let y =
        PAGE.CONTENT_TOP;


    doc
        .font(FONT.bold)
        .fontSize(14)
        .fillColor(COLORS.blue)
        .text(
            String(title || "")
                .toUpperCase(),
            PAGE.MARGIN,
            y,
            {
                width:
                    PAGE.WIDTH -
                    PAGE.MARGIN * 2,

                lineBreak:
                    false
            }
        );


    y += 20;


    drawLine(
        doc,
        PAGE.MARGIN,
        y,
        PAGE.WIDTH - PAGE.MARGIN,
        y,
        COLORS.gold,
        1.2
    );


    y += 12;


    // ========================================================
    // FILTERS
    // ========================================================

    const filterEntries =
        Object.entries(
            filters || {}
        ).filter(
            ([key, value]) => {

                if (
                    value === null ||
                    value === undefined ||
                    value === ""
                ) {
                    return false;
                }

                const lower =
                    String(key)
                        .toLowerCase();

                if (
                    lower.includes("fee") ||
                    lower.includes("tax") ||
                    lower.includes("gst")
                ) {
                    return false;
                }

                return true;

            }
        );


    if (
        filterEntries.length
    ) {

        doc
            .font(FONT.bold)
            .fontSize(6)
            .fillColor(COLORS.muted)
            .text(
                "APPLIED FILTERS",
                PAGE.MARGIN,
                y,
                {
                    lineBreak:
                        false
                }
            );


        y += 11;


        let x =
            PAGE.MARGIN;


        filterEntries.forEach(
            ([key, value]) => {

                let displayValue =
                    String(value);


                if (
                    key.toLowerCase()
                        .includes("date") &&
                    /^\d{4}-\d{2}-\d{2}$/
                        .test(displayValue)
                ) {

                    displayValue =
                        formatDate(
                            `${displayValue}T00:00:00`
                        );

                }


                const label =
                    `${prettyLabel(key)}: ${displayValue}`;


                const width =
                    Math.min(
                        175,
                        Math.max(
                            80,
                            label.length * 3.4 + 16
                        )
                    );


                if (
                    x + width >
                    PAGE.WIDTH -
                    PAGE.MARGIN
                ) {

                    x =
                        PAGE.MARGIN;

                    y += 20;

                }


                drawBox(
                    doc,
                    x,
                    y,
                    width,
                    16,
                    COLORS.blueLight,
                    COLORS.borderLight,
                    3
                );


                doc
                    .font(FONT.regular)
                    .fontSize(5.8)
                    .fillColor(COLORS.text)
                    .text(
                        truncate(
                            label,
                            40
                        ),
                        x + 7,
                        y + 5,
                        {
                            width:
                                width - 14,

                            lineBreak:
                                false
                        }
                    );


                x +=
                    width + 6;

            }
        );


        y += 25;


        drawLine(
            doc,
            PAGE.MARGIN,
            y,
            PAGE.WIDTH - PAGE.MARGIN,
            y,
            COLORS.borderLight
        );


        y += 10;

    }


    return y;

};


// ============================================================
// SUMMARY CARDS
// ============================================================

const drawSummaryCards = (
    doc,
    summary = {},
    startY
) => {

    const cleaned =
        cleanSummary(
            summary
        );


    const entries =
        Object.entries(
            cleaned
        ).filter(
            ([, value]) =>
                value !== null &&
                value !== undefined
        );


    if (!entries.length) {
        return startY;
    }


    let y =
        startY;


    // ========================================================
    // SECTION TITLE
    // ========================================================

    doc
        .fillColor(COLORS.gold)
        .rect(
            PAGE.MARGIN,
            y + 1,
            4,
            14
        )
        .fill();


    doc
        .font(FONT.bold)
        .fontSize(10)
        .fillColor(COLORS.navy)
        .text(
            "FINANCIAL SUMMARY",
            PAGE.MARGIN + 10,
            y,
            {
                lineBreak:
                    false
            }
        );


    y += 20;


    // ========================================================
    // CARD GRID
    // ========================================================

    const columns = 4;

    const gap = 7;

    const cardWidth =
        (
            PAGE.WIDTH -
            PAGE.MARGIN * 2 -
            gap * (columns - 1)
        ) /
        columns;

    const cardHeight = 49;


    entries.forEach(
        ([key, rawValue], index) => {

            const row =
                Math.floor(
                    index / columns
                );

            const col =
                index % columns;


            const x =
                PAGE.MARGIN +
                col *
                (
                    cardWidth +
                    gap
                );


            const cardY =
                y +
                row *
                (
                    cardHeight +
                    gap
                );


            const lowerKey =
                String(key)
                    .toLowerCase();


            let value;


            if (
                isPercentSummaryField(
                    key
                )
            ) {

                value =
                    formatPercent(
                        rawValue
                    );

            } else if (
                isCurrencySummaryField(
                    key
                )
            ) {

                value =
                    formatCurrency(
                        rawValue
                    );

            } else {

                value =
                    formatNumber(
                        rawValue
                    );

            }


            let valueColor =
                COLORS.navy;


            if (
                lowerKey.includes("success")
            ) {

                valueColor =
                    COLORS.green;

            }


            if (
                lowerKey.includes("failed") ||
                lowerKey.includes("chargeback")
            ) {

                valueColor =
                    COLORS.red;

            }


            if (
                lowerKey.includes("pending")
            ) {

                valueColor =
                    COLORS.orange;

            }


            if (
                lowerKey.includes("refund")
            ) {

                valueColor =
                    COLORS.cyan;

            }


            if (
                lowerKey.includes("revenue") ||
                lowerKey.includes("amount")
            ) {

                valueColor =
                    COLORS.blue;

            }


            drawBox(
                doc,
                x,
                cardY,
                cardWidth,
                cardHeight,
                COLORS.white,
                COLORS.borderLight,
                5
            );


            doc
                .fillColor(COLORS.gold)
                .rect(
                    x,
                    cardY,
                    3,
                    cardHeight
                )
                .fill();


            doc
                .font(FONT.bold)
                .fontSize(5.8)
                .fillColor(COLORS.muted)
                .text(
                    prettyLabel(key),
                    x + 9,
                    cardY + 8,
                    {
                        width:
                            cardWidth - 15,

                        lineBreak:
                            false
                    }
                );


            doc
                .font(FONT.bold)
                .fontSize(10.5)
                .fillColor(valueColor)
                .text(
                    truncate(
                        value,
                        21
                    ),
                    x + 9,
                    cardY + 26,
                    {
                        width:
                            cardWidth - 15,

                        lineBreak:
                            false
                    }
                );

        }
    );


    const rows =
        Math.ceil(
            entries.length /
            columns
        );


    return (
        y +
        rows *
        (
            cardHeight +
            gap
        ) +
        8
    );

};


// ============================================================
// SUMMARY FIELD FORMAT HELPERS
// ============================================================

const isPercentSummaryField = (
    key
) => {

    const lower =
        String(key)
            .toLowerCase();

    return (
        lower.includes("rate") ||
        lower.includes("percentage") ||
        lower.includes("percent")
    );

};


const isCurrencySummaryField = (
    key
) => {

    const lower =
        String(key)
            .toLowerCase();

    return (
        lower.includes("revenue") ||
        lower.includes("amount") ||
        lower.includes("balance") ||
        lower.includes("settled")
    );

};


// ============================================================
// SECTION TITLE
// ============================================================

const drawSectionTitle = (
    doc,
    title,
    startY
) => {

    let y =
        startY;


    if (
        y + 30 >
        PAGE.CONTENT_BOTTOM
    ) {

        addPage(
            doc
        );

        y =
            PAGE.CONTENT_TOP;

    }


    doc
        .fillColor(COLORS.gold)
        .rect(
            PAGE.MARGIN,
            y + 2,
            4,
            14
        )
        .fill();


    doc
        .font(FONT.bold)
        .fontSize(10)
        .fillColor(COLORS.navy)
        .text(
            title,
            PAGE.MARGIN + 10,
            y,
            {
                lineBreak:
                    false
            }
        );


    return y + 22;

};


// ============================================================
// TRANSACTION COLUMNS
// NO FEE COLUMNS
// ============================================================

const getTransactionColumns = (
    records = []
) => {

    if (!records.length) {
        return [];
    }


    const sample =
        records[0] || {};


    const columns = [];


    // ========================================================
    // TRANSACTION ID
    // ========================================================

    if (
        sample.transaction_id !== undefined ||
        sample.transactionId !== undefined
    ) {

        columns.push({

            key:
                sample.transaction_id !== undefined
                    ? "transaction_id"
                    : "transactionId",

            title:
                "TXN ID",

            width:
                45,

            align:
                "left"

        });

    }


    // ========================================================
    // MERCHANT
    // ========================================================

    if (
        sample.merchant_name !== undefined ||
        sample.merchantName !== undefined
    ) {

        columns.push({

            key:
                sample.merchant_name !== undefined
                    ? "merchant_name"
                    : "merchantName",

            title:
                "MERCHANT",

            width:
                70,

            align:
                "left"

        });

    }


    // ========================================================
    // ORDER ID
    // ========================================================

    if (
        sample.order_id !== undefined ||
        sample.orderId !== undefined
    ) {

        columns.push({

            key:
                sample.order_id !== undefined
                    ? "order_id"
                    : "orderId",

            title:
                "ORDER ID",

            width:
                94,

            align:
                "left"

        });

    }


    // ========================================================
    // AMOUNT
    // ========================================================

    if (
        sample.amount !== undefined
    ) {

        columns.push({

            key:
                "amount",

            title:
                "AMOUNT",

            width:
                67,

            align:
                "right"

        });

    }


    // ========================================================
    // PAYMENT METHOD
    // ========================================================

    if (
        sample.payment_method !== undefined ||
        sample.paymentMethod !== undefined
    ) {

        columns.push({

            key:
                sample.payment_method !== undefined
                    ? "payment_method"
                    : "paymentMethod",

            title:
                "METHOD",

            width:
                55,

            align:
                "left"

        });

    }


    // ========================================================
    // PAYMENT TYPE
    // ========================================================

    if (
        sample.payment_type !== undefined ||
        sample.paymentType !== undefined
    ) {

        columns.push({

            key:
                sample.payment_type !== undefined
                    ? "payment_type"
                    : "paymentType",

            title:
                "TYPE",

            width:
                50,

            align:
                "left"

        });

    }


    // ========================================================
    // STATUS
    // ========================================================

    if (
        sample.status !== undefined
    ) {

        columns.push({

            key:
                "status",

            title:
                "STATUS",

            width:
                68,

            align:
                "center"

        });

    }


    // ========================================================
    // DATE / TIME
    // ========================================================

    if (
        sample.created_at !== undefined ||
        sample.createdAt !== undefined
    ) {

        columns.push({

            key:
                sample.created_at !== undefined
                    ? "created_at"
                    : "createdAt",

            title:
                "DATE / TIME",

            width:
                88,

            align:
                "left"

        });

    }


    // ========================================================
    // FALLBACK
    // ========================================================

    if (!columns.length) {

        const keys =
            Object.keys(
                sample
            ).filter(
                key =>
                    !isExcludedField(
                        key
                    )
            );


        keys
            .slice(0, 8)
            .forEach(
                key => {

                    columns.push({

                        key,

                        title:
                            prettyLabel(key),

                        width:
                            60,

                        align:
                            "left"

                    });

                }
            );

    }


    // ========================================================
    // NORMALIZE WIDTH
    // ========================================================

    const availableWidth =
        PAGE.WIDTH -
        PAGE.MARGIN * 2;


    const totalWidth =
        columns.reduce(
            (
                total,
                column
            ) =>
                total +
                column.width,
            0
        );


    if (
        totalWidth !==
        availableWidth
    ) {

        const scale =
            availableWidth /
            totalWidth;


        columns.forEach(
            column => {

                column.width *=
                    scale;

            }
        );

    }


    return columns;

};


// ============================================================
// EXCLUDED FIELD CHECK
// ============================================================

const isExcludedField = (
    key = ""
) => {

    if (
        EXCLUDED_FIELDS.has(key)
    ) {
        return true;
    }


    const lower =
        String(key)
            .toLowerCase();


    return (
        lower.includes("fee") ||
        lower.includes("tax") ||
        lower.includes("gst") ||
        lower.includes("commission")
    );

};


// ============================================================
// DRAW STATUS BADGE
// ============================================================

const drawStatusBadge = (
    doc,
    status,
    x,
    y,
    width
) => {

    const value =
        String(
            status ||
            "UNKNOWN"
        )
        .toUpperCase();


    const style =
        getStatusStyle(
            value
        );


    const textWidth =
        doc.widthOfString(
            value,
            {
                font:
                    FONT.bold,

                size:
                    5.5
            }
        );


    const badgeWidth =
        Math.min(
            width,
            Math.max(
                43,
                textWidth + 12
            )
        );


    const badgeX =
        x +
        (
            width -
            badgeWidth
        ) /
        2;


    drawBox(
        doc,
        badgeX,
        y + 3,
        badgeWidth,
        16,
        style.bg,
        style.border,
        4
    );


    doc
        .font(FONT.bold)
        .fontSize(5.5)
        .fillColor(style.text)
        .text(
            value,
            badgeX + 4,
            y + 7,
            {
                width:
                    badgeWidth - 8,

                align:
                    "center",

                lineBreak:
                    false
            }
        );

};


// ============================================================
// DRAW TABLE HEADER
// ============================================================

const drawTableHeader = (
    doc,
    columns,
    y
) => {

    if (
        y +
        PAGE.TABLE_HEADER_HEIGHT >
        PAGE.CONTENT_BOTTOM
    ) {

        addPage(
            doc
        );

        y =
            PAGE.CONTENT_TOP;

    }


    drawBox(
        doc,
        PAGE.MARGIN,
        y,
        PAGE.WIDTH -
            PAGE.MARGIN * 2,
        PAGE.TABLE_HEADER_HEIGHT,
        COLORS.navy,
        COLORS.navy,
        4
    );


    let x =
        PAGE.MARGIN;


    columns.forEach(
        column => {

            doc
                .font(FONT.bold)
                .fontSize(5.8)
                .fillColor(COLORS.white)
                .text(
                    truncate(
                        column.title,
                        16
                    ),
                    x + 5,
                    y + 9,
                    {
                        width:
                            column.width - 10,

                        align:
                            column.align ===
                            "right"
                                ? "right"
                                : "left",

                        lineBreak:
                            false
                    }
                );


            x +=
                column.width;

        }
    );


    return (
        y +
        PAGE.TABLE_HEADER_HEIGHT
    );

};


// ============================================================
// DRAW TABLE ROW
// ============================================================

const drawTableRow = (
    doc,
    columns,
    record,
    index,
    y
) => {

    const rowHeight =
        PAGE.TABLE_ROW_HEIGHT;


    if (
        y + rowHeight >
        PAGE.CONTENT_BOTTOM
    ) {

        addPage(
            doc
        );

        y =
            PAGE.CONTENT_TOP;

        y =
            drawTableHeader(
                doc,
                columns,
                y
            );

    }


    // Alternating row

    if (
        index % 2 === 1
    ) {

        doc
            .fillColor(
                COLORS.rowAlt
            )
            .rect(
                PAGE.MARGIN,
                y,
                PAGE.WIDTH -
                    PAGE.MARGIN * 2,
                rowHeight
            )
            .fill();

    }


    let x =
        PAGE.MARGIN;


    columns.forEach(
        column => {

            const key =
                column.key;


            // Safety check:
            // never print excluded fields.

            if (
                isExcludedField(key)
            ) {
                return;
            }


            const value =
                record[key];


            if (
                key === "status"
            ) {

                drawStatusBadge(
                    doc,
                    value,
                    x,
                    y,
                    column.width
                );

            } else {

                const display =
                    formatCellValue(
                        key,
                        record
                    );


                const isAmount =
                    key === "amount";


                doc
                    .font(
                        isAmount
                            ? FONT.bold
                            : FONT.regular
                    )
                    .fontSize(5.8)
                    .fillColor(
                        isAmount
                            ? COLORS.blue
                            : COLORS.text
                    )
                    .text(
                        truncate(
                            display,
                            column.width > 75
                                ? 25
                                : 16
                        ),
                        x + 5,
                        y + 8,
                        {
                            width:
                                column.width - 10,

                            align:
                                column.align ||
                                "left",

                            lineBreak:
                                false
                        }
                    );

            }


            drawLine(
                doc,
                x,
                y,
                x,
                y + rowHeight,
                COLORS.borderLight,
                0.3
            );


            x +=
                column.width;

        }
    );


    drawLine(
        doc,
        PAGE.MARGIN,
        y + rowHeight,
        PAGE.WIDTH -
            PAGE.MARGIN,
        y + rowHeight,
        COLORS.borderLight,
        0.4
    );


    return (
        y +
        rowHeight
    );

};


// ============================================================
// TRANSACTION REGISTER
// ============================================================

const drawTransactionTable = (
    doc,
    {
        title =
            "TRANSACTION REGISTER",

        records = [],

        startY = PAGE.CONTENT_TOP
    }
) => {

    let y =
        drawSectionTitle(
            doc,
            title,
            startY
        );


    if (
        !Array.isArray(records) ||
        records.length === 0
    ) {

        drawBox(
            doc,
            PAGE.MARGIN,
            y,
            PAGE.WIDTH -
                PAGE.MARGIN * 2,
            42,
            COLORS.background,
            COLORS.borderLight,
            4
        );


        doc
            .font(FONT.italic)
            .fontSize(7)
            .fillColor(COLORS.muted)
            .text(
                "No transaction records found for the selected period.",
                PAGE.MARGIN,
                y + 15,
                {
                    width:
                        PAGE.WIDTH -
                        PAGE.MARGIN * 2,

                    align:
                        "center",

                    lineBreak:
                        false
                }
            );


        return y + 52;

    }


    doc
        .font(FONT.regular)
        .fontSize(6)
        .fillColor(COLORS.muted)
        .text(
            `${records.length} transaction(s)`,
            PAGE.WIDTH -
                PAGE.MARGIN -
                100,
            y - 16,
            {
                width:
                    100,

                align:
                    "right",

                lineBreak:
                    false
            }
        );


    const columns =
        getTransactionColumns(
            records
        );


    y =
        drawTableHeader(
            doc,
            columns,
            y
        );


    records.forEach(
        (
            record,
            index
        ) => {

            y =
                drawTableRow(
                    doc,
                    columns,
                    record,
                    index,
                    y
                );

        }
    );


    return y + 10;

};


// ============================================================
// RECONCILIATION
// NO FEE INFORMATION
// ============================================================

const drawReconciliation = (
    doc,
    records = [],
    startY
) => {

    if (
        !Array.isArray(records) ||
        !records.length
    ) {
        return startY;
    }


    let y =
        startY + 5;


    if (
        y + 88 >
        PAGE.CONTENT_BOTTOM
    ) {

        addPage(
            doc
        );

        y =
            PAGE.CONTENT_TOP;

    }


    let totalTransactionValue =
        0;

    let successfulRevenue =
        0;

    let successfulCount =
        0;

    let createdCount =
        0;

    let failedCount =
        0;

    let pendingCount =
        0;

    let refundedCount =
        0;

    let chargebackCount =
        0;


    records.forEach(
        record => {

            const amount =
                safeNumber(
                    record.amount
                );


            totalTransactionValue +=
                amount;


            const status =
                String(
                    record.status ||
                    ""
                )
                .toUpperCase();


            switch (status) {

                case "SUCCESS":

                case "SUCCESSFUL":

                    successfulCount++;

                    successfulRevenue +=
                        amount;

                    break;


                case "CREATED":

                case "INITIATED":

                    createdCount++;

                    break;


                case "FAILED":

                    failedCount++;

                    break;


                case "PENDING":

                case "PROCESSING":

                    pendingCount++;

                    break;


                case "REFUNDED":

                    refundedCount++;

                    break;


                case "CHARGEBACK":

                    chargebackCount++;

                    break;


                default:

                    break;

            }

        }
    );


    // ========================================================
    // RECONCILIATION BOX
    // ========================================================

    drawBox(
        doc,
        PAGE.MARGIN,
        y,
        PAGE.WIDTH -
            PAGE.MARGIN * 2,
        82,
        COLORS.navy,
        COLORS.navy,
        6
    );


    doc
        .fillColor(COLORS.gold)
        .rect(
            PAGE.MARGIN,
            y,
            4,
            82
        )
        .fill();


    doc
        .font(FONT.bold)
        .fontSize(8)
        .fillColor(COLORS.white)
        .text(
            "TRANSACTION RECONCILIATION",
            PAGE.MARGIN + 14,
            y + 10,
            {
                lineBreak:
                    false
            }
        );


    doc
        .font(FONT.regular)
        .fontSize(6)
        .fillColor("#D0D5DD")
        .text(
            `Records: ${records.length}`,
            PAGE.MARGIN + 14,
            y + 28,
            {
                lineBreak:
                    false
            }
        );


    doc
        .font(FONT.regular)
        .fontSize(6)
        .fillColor("#D0D5DD")
        .text(
            `Successful: ${successfulCount}`,
            PAGE.MARGIN + 14,
            y + 42,
            {
                lineBreak:
                    false
            }
        );


    doc
        .font(FONT.regular)
        .fontSize(6)
        .fillColor("#D0D5DD")
        .text(
            `Created: ${createdCount}`,
            PAGE.MARGIN + 95,
            y + 28,
            {
                lineBreak:
                    false
            }
        );


    doc
        .font(FONT.regular)
        .fontSize(6)
        .fillColor("#D0D5DD")
        .text(
            `Failed: ${failedCount}`,
            PAGE.MARGIN + 95,
            y + 42,
            {
                lineBreak:
                    false
            }
        );


    doc
        .font(FONT.regular)
        .fontSize(6)
        .fillColor("#D0D5DD")
        .text(
            `Pending: ${pendingCount}`,
            PAGE.MARGIN + 165,
            y + 28,
            {
                lineBreak:
                    false
            }
        );


    doc
        .font(FONT.regular)
        .fontSize(6)
        .fillColor("#D0D5DD")
        .text(
            `Refunded: ${refundedCount}`,
            PAGE.MARGIN + 165,
            y + 42,
            {
                lineBreak:
                    false
            }
        );


    doc
        .font(FONT.regular)
        .fontSize(6)
        .fillColor("#D0D5DD")
        .text(
            `Chargebacks: ${chargebackCount}`,
            PAGE.MARGIN + 245,
            y + 28,
            {
                lineBreak:
                    false
            }
        );


    // ========================================================
    // RIGHT SIDE AMOUNTS
    // ========================================================

    const rightX =
        PAGE.WIDTH -
        PAGE.MARGIN -
        175;


    doc
        .font(FONT.bold)
        .fontSize(6)
        .fillColor("#D0D5DD")
        .text(
            "TOTAL TRANSACTION VALUE",
            rightX,
            y + 10,
            {
                width:
                    165,

                align:
                    "right",

                lineBreak:
                    false
            }
        );


    doc
        .font(FONT.bold)
        .fontSize(10)
        .fillColor(COLORS.white)
        .text(
            formatCurrency(
                totalTransactionValue
            ),
            rightX,
            y + 22,
            {
                width:
                    165,

                align:
                    "right",

                lineBreak:
                    false
            }
        );


    doc
        .font(FONT.regular)
        .fontSize(6)
        .fillColor("#D0D5DD")
        .text(
            `Successful Revenue: ${formatCurrency(
                successfulRevenue
            )}`,
            rightX,
            y + 44,
            {
                width:
                    165,

                align:
                    "right",

                lineBreak:
                    false
            }
        );


    return y + 94;

};


// ============================================================
// SECURITY NOTICE
// ============================================================

const drawSecurityNotice = (
    doc,
    startY
) => {

    let y =
        startY;


    if (
        y + 48 >
        PAGE.CONTENT_BOTTOM
    ) {

        addPage(
            doc
        );

        y =
            PAGE.CONTENT_TOP;

    }


    drawBox(
        doc,
        PAGE.MARGIN,
        y,
        PAGE.WIDTH -
            PAGE.MARGIN * 2,
        40,
        COLORS.background,
        COLORS.borderLight,
        4
    );


    doc
        .font(FONT.bold)
        .fontSize(6)
        .fillColor(COLORS.navy)
        .text(
            "SECURITY & CONFIDENTIALITY NOTICE",
            PAGE.MARGIN + 10,
            y + 7,
            {
                lineBreak:
                    false
            }
        );


    doc
        .font(FONT.regular)
        .fontSize(5.8)
        .fillColor(COLORS.muted)
        .text(
            BANK_CONFIG.security,
            PAGE.MARGIN + 10,
            y + 21,
            {
                width:
                    PAGE.WIDTH -
                    PAGE.MARGIN * 2 -
                    20,

                lineBreak:
                    false
            }
        );


    return y + 50;

};


// ============================================================
// WATERMARK
// ============================================================

const drawWatermark = (
    doc
) => {

    doc.save();


    doc
        .rotate(
            -35,
            {
                origin: [
                    PAGE.WIDTH / 2,
                    PAGE.HEIGHT / 2
                ]
            }
        );


    doc
        .font(FONT.bold)
        .fontSize(54)
        .fillColor("#E8ECF2")
        .opacity(0.30)
        .text(
            "CONFIDENTIAL",
            115,
            385,
            {
                width:
                    365,

                align:
                    "center",

                lineBreak:
                    false
            }
        );


    doc.restore();

};


// ============================================================
// FOOTER
// ============================================================

const drawFooter = (
    doc,
    pageNumber,
    totalPages
) => {

    // Keep footer safely inside printable area.
    // DO NOT place it below PAGE.HEIGHT - PAGE.BOTTOM.

    const footerY =
        PAGE.HEIGHT -
        PAGE.BOTTOM -
        24;


    // --------------------------------------------------------
    // FOOTER LINE
    // --------------------------------------------------------

    drawLine(
        doc,
        PAGE.MARGIN,
        footerY,
        PAGE.WIDTH - PAGE.MARGIN,
        footerY,
        COLORS.borderLight,
        0.5
    );


    // --------------------------------------------------------
    // LEFT FOOTER
    // --------------------------------------------------------

    doc
        .font(FONT.regular)
        .fontSize(5.5)
        .fillColor(COLORS.muted)
        .text(
            BANK_CONFIG.footer,
            PAGE.MARGIN,
            footerY + 8,
            {
                width: 390,

                height: 8,

                lineBreak: false
            }
        );


    // --------------------------------------------------------
    // RIGHT PAGE NUMBER
    // --------------------------------------------------------

    doc
        .font(FONT.bold)
        .fontSize(6)
        .fillColor(COLORS.navy)
        .text(
            `PAGE ${pageNumber} OF ${totalPages}`,
            PAGE.WIDTH - PAGE.MARGIN - 90,
            footerY + 8,
            {
                width: 90,

                height: 8,

                align: "right",

                lineBreak: false
            }
        );
};


// ============================================================
// GENERIC DATA TABLE
// FOR MONTHLY ANALYTICS
// ============================================================

const drawDataTable = (
    doc,
    {
        title,
        headers = [],
        records = [],
        startY
    }
) => {

    if (
        !Array.isArray(records) ||
        !records.length
    ) {
        return startY;
    }


    let y =
        drawSectionTitle(
            doc,
            title,
            startY
        );


    const filteredHeaders =
        headers.filter(
            header =>
                !isExcludedField(
                    header.id ||
                    header.key
                )
        );


    if (
        !filteredHeaders.length
    ) {
        return y;
    }


    const availableWidth =
        PAGE.WIDTH -
        PAGE.MARGIN * 2;


    const equalWidth =
        availableWidth /
        filteredHeaders.length;


    const columns =
        filteredHeaders.map(
            header => {

                const key =
                    header.id ||
                    header.key;


                return {

                    key,

                    title:
                        header.title ||
                        prettyLabel(key),

                    width:
                        equalWidth,

                    align:
                        key === "day" ||
                        key === "rank"
                            ? "center"
                            : isCurrencySummaryField(key)
                                ? "right"
                                : "left"

                };

            }
        );


    y =
        drawTableHeader(
            doc,
            columns,
            y
        );


    records.forEach(
        (
            record,
            index
        ) => {

            y =
                drawTableRow(
                    doc,
                    columns,
                    record,
                    index,
                    y
                );

        }
    );


    return y + 10;

};


// ============================================================
// MONTHLY REVENUE TABLE
// ============================================================

const drawMonthlyRevenueChart = (
    doc,
    data = [],
    startY
) => {

    if (!data.length) {
        return startY;
    }


    return drawDataTable(
        doc,
        {

            title:
                "DAILY REVENUE SUMMARY",

            headers: [

                {
                    id:
                        "day",

                    title:
                        "DAY"
                },

                {
                    id:
                        "revenue",

                    title:
                        "REVENUE"
                },

                {
                    id:
                        "totalTransactions",

                    title:
                        "TRANSACTIONS"
                },

                {
                    id:
                        "successfulTransactions",

                    title:
                        "SUCCESS"
                }

            ],

            records:
                data,

            startY

        }
    );

};


// ============================================================
// MONTHLY TRANSACTION TABLE
// ============================================================

const drawMonthlyTransactionChart = (
    doc,
    data = [],
    startY
) => {

    if (!data.length) {
        return startY;
    }


    return drawDataTable(
        doc,
        {

            title:
                "DAILY TRANSACTION STATUS",

            headers: [

                {
                    id:
                        "day",

                    title:
                        "DAY"
                },

                {
                    id:
                        "totalTransactions",

                    title:
                        "TOTAL"
                },

                {
                    id:
                        "successful",

                    title:
                        "SUCCESS"
                },

                {
                    id:
                        "created",

                    title:
                        "CREATED"
                },

                {
                    id:
                        "failed",

                    title:
                        "FAILED"
                },

                {
                    id:
                        "pending",

                    title:
                        "PENDING"
                },

                {
                    id:
                        "refunded",

                    title:
                        "REFUNDED"
                },

                {
                    id:
                        "chargeback",

                    title:
                        "CHARGEBACK"
                }

            ],

            records:
                data,

            startY

        }
    );

};


// ============================================================
// MONTHLY REFUND TABLE
// ============================================================

const drawMonthlyRefundChart = (
    doc,
    data = [],
    startY
) => {

    if (!data.length) {
        return startY;
    }


    return drawDataTable(
        doc,
        {

            title:
                "DAILY REFUND SUMMARY",

            headers: [

                {
                    id:
                        "day",

                    title:
                        "DAY"
                },

                {
                    id:
                        "totalRefunds",

                    title:
                        "REFUNDS"
                },

                {
                    id:
                        "refundAmount",

                    title:
                        "REFUND AMOUNT"
                },

                {
                    id:
                        "totalDebitAmount",

                    title:
                        "TOTAL DEBIT"
                }

            ],

            records:
                data,

            startY

        }
    );

};


// ============================================================
// TOP MERCHANTS
// ============================================================

const drawTopMerchants = (
    doc,
    data = [],
    startY
) => {

    if (!data.length) {
        return startY;
    }


    return drawDataTable(
        doc,
        {

            title:
                "TOP MERCHANTS",

            headers: [

                {
                    id:
                        "rank",

                    title:
                        "RANK"
                },

                {
                    id:
                        "merchantName",

                    title:
                        "MERCHANT"
                },

                {
                    id:
                        "businessName",

                    title:
                        "BUSINESS"
                },

                {
                    id:
                        "merchantCode",

                    title:
                        "CODE"
                },

                {
                    id:
                        "totalTransactions",

                    title:
                        "TXN"
                },

                {
                    id:
                        "revenue",

                    title:
                        "REVENUE"
                }

            ],

            records:
                data,

            startY

        }
    );

};


// ============================================================
// MERCHANT PERFORMANCE
// ============================================================

const drawMerchantPerformance = (
    doc,
    data = [],
    startY
) => {

    if (!data.length) {
        return startY;
    }


    return drawDataTable(
        doc,
        {

            title:
                "MERCHANT PERFORMANCE",

            headers: [

                {
                    id:
                        "rank",

                    title:
                        "RANK"
                },

                {
                    id:
                        "merchantName",

                    title:
                        "MERCHANT"
                },

                {
                    id:
                        "totalTransactions",

                    title:
                        "TXN"
                },

                {
                    id:
                        "revenue",

                    title:
                        "REVENUE"
                },

                {
                    id:
                        "feePercentage",

                    title:
                        "PERCENTAGE"
                }

            ],

            records:
                data,

            startY

        }
    );

};


// ============================================================
// EXPORT PDF
// ============================================================

const exportPDF = async ({
    fileName =
        "financial_report",

    title =
        "Transaction Statement",

    summary = {},

    records = [],

    filters = {},

    generatedBy =
        "ADMIN",

    report = null,

    dashboard = null,

    reportType = null,

    merchantId = null

}) => {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            try {

                // =================================================
                // CREATE DOCUMENT
                // =================================================

                const doc =
                    createDocument();


                // =================================================
                // CREATE FILE
                // =================================================

                const {
                    stream,
                    filePath,
                    fileName:
                        generatedFileName
                } =
                    createWriteStream(
                        fileName
                    );


                doc.pipe(
                    stream
                );

                stream.on(
    "finish",
    () => {

        let size = 0;

        try {

            size =
                fs.statSync(
                    filePath
                ).size;

        } catch {

            size = 0;

        }

        resolve({

            success:
                true,

            fileName:
                generatedFileName,

            filePath,

            downloadPath:
                `/uploads/reports/admin/${generatedFileName}`,

            downloadUrl:
                `/uploads/reports/admin/${generatedFileName}`,

            size,

            pages:
                totalPages,

            generatedAt:
                new Date()

        });

    }
);


stream.on(
    "error",
    error => {

        reject(
            error
        );

    }
);

                // =================================================
                // HEADER
                // =================================================

                let currentY =
                    drawHeader(
                        doc,
                        {

                            title,

                            reportDate:
                                filters.date ||
                                filters.startDate ||
                                filters.endDate ||
                                new Date(),

                            generatedBy,

                            filters

                        }
                    );


                // =================================================
                // MONTHLY REPORT
                // =================================================

                if (
                    reportType ===
                    "MONTHLY" &&
                    report
                ) {

                    // Summary

                    currentY =
                        drawSummaryCards(
                            doc,
                            report.summary ||
                                {},
                            currentY
                        );


                    // Revenue

                    currentY =
                        drawMonthlyRevenueChart(
                            doc,
                            (
                                report.charts ||
                                {}
                            ).revenueChart ||
                            [],
                            currentY
                        );


                    // Transaction status

                    currentY =
                        drawMonthlyTransactionChart(
                            doc,
                            (
                                report.charts ||
                                {}
                            ).transactionChart ||
                            [],
                            currentY
                        );


                    // Refunds

                    currentY =
                        drawMonthlyRefundChart(
                            doc,
                            (
                                report.charts ||
                                {}
                            ).refundChart ||
                            [],
                            currentY
                        );


                    // Dashboard merchant data

                    if (
                        dashboard
                    ) {

                        currentY =
                            drawTopMerchants(
                                doc,
                                dashboard.topMerchants ||
                                [],
                                currentY
                            );


                        currentY =
                            drawMerchantPerformance(
                                doc,
                                dashboard.merchantPerformance ||
                                [],
                                currentY
                            );

                    }


                    // Transaction register

                    if (
                        Array.isArray(
                            records
                        ) &&
                        records.length
                    ) {

                        currentY =
                            drawTransactionTable(
                                doc,
                                {

                                    title:
                                        "TRANSACTION REGISTER",

                                    records,

                                    startY:
                                        currentY

                                }
                            );

                    }

                } else {

                    // =================================================
                    // DAILY / MERCHANT / OTHER REPORT
                    // =================================================

                    if (
                        summary &&
                        Object.keys(
                            summary
                        ).length
                    ) {

                        currentY =
                            drawSummaryCards(
                                doc,
                                summary,
                                currentY
                            );

                    }


                    if (
                        Array.isArray(
                            records
                        ) &&
                        records.length
                    ) {

                        currentY =
                            drawTransactionTable(
                                doc,
                                {

                                    title:
                                        "TRANSACTION REGISTER",

                                    records,

                                    startY:
                                        currentY

                                }
                            );

                    }

                }


                // =================================================
                // RECONCILIATION
                // =================================================

                if (
                    Array.isArray(
                        records
                    ) &&
                    records.length
                ) {

                    currentY =
                        drawReconciliation(
                            doc,
                            records,
                            currentY
                        );

                }


                // =================================================
                // SECURITY NOTICE
                // =================================================

                currentY =
                    drawSecurityNotice(
                        doc,
                        currentY
                    );


                // =================================================
                // IMPORTANT
                // GET FINAL PAGE COUNT BEFORE FOOTERS
                // =================================================

                const range =
                    doc.bufferedPageRange();


                const totalPages =
                    range.count;


                // =================================================
                // FOOTERS + WATERMARK
                // =================================================

                for (
                    let i = 0;
                    i < totalPages;
                    i++
                ) {

                    const pageIndex =
                        range.start + i;


                    doc.switchToPage(
                        pageIndex
                    );


                    drawWatermark(
                        doc
                    );


                    drawFooter(
                        doc,
                        i + 1,
                        totalPages
                    );

                }


                // =================================================
                // END PDF
                // =================================================

                doc.end();


                // =================================================
                // STREAM FINISH
                // =================================================

                stream.on(
                    "finish",
                    () => {

        let size = 0;

        try {

            size =
                fs.statSync(
                    filePath
                ).size;

        } catch {

            size = 0;

        }

        resolve({

            success:
                true,

            fileName:
                generatedFileName,

            filePath,

            downloadPath:
                `/uploads/reports/admin/${generatedFileName}`,

            downloadUrl:
                `/uploads/reports/admin/${generatedFileName}`,

            size,

            pages:
                totalPages,

            generatedAt:
                new Date()

        });

    }
);


                stream.on(
                    "error",
                    error => {

                        reject(
                            error
                        );

                    }
                );


            } catch (
                error
            ) {

                reject(
                    error
                );

            }

        }
    );

};


// ============================================================
// DELETE PDF
// ============================================================

const deleteExportedFile = async (
    filePath
) => {

    try {

        if (
            filePath &&
            fs.existsSync(
                filePath
            )
        ) {

            await fs.promises.unlink(
                filePath
            );

        }

    } catch (
        error
    ) {

        console.error(
            "Failed to delete PDF:",
            error.message
        );

    }

};


// ============================================================
// GET FILE DETAILS
// ============================================================

const getFileDetails = (
    filePath
) => {

    if (
        !filePath ||
        !fs.existsSync(
            filePath
        )
    ) {

        return null;

    }


    const stats =
        fs.statSync(
            filePath
        );


    return {

        filePath,

        size:
            stats.size,

        createdAt:
            stats.birthtime,

        modifiedAt:
            stats.mtime,

        isFile:
            stats.isFile()

    };

};


// ============================================================
// FORMAT FILE SIZE
// ============================================================

const formatFileSize = (
    bytes = 0
) => {

    if (
        bytes < 1024
    ) {

        return `${bytes} Bytes`;

    }


    if (
        bytes <
        1024 * 1024
    ) {

        return `${(
            bytes / 1024
        ).toFixed(2)} KB`;

    }


    if (
        bytes <
        1024 *
        1024 *
        1024
    ) {

        return `${(
            bytes /
            1024 /
            1024
        ).toFixed(2)} MB`;

    }


    return `${(
        bytes /
        1024 /
        1024 /
        1024
    ).toFixed(2)} GB`;

};


// ============================================================
// HEALTH CHECK
// ============================================================

const pdfHealthCheck = () => {

    return {

        success:
            true,

        engine:
            "PDFKit",

        exportDirectory:
            EXPORT_PATH,

        directoryExists:
            fs.existsSync(
                EXPORT_PATH
            ),

        timestamp:
            new Date()

    };

};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

    exportPDF,

    createDocument,

    createWriteStream,

    deleteExportedFile,

    getFileDetails,

    formatFileSize,

    verifyExportDirectory,

    pdfHealthCheck

};
