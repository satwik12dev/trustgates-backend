const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");


// ==========================================================
// TRUST GATES - PDF REPORT EXPORT
// ==========================================================


// ==========================================================
// EXPORT DIRECTORY
// ==========================================================

const EXPORT_PATH = path.join(
    process.cwd(),
    "uploads",
    "reports",
    "merchants"
);


const verifyExportDirectory = () => {

    if (!fs.existsSync(EXPORT_PATH)) {

        fs.mkdirSync(
            EXPORT_PATH,
            {
                recursive: true
            }
        );

    }

    return EXPORT_PATH;

};


verifyExportDirectory();


// ==========================================================
// PAGE CONFIGURATION
// ==========================================================

const PAGE = {

    SIZE: "A4",

    LAYOUT: "landscape",

    WIDTH: 842,

    HEIGHT: 595,

    MARGIN: 28,

    PRINTABLE_WIDTH: 786

};


const MAX_PAGE_Y =
    PAGE.HEIGHT -
    PAGE.MARGIN -
    30;


// ==========================================================
// TRUST GATES BRAND COLORS
// ==========================================================

const COLORS = {

    primary: "#0F2742",

    primaryLight: "#EAF2FF",

    blue: "#2563EB",

    blueLight: "#DBEAFE",

    dark: "#0F172A",

    text: "#334155",

    muted: "#64748B",

    border: "#E2E8F0",

    light: "#F8FAFC",

    white: "#FFFFFF",

    success: "#15803D",

    successBg: "#DCFCE7",

    pending: "#B45309",

    pendingBg: "#FEF3C7",

    authorized: "#1D4ED8",

    authorizedBg: "#DBEAFE",

    created: "#7C3AED",

    createdBg: "#EDE9FE",

    failed: "#B91C1C",

    failedBg: "#FEE2E2",

    cancelled: "#475569",

    cancelledBg: "#F1F5F9",

    refunded: "#0369A1",

    refundedBg: "#E0F2FE",

    chargeback: "#9F1239",

    chargebackBg: "#FFE4E6"

};


// ==========================================================
// FONTS
// ==========================================================

const FONT = {

    regular: "Helvetica",

    bold: "Helvetica-Bold",

    italic: "Helvetica-Oblique"

};


// ==========================================================
// FONT SIZES
// ==========================================================

const FONT_SIZE = {

    title: 18,

    subtitle: 8,

    heading: 9,

    body: 7,

    small: 6.5,

    tiny: 5.5

};


// ==========================================================
// FORMAT CURRENCY
// ==========================================================

const formatCurrency = (
    amount = 0
) => {

    const value =
        Number(amount) || 0;

    return `Rs. ${value.toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}`;

};


// ==========================================================
// FORMAT DATE
// ==========================================================

const formatDate = (
    value
) => {

    if (!value) {

        return "-";

    }

    try {

        return new Intl.DateTimeFormat(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        ).format(
            new Date(value)
        );

    } catch {

        return String(value);

    }

};


// ==========================================================
// FORMAT DATE TIME
// ==========================================================

const formatDateTime = (
    value
) => {

    if (!value) {

        return "-";

    }

    try {

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
        ).format(
            new Date(value)
        );

    } catch {

        return String(value);

    }

};


// ==========================================================
// TEXT TRUNCATION
// ==========================================================

const truncateText = (
    value,
    maxLength = 22
) => {

    const text =
        String(
            value ?? "-"
        );

    if (
        text.length <= maxLength
    ) {

        return text;

    }

    return (
        text.substring(
            0,
            maxLength - 3
        ) +
        "..."
    );

};


// ==========================================================
// DRAW LINE
// ==========================================================

const drawLine = (
    doc,
    x1,
    y1,
    x2,
    y2,
    color = COLORS.border,
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


// ==========================================================
// DRAW BOX
// ==========================================================

const drawBox = (
    doc,
    x,
    y,
    width,
    height,
    fill = COLORS.white,
    border = COLORS.border,
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


// ==========================================================
// STATUS STYLE
// ==========================================================

const getStatusStyle = (
    status
) => {

    const value =
        String(
            status || ""
        ).toUpperCase();


    switch (value) {

        case "SUCCESS":

            return {

                bg:
                    COLORS.successBg,

                text:
                    COLORS.success

            };


        case "PENDING":

            return {

                bg:
                    COLORS.pendingBg,

                text:
                    COLORS.pending

            };


        case "AUTHORIZED":

            return {

                bg:
                    COLORS.authorizedBg,

                text:
                    COLORS.authorized

            };


        case "CREATED":

            return {

                bg:
                    COLORS.createdBg,

                text:
                    COLORS.created

            };


        case "FAILED":

            return {

                bg:
                    COLORS.failedBg,

                text:
                    COLORS.failed

            };


        case "CANCELLED":

            return {

                bg:
                    COLORS.cancelledBg,

                text:
                    COLORS.cancelled

            };


        case "REFUNDED":

            return {

                bg:
                    COLORS.refundedBg,

                text:
                    COLORS.refunded

            };


        case "PARTIALLY_REFUNDED":

            return {

                bg:
                    COLORS.refundedBg,

                text:
                    COLORS.refunded

            };


        case "CHARGEBACK":

            return {

                bg:
                    COLORS.chargebackBg,

                text:
                    COLORS.chargeback

            };


        default:

            return {

                bg:
                    COLORS.cancelledBg,

                text:
                    COLORS.cancelled

            };

    }

};


// ==========================================================
// STATUS BADGE
// ==========================================================

const drawStatusBadge = (
    doc,
    status,
    x,
    y,
    width
) => {

    const value =
        String(
            status || "-"
        ).toUpperCase();


    const style =
        getStatusStyle(
            value
        );


    const badgeWidth =
        Math.min(
            width - 8,
            Math.max(
                50,
                value.length * 4.7 + 12
            )
        );


    const badgeHeight =
        12;


    const badgeX =
        x +
        (
            width -
            badgeWidth
        ) /
        2;


    doc.save();

    doc
        .fillColor(
            style.bg
        )
        .roundedRect(
            badgeX,
            y + 2,
            badgeWidth,
            badgeHeight,
            3
        )
        .fill();

    doc.restore();


    doc
        .font(FONT.bold)
        .fontSize(FONT_SIZE.tiny)
        .fillColor(style.text)
        .text(
            value,
            badgeX,
            y + 4.5,
            {
                width:
                    badgeWidth,

                align:
                    "center",

                lineBreak:
                    false
            }
        );

};


// ==========================================================
// CREATE DOCUMENT
// ==========================================================

const createDocument = () => {

    return new PDFDocument({

        size:
            PAGE.SIZE,

        layout:
            PAGE.LAYOUT,

        margins: {

            top:
                PAGE.MARGIN,

            left:
                PAGE.MARGIN,

            right:
                PAGE.MARGIN,

            bottom:
                PAGE.MARGIN

        },

        bufferPages:
            true,

        info: {

            Title:
                "Trust Gates Merchant Transaction Report",

            Author:
                "Trust Gates",

            Subject:
                "Merchant Transaction Report",

            Creator:
                "Trust Gates Payment Gateway"

        }

    });

};


// ==========================================================
// CREATE WRITE STREAM
// ==========================================================

const createWriteStream = (
    fileName
) => {

    verifyExportDirectory();


    const timestamp =
        Date.now();


    const cleanName =
        String(fileName)
            .replace(
                /[^a-zA-Z0-9_-]/g,
                "_"
            );


    const finalFileName =
        `${cleanName}_${timestamp}.pdf`;


    const filePath =
        path.join(
            EXPORT_PATH,
            finalFileName
        );


    const stream =
        fs.createWriteStream(
            filePath
        );


    return {

        stream,

        filePath,

        fileName:
            finalFileName

    };

};


// ==========================================================
// HEADER
// ==========================================================

const drawHeader = (
    doc,
    {
        title,
        filters = {},
        generatedBy
    }
) => {

    let y =
        PAGE.MARGIN;


    // ======================================================
    // BRAND BAR
    // ======================================================

    doc
        .fillColor(
            COLORS.primary
        )
        .rect(
            PAGE.MARGIN,
            y,
            PAGE.PRINTABLE_WIDTH,
            4
        )
        .fill();


    y += 12;


    // ======================================================
    // BRAND
    // ======================================================

    doc
        .font(FONT.bold)
        .fontSize(FONT_SIZE.title)
        .fillColor(COLORS.primary)
        .text(
            "TRUST GATES",
            PAGE.MARGIN,
            y,
            {
                lineBreak:
                    false
            }
        );


    doc
        .font(FONT.regular)
        .fontSize(FONT_SIZE.subtitle)
        .fillColor(COLORS.muted)
        .text(
            "PAYMENT GATEWAY",
            PAGE.MARGIN,
            y + 21,
            {
                lineBreak:
                    false
            }
        );


    // ======================================================
    // REPORT TITLE
    // ======================================================

    doc
        .font(FONT.bold)
        .fontSize(11)
        .fillColor(COLORS.dark)
        .text(
            title || "Merchant Transaction Report",
            PAGE.MARGIN,
            y + 35,
            {
                lineBreak:
                    false
            }
        );


    // ======================================================
    // REPORT INFO BOX
    // ======================================================

    const infoWidth =
        250;


    const infoX =
        PAGE.WIDTH -
        PAGE.MARGIN -
        infoWidth;


    drawBox(
        doc,
        infoX,
        y - 2,
        infoWidth,
        61,
        COLORS.light,
        COLORS.border,
        5
    );


    let infoY =
        y + 5;


    const drawInfo = (
        label,
        value
    ) => {

        doc
            .font(FONT.bold)
            .fontSize(FONT_SIZE.tiny)
            .fillColor(COLORS.muted)
            .text(
                label,
                infoX + 8,
                infoY,
                {
                    width:
                        82,

                    lineBreak:
                        false
                }
            );


        doc
            .font(FONT.regular)
            .fontSize(FONT_SIZE.tiny)
            .fillColor(COLORS.dark)
            .text(
                String(
                    value ?? "-"
                ),
                infoX + 90,
                infoY,
                {
                    width:
                        150,

                    align:
                        "right",

                    lineBreak:
                        false
                }
            );


        infoY += 11;

    };


    drawInfo(
        "Report",
        title
    );


    if (
        filters.date
    ) {

        drawInfo(
            "Date",
            formatDate(
                filters.date
            )
        );

    } else {

        drawInfo(
            "Period",
            `${filters.month || "-"} / ${filters.year || "-"}`
        );

    }


    drawInfo(
        "Generated By",
        generatedBy || "MERCHANT"
    );


    drawInfo(
        "Generated At",
        formatDateTime(
            new Date()
        )
    );


    y += 73;


    // ======================================================
    // SEPARATOR
    // ======================================================

    drawLine(
        doc,
        PAGE.MARGIN,
        y,
        PAGE.WIDTH - PAGE.MARGIN,
        y,
        COLORS.border,
        0.7
    );


    y += 10;


    // ======================================================
    // FILTERS
    // ======================================================

    const filterEntries =
        Object.entries(
            filters
        ).filter(
            ([key, value]) =>
                key !== "reportType" &&
                value !== undefined &&
                value !== null &&
                value !== ""
        );


    if (
        filterEntries.length > 0
    ) {

        doc
            .font(FONT.bold)
            .fontSize(FONT_SIZE.small)
            .fillColor(COLORS.muted)
            .text(
                "REPORT FILTERS",
                PAGE.MARGIN,
                y,
                {
                    lineBreak:
                        false
                }
            );


        y += 10;


        let x =
            PAGE.MARGIN;


        filterEntries.forEach(
            ([key, value]) => {

                const text =
                    `${key.toUpperCase()}: ${value}`;


                const width =
                    Math.min(
                        180,
                        doc.widthOfString(
                            text,
                            {
                                font:
                                    FONT.bold,

                                size:
                                    FONT_SIZE.tiny
                            }
                        ) + 16
                    );


                if (
                    x + width >
                    PAGE.WIDTH -
                    PAGE.MARGIN
                ) {

                    x =
                        PAGE.MARGIN;

                    y += 18;

                }


                drawBox(
                    doc,
                    x,
                    y,
                    width,
                    14,
                    COLORS.light,
                    COLORS.border,
                    3
                );


                doc
                    .font(FONT.bold)
                    .fontSize(FONT_SIZE.tiny)
                    .fillColor(COLORS.dark)
                    .text(
                        text,
                        x + 7,
                        y + 4,
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


        y += 23;

    }


    return y;

};


// ==========================================================
// SUMMARY CARD DEFINITIONS
// ==========================================================

const getSummaryCards = (
    summary
) => {

    return [

        {
            label:
                "TOTAL TRANSACTIONS",

            value:
                summary.totalTransactions || 0,

            amount:
                summary.totalAmount || 0,

            color:
                COLORS.blue,

            bg:
                COLORS.blueLight
        },


        {
            label:
                "SUCCESSFUL",

            value:
                summary.successfulTransactions || 0,

            amount:
                summary.successfulAmount || 0,

            color:
                COLORS.success,

            bg:
                COLORS.successBg
        },


        {
            label:
                "PENDING",

            value:
                summary.pendingTransactions || 0,

            amount:
                summary.pendingAmount || 0,

            color:
                COLORS.pending,

            bg:
                COLORS.pendingBg
        },


        {
            label:
                "AUTHORIZED",

            value:
                summary.authorizedTransactions || 0,

            amount:
                summary.authorizedAmount || 0,

            color:
                COLORS.authorized,

            bg:
                COLORS.authorizedBg
        },


        {
            label:
                "CREATED",

            value:
                summary.createdTransactions || 0,

            amount:
                summary.createdAmount || 0,

            color:
                COLORS.created,

            bg:
                COLORS.createdBg
        },


        {
            label:
                "FAILED",

            value:
                summary.failedTransactions || 0,

            amount:
                summary.failedAmount || 0,

            color:
                COLORS.failed,

            bg:
                COLORS.failedBg
        },


        {
            label:
                "CANCELLED",

            value:
                summary.cancelledTransactions || 0,

            amount:
                summary.cancelledAmount || 0,

            color:
                COLORS.cancelled,

            bg:
                COLORS.cancelledBg
        },


        {
            label:
                "REFUNDED",

            value:
                summary.refundedTransactions || 0,

            amount:
                summary.refundedAmount || 0,

            color:
                COLORS.refunded,

            bg:
                COLORS.refundedBg
        },


        {
            label:
                "PARTIALLY REFUNDED",

            value:
                summary.partiallyRefundedTransactions || 0,

            amount:
                summary.partiallyRefundedAmount || 0,

            color:
                COLORS.refunded,

            bg:
                COLORS.refundedBg
        },


        {
            label:
                "CHARGEBACK",

            value:
                summary.chargebackTransactions || 0,

            amount:
                summary.chargebackAmount || 0,

            color:
                COLORS.chargeback,

            bg:
                COLORS.chargebackBg
        }

    ];

};


// ==========================================================
// SUMMARY CARDS
// ==========================================================

const drawSummary = (
    doc,
    summary,
    startY
) => {

    doc
        .font(FONT.bold)
        .fontSize(FONT_SIZE.heading)
        .fillColor(COLORS.primary)
        .text(
            "REPORT SUMMARY",
            PAGE.MARGIN,
            startY,
            {
                lineBreak:
                    false
            }
        );


    startY += 13;


    const cards =
        getSummaryCards(
            summary
        );


    const gap =
        6;


    const cardsPerRow =
        5;


    const cardWidth =
        (
            PAGE.PRINTABLE_WIDTH -
            gap *
            (
                cardsPerRow - 1
            )
        ) /
        cardsPerRow;


    const cardHeight =
        48;


    let x =
        PAGE.MARGIN;


    let y =
        startY;


    cards.forEach(
        (
            card,
            index
        ) => {

            if (
                index > 0 &&
                index %
                cardsPerRow === 0
            ) {

                x =
                    PAGE.MARGIN;

                y +=
                    cardHeight +
                    gap;

            }


            // ==============================================
            // CARD
            // ==============================================

            drawBox(
                doc,
                x,
                y,
                cardWidth,
                cardHeight,
                COLORS.white,
                COLORS.border,
                5
            );


            // ==============================================
            // TOP ACCENT
            // ==============================================

            doc
                .fillColor(
                    card.color
                )
                .rect(
                    x,
                    y,
                    cardWidth,
                    3
                )
                .fill();


            // ==============================================
            // LABEL
            // ==============================================

            doc
                .font(FONT.bold)
                .fontSize(FONT_SIZE.tiny)
                .fillColor(COLORS.muted)
                .text(
                    card.label,
                    x + 7,
                    y + 8,
                    {
                        width:
                            cardWidth - 14,

                        lineBreak:
                            false
                    }
                );


            // ==============================================
            // TRANSACTION COUNT
            // ==============================================

            doc
                .font(FONT.bold)
                .fontSize(12)
                .fillColor(
                    card.color
                )
                .text(
                    String(
                        card.value
                    ),
                    x + 7,
                    y + 20,
                    {
                        width:
                            cardWidth - 14,

                        lineBreak:
                            false
                    }
                );


            // ==============================================
            // AMOUNT
            // ==============================================

            doc
                .font(FONT.regular)
                .fontSize(FONT_SIZE.tiny)
                .fillColor(COLORS.text)
                .text(
                    formatCurrency(
                        card.amount
                    ),
                    x + 7,
                    y + 35,
                    {
                        width:
                            cardWidth - 14,

                        lineBreak:
                            false
                    }
                );


            x +=
                cardWidth +
                gap;

        }
    );


    return (
        y +
        cardHeight +
        14
    );

};


// ==========================================================
// TABLE COLUMNS
// ==========================================================

const TABLE_COLUMNS = [

    {
        key:
            "transaction_ref",

        title:
            "TRANSACTION REF",

        width:
            125,

        align:
            "left"
    },


    {
        key:
            "order_id",

        title:
            "ORDER ID",

        width:
            105,

        align:
            "left"
    },


    {
        key:
            "customer_name",

        title:
            "CUSTOMER",

        width:
            95,

        align:
            "left"
    },


    {
        key:
            "amount",

        title:
            "AMOUNT",

        width:
            75,

        align:
            "right"
    },


    {
        key:
            "payment_method",

        title:
            "METHOD",

        width:
            65,

        align:
            "center"
    },


    {
        key:
            "gateway_name",

        title:
            "GATEWAY",

        width:
            75,

        align:
            "center"
    },


    {
        key:
            "status",

        title:
            "STATUS",

        width:
            70,

        align:
            "center"
    },


    {
        key:
            "settlement_status",

        title:
            "SETTLEMENT",

        width:
            80,

        align:
            "center"
    },


    {
        key:
            "created_at",

        title:
            "DATE & TIME",

        width:
            96,

        align:
            "center"
    }

];


// ==========================================================
// TABLE HEADER
// ==========================================================

const drawTableHeader = (
    doc,
    y
) => {

    const height =
        21;


    doc
        .fillColor(
            COLORS.primary
        )
        .roundedRect(
            PAGE.MARGIN,
            y,
            PAGE.PRINTABLE_WIDTH,
            height,
            3
        )
        .fill();


    let x =
        PAGE.MARGIN;


    TABLE_COLUMNS.forEach(
        (
            column,
            index
        ) => {

            doc
                .font(FONT.bold)
                .fontSize(FONT_SIZE.tiny)
                .fillColor(
                    COLORS.white
                )
                .text(
                    column.title,
                    x + 4,
                    y + 7,
                    {
                        width:
                            column.width - 8,

                        align:
                            column.align,

                        lineBreak:
                            false
                    }
                );


            if (
                index <
                TABLE_COLUMNS.length - 1
            ) {

                drawLine(
                    doc,
                    x + column.width,
                    y + 3,
                    x + column.width,
                    y + height - 3,
                    "#334155",
                    0.4
                );

            }


            x +=
                column.width;

        }
    );


    return y + height;

};


// ==========================================================
// TABLE CELL VALUE
// ==========================================================

const getCellValue = (
    record,
    key
) => {

    const value =
        record?.[key];


    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "-";

    }


    if (
        key === "amount"
    ) {

        return formatCurrency(
            value
        );

    }


    if (
        key === "created_at"
    ) {

        return formatDateTime(
            value
        );

    }


    return String(
        value
    );

};


// ==========================================================
// TABLE ROW
// ==========================================================

const drawTableRow = (
    doc,
    record,
    index,
    y
) => {

    const height =
        21;


    // ======================================================
    // ALTERNATE ROW
    // ======================================================

    if (
        index % 2 === 1
    ) {

        doc
            .fillColor(
                COLORS.light
            )
            .rect(
                PAGE.MARGIN,
                y,
                PAGE.PRINTABLE_WIDTH,
                height
            )
            .fill();

    }


    let x =
        PAGE.MARGIN;


    TABLE_COLUMNS.forEach(
        (
            column,
            columnIndex
        ) => {

            // ==============================================
            // STATUS
            // ==============================================

            if (
                column.key === "status"
            ) {

                drawStatusBadge(
                    doc,
                    record.status,
                    x,
                    y,
                    column.width
                );

            } else {

                let value =
                    getCellValue(
                        record,
                        column.key
                    );


                const maxLength =
                    column.key ===
                        "transaction_ref"
                        ? 20
                        : column.key ===
                            "order_id"
                            ? 17
                            : column.key ===
                                "customer_name"
                                ? 15
                                : 18;


                value =
                    truncateText(
                        value,
                        maxLength
                    );


                doc
                    .font(
                        column.key ===
                            "amount"
                            ? FONT.bold
                            : FONT.regular
                    )
                    .fontSize(
                        FONT_SIZE.body
                    )
                    .fillColor(
                        COLORS.text
                    )
                    .text(
                        value,
                        x + 4,
                        y + 6,
                        {
                            width:
                                column.width - 8,

                            align:
                                column.align,

                            lineBreak:
                                false
                        }
                    );

            }


            // ==============================================
            // COLUMN BORDER
            // ==============================================

            if (
                columnIndex <
                TABLE_COLUMNS.length - 1
            ) {

                drawLine(
                    doc,
                    x + column.width,
                    y,
                    x + column.width,
                    y + height,
                    COLORS.border,
                    0.35
                );

            }


            // ==============================================
            // ROW BORDER
            // ==============================================

            drawLine(
                doc,
                x,
                y + height,
                x + column.width,
                y + height,
                COLORS.border,
                0.35
            );


            x +=
                column.width;

        }
    );


    return y + height;

};


// ==========================================================
// TABLE TOTALS
// ==========================================================

const drawTableTotals = (
    doc,
    records,
    y
) => {

    const totalAmount =
        records.reduce(
            (
                total,
                record
            ) =>
                total +
                (
                    Number(
                        record?.amount
                    ) || 0
                ),
            0
        );


    const height =
        29;


    drawBox(
        doc,
        PAGE.MARGIN,
        y,
        PAGE.PRINTABLE_WIDTH,
        height,
        COLORS.primaryLight,
        COLORS.primary,
        4
    );


    doc
        .font(FONT.bold)
        .fontSize(FONT_SIZE.small)
        .fillColor(
            COLORS.primary
        )
        .text(
            `TOTAL RECORDS: ${records.length}`,
            PAGE.MARGIN + 8,
            y + 10,
            {
                lineBreak:
                    false
            }
        );


    doc
        .font(FONT.bold)
        .fontSize(8)
        .fillColor(
            COLORS.primary
        )
        .text(
            `TOTAL AMOUNT: ${formatCurrency(
                totalAmount
            )}`,
            PAGE.WIDTH -
                PAGE.MARGIN -
                230,
            y + 9,
            {
                width:
                    220,

                align:
                    "right",

                lineBreak:
                    false
            }
        );


    return y + height + 8;

};


// ==========================================================
// TRANSACTION TABLE
// ==========================================================

const drawTransactionTable = (
    doc,
    records,
    startY
) => {

    doc
        .font(FONT.bold)
        .fontSize(FONT_SIZE.heading)
        .fillColor(
            COLORS.primary
        )
        .text(
            "TRANSACTION DETAILS",
            PAGE.MARGIN,
            startY,
            {
                lineBreak:
                    false
            }
        );


    startY += 12;


    let currentY =
        drawTableHeader(
            doc,
            startY
        );


    // ======================================================
    // EMPTY STATE
    // ======================================================

    if (
        !records ||
        records.length === 0
    ) {

        drawBox(
            doc,
            PAGE.MARGIN,
            currentY + 8,
            PAGE.PRINTABLE_WIDTH,
            42,
            COLORS.light,
            COLORS.border,
            5
        );


        doc
            .font(FONT.bold)
            .fontSize(8)
            .fillColor(
                COLORS.primary
            )
            .text(
                "No transactions found",
                PAGE.MARGIN,
                currentY + 19,
                {
                    width:
                        PAGE.PRINTABLE_WIDTH,

                    align:
                        "center",

                    lineBreak:
                        false
                }
            );


        doc
            .font(FONT.regular)
            .fontSize(FONT_SIZE.tiny)
            .fillColor(
                COLORS.muted
            )
            .text(
                "There are no transaction records for the selected report period.",
                PAGE.MARGIN,
                currentY + 31,
                {
                    width:
                        PAGE.PRINTABLE_WIDTH,

                    align:
                        "center",

                    lineBreak:
                        false
                }
            );


        return currentY + 58;

    }


    // ======================================================
    // RECORDS
    // ======================================================

    records.forEach(
        (
            record,
            index
        ) => {

            if (
                currentY + 21 >
                MAX_PAGE_Y
            ) {

                doc.addPage();


                currentY =
                    drawTableHeader(
                        doc,
                        PAGE.MARGIN
                    );

            }


            currentY =
                drawTableRow(
                    doc,
                    record,
                    index,
                    currentY
                );

        }
    );


    // ======================================================
    // TOTALS
    // ======================================================

    if (
        currentY + 38 >
        MAX_PAGE_Y
    ) {

        doc.addPage();

        currentY =
            PAGE.MARGIN;

    }


    currentY =
        drawTableTotals(
            doc,
            records,
            currentY
        );


    return currentY;

};


// ==========================================================
// FOOTER
// ==========================================================

const drawFooter = (
    doc
) => {

    const pages =
        doc.bufferedPageRange();


    for (
        let index = 0;
        index < pages.count;
        index++
    ) {

        doc.switchToPage(
            index
        );


        const y =
            PAGE.HEIGHT -
            22;


        drawLine(
            doc,
            PAGE.MARGIN,
            y - 5,
            PAGE.WIDTH - PAGE.MARGIN,
            y - 5,
            COLORS.border,
            0.5
        );


        doc
            .font(FONT.bold)
            .fontSize(FONT_SIZE.tiny)
            .fillColor(
                COLORS.primary
            )
            .text(
                "TRUST GATES",
                PAGE.MARGIN,
                y,
                {
                    lineBreak:
                        false
                }
            );


        doc
            .font(FONT.regular)
            .fontSize(FONT_SIZE.tiny)
            .fillColor(
                COLORS.muted
            )
            .text(
                " | Merchant Report | Confidential",
                PAGE.MARGIN + 58,
                y,
                {
                    lineBreak:
                        false
                }
            );


        doc
            .font(FONT.bold)
            .fontSize(FONT_SIZE.tiny)
            .fillColor(
                COLORS.muted
            )
            .text(
                `Page ${index + 1} of ${pages.count}`,
                PAGE.WIDTH -
                    PAGE.MARGIN -
                    90,
                y,
                {
                    width:
                        90,

                    align:
                        "right",

                    lineBreak:
                        false
                }
            );

    }

};


// ==========================================================
// WATERMARK
// ==========================================================

const drawWatermark = (
    doc
) => {

    const pages =
        doc.bufferedPageRange();


    for (
        let index = 0;
        index < pages.count;
        index++
    ) {

        doc.switchToPage(
            index
        );


        doc.save();


        doc.rotate(
            -25,
            {
                origin: [
                    PAGE.WIDTH / 2,
                    PAGE.HEIGHT / 2
                ]
            }
        );


        doc
            .font(FONT.bold)
            .fontSize(68)
            .fillColor(
                COLORS.primary
            )
            .fillOpacity(
                0.025
            )
            .text(
                "TRUST GATES",
                120,
                250,
                {
                    width:
                        600,

                    align:
                        "center",

                    lineBreak:
                        false
                }
            );


        doc.restore();

    }

};


// ==========================================================
// MAIN PDF EXPORT
// ==========================================================

const exportPDF = async ({
    fileName =
        "trust_gates_merchant_report",

    title =
        "Merchant Transaction Report",

    summary = {},

    records = [],

    filters = {},

    generatedBy =
        "MERCHANT"
}) => {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            try {

                const doc =
                    createDocument();


                const {
                    stream,
                    fileName:
                        generatedFileName,
                    filePath
                } =
                    createWriteStream(
                        fileName
                    );


                doc.pipe(
                    stream
                );


                // ==========================================
                // HEADER
                // ==========================================

                let currentY =
                    drawHeader(
                        doc,
                        {
                            title,
                            filters,
                            generatedBy
                        }
                    );


                // ==========================================
                // SUMMARY
                // ==========================================

                currentY =
                    drawSummary(
                        doc,
                        summary,
                        currentY
                    );


                // ==========================================
                // TRANSACTION TABLE
                // ==========================================

                drawTransactionTable(
                    doc,
                    records,
                    currentY
                );


                // ==========================================
                // WATERMARK
                // ==========================================

                drawWatermark(
                    doc
                );


                // ==========================================
                // FOOTER
                // ==========================================

                drawFooter(
                    doc
                );


                // ==========================================
                // FINALIZE
                // ==========================================

                doc.end();


                stream.on(
                    "finish",
                    () => {

                        let stats;


                        try {

                            stats =
                                fs.statSync(
                                    filePath
                                );

                        } catch {

                            return reject(
                                new Error(
                                    "Generated PDF file could not be found."
                                )
                            );

                        }


                        if (
                            !stats.isFile() ||
                            stats.size <= 0
                        ) {

                            return reject(
                                new Error(
                                    "Generated PDF file is empty."
                                )
                            );

                        }


                        resolve({

                            success:
                                true,

                            fileName:
                                generatedFileName,

                            filePath,

                            size:
                                stats.size,

                            generatedAt:
                                new Date()

                        });

                    }
                );


                stream.on(
                    "error",
                    (
                        error
                    ) => {

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


// ==========================================================
// DELETE TEMPORARY PDF
// ==========================================================

const deleteExportedFile = async (
    filePath
) => {

    if (
        !filePath
    ) {

        return;

    }


    try {

        await fs.promises.unlink(
            filePath
        );

    } catch (
        error
    ) {

        if (
            error.code === "ENOENT"
        ) {

            return;

        }


        console.error(
            "Failed to delete exported PDF:",
            error.message
        );

    }

};


// ==========================================================
// FILE DETAILS
// ==========================================================

const getFileDetails = (
    filePath
) => {

    if (
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


// ==========================================================
// FILE SIZE
// ==========================================================

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
        1024 * 1024 * 1024
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


// ==========================================================
// HEALTH CHECK
// ==========================================================

const pdfHealthCheck = () => {

    return {

        success:
            true,

        engine:
            "PDFKit",

        product:
            "Trust Gates",

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


// ==========================================================
// EXPORTS
// ==========================================================

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