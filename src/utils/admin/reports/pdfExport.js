const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

// ============================================================
// EXPORT DIRECTORY SETUP
// ============================================================

const EXPORT_PATH = path.join(process.cwd(), "uploads", "reports/admin");

const verifyExportDirectory = () => {
    if (!fs.existsSync(EXPORT_PATH)) {
        fs.mkdirSync(EXPORT_PATH, { recursive: true });
    }
    return EXPORT_PATH;
};

verifyExportDirectory();

// ============================================================
// DESIGN CONSTANTS & BANK PALETTE
// ============================================================

const PAGE = {
    SIZE: "A4",
    LAYOUT: "landscape",
    WIDTH: 842,
    HEIGHT: 595,
    MARGIN: 28,
    PRINTABLE_WIDTH: 786, // 842 - 56
    PRINTABLE_HEIGHT: 539  // 595 - 56
};

// Strict threshold before bottom margin to avoid triggering PDFKit auto-page-break
const MAX_PAGE_Y = PAGE.HEIGHT - PAGE.MARGIN - 15;

const COLORS = {
    bankNavy: "#0A2540",     // Deep Institutional Navy
    brandBlue: "#1E40AF",    // Royal Financial Blue
    accentBlue: "#2563EB",   // Accent Blue
    darkSlate: "#0F172A",    // Primary Headings
    bodyText: "#334155",     // Body Text
    mutedText: "#64748B",    // Muted Labels
    lightBorder: "#E2E8F0",  // Table Horizontal Borders
    gridDivider: "#EDF2F7",  // Table Vertical Separators
    cardBg: "#F8FAFC",       // Card Backgrounds
    white: "#FFFFFF",
    
    // Financial Status Badges (Background, Text, Border)
    status: {
        SUCCESS:    { bg: "#DCFCE7", text: "#15803D", border: "#86EFAC" },
        PAID:       { bg: "#DCFCE7", text: "#15803D", border: "#86EFAC" },
        SETTLED:    { bg: "#DCFCE7", text: "#15803D", border: "#86EFAC" },
        FAILED:     { bg: "#FEE2E2", text: "#B91C1C", border: "#FCA5A5" },
        REJECTED:   { bg: "#FEE2E2", text: "#B91C1C", border: "#FCA5A5" },
        PENDING:    { bg: "#FEF3C7", text: "#B45309", border: "#FDE68A" },
        PROCESSING: { bg: "#FEF3C7", text: "#B45309", border: "#FDE68A" },
        REFUNDED:   { bg: "#E0F2FE", text: "#0369A1", border: "#7DD3FC" },
        CHARGEBACK: { bg: "#F3E8FF", text: "#6B21A8", border: "#D8B4FE" },
        DEFAULT:    { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1" }
    }
};

const FONT = {
    regular: "Helvetica",
    bold: "Helvetica-Bold",
    italic: "Helvetica-Oblique",
    boldItalic: "Helvetica-BoldOblique"
};

const FONT_SIZE = {
    title: 16,
    subTitle: 10.5,
    heading: 9.5,
    subHeading: 9,
    body: 7.5,
    small: 6.5,
    tiny: 5.5
};

const REPORT_CONFIG = {
    company: "PAYMENT GATEWAY FINANCIAL SERVICES",
    subtitle: "OFFICIAL TRANSACTION & SETTLEMENT STATEMENT",
    generatedBy: "SYSTEM ADMIN",
    watermark: "OFFICIAL STATEMENT"
};

// ============================================================
// FORMATTING HELPERS (WITH STANDARD RS. RUPEE PREFIX)
// ============================================================

const formatCurrency = (amount = 0) => {
    if (amount === null || amount === undefined) return "Rs. 0.00";
    let strVal = String(amount).trim();
    if (strVal.startsWith("Rs.") || strVal.startsWith("INR")) {
        return strVal;
    }
    if (strVal.startsWith("₹")) {
        strVal = strVal.replace(/^₹\s*/, "");
    }
    const cleanStr = strVal.replace(/[^0-9.-]/g, "");
    const num = Number(cleanStr) || 0;
    return `Rs. ${num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

const formatDate = (date) => {
    if (!date) return "-";
    try {
        return new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }).format(new Date(date));
    } catch {
        return String(date);
    }
};

const formatDateTime = (date) => {
    if (!date) return "-";
    try {
        return new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }).format(new Date(date));
    } catch {
        return String(date);
    }
};

const truncateText = (text = "", maxLength = 24) => {
    const str = String(text ?? "");
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + "...";
};

// ============================================================
// DRAWING UTILITIES
// ============================================================

const drawLine = (doc, startX, startY, endX, endY, color = COLORS.lightBorder, width = 0.5) => {
    doc.save()
       .strokeColor(color)
       .lineWidth(width)
       .moveTo(startX, startY)
       .lineTo(endX, endY)
       .stroke()
       .restore();
};

const drawBox = (doc, x, y, width, height, fill = COLORS.white, border = COLORS.lightBorder, radius = 3) => {
    doc.save()
       .fillColor(fill)
       .strokeColor(border)
       .lineWidth(0.5)
       .roundedRect(x, y, width, height, radius)
       .fillAndStroke()
       .restore();
};

const drawStatusBadge = (doc, status = "", x, y, colWidth) => {
    const s = String(status || "").toUpperCase();
    const style = COLORS.status[s] || COLORS.status.DEFAULT;

    const badgeWidth = Math.min(colWidth - 6, 60);
    const badgeHeight = 11;
    const badgeX = x + (colWidth - badgeWidth) / 2;

    doc.save()
       .fillColor(style.bg)
       .strokeColor(style.border)
       .lineWidth(0.5)
       .roundedRect(badgeX, y + 3, badgeWidth, badgeHeight, 2.5)
       .fillAndStroke()
       .restore();

    doc.font(FONT.bold)
       .fontSize(FONT_SIZE.small)
       .fillColor(style.text)
       .text(s, badgeX, y + 4.5, { width: badgeWidth, align: "center", lineBreak: false });
};

const getLogo = () => {
    const possibleLocations = [
        path.join(process.cwd(), "assets", "logo.png"),
        path.join(process.cwd(), "public", "logo.png"),
        path.join(process.cwd(), "uploads", "logo.png")
    ];
    for (const file of possibleLocations) {
        if (fs.existsSync(file)) return file;
    }
    return null;
};

// ============================================================
// DOCUMENT CREATION & STREAM HELPERS
// ============================================================

const createDocument = () => {
    return new PDFDocument({
        size: PAGE.SIZE,
        layout: PAGE.LAYOUT,
        margins: {
            top: PAGE.MARGIN,
            left: PAGE.MARGIN,
            right: PAGE.MARGIN,
            bottom: PAGE.MARGIN
        },
        autoFirstPage: true,
        bufferPages: true,
        info: {
            Title: "Official Financial Statement",
            Author: REPORT_CONFIG.company,
            Subject: "Payment Gateway Statement",
            Creator: "Payment Gateway Core API",
            Producer: "PDFKit Enterprise Engine",
            CreationDate: new Date()
        }
    });
};

const createWriteStream = (fileName = "report") => {
    verifyExportDirectory();
    const timestamp = Date.now();
    const cleanName = fileName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const finalFileName = `${cleanName}_${timestamp}.pdf`;
    const filePath = path.join(EXPORT_PATH, finalFileName);
    const stream = fs.createWriteStream(filePath);

    return { stream, filePath, fileName: finalFileName };
};

// ============================================================
// BANK HEADER & DOCUMENT METADATA
// ============================================================

const drawHeader = (doc, { title, reportDate, generatedBy, filters = {} }) => {
    let currentY = PAGE.MARGIN;

    // 1. Top Brand Accent Line
    doc.save()
       .fillColor(COLORS.bankNavy)
       .rect(PAGE.MARGIN, currentY, PAGE.PRINTABLE_WIDTH, 3)
       .fill()
       .restore();

    currentY += 8;

    // 2. Company Branding & Logo
    const logo = getLogo();
    const brandStartX = logo ? PAGE.MARGIN + 40 : PAGE.MARGIN;

    if (logo) {
        try {
            doc.image(logo, PAGE.MARGIN, currentY, { width: 32, height: 32 });
        } catch {
            // Ignore logo error
        }
    }

    doc.font(FONT.bold)
       .fontSize(FONT_SIZE.title)
       .fillColor(COLORS.bankNavy)
       .text(REPORT_CONFIG.company, brandStartX, currentY, { lineBreak: false });

    doc.font(FONT.regular)
       .fontSize(FONT_SIZE.small)
       .fillColor(COLORS.mutedText)
       .text(REPORT_CONFIG.subtitle, brandStartX, currentY + 16, { lineBreak: false });

    // 3. Statement Control Box (Right Aligned)
    const docRefId = `PG-STMT-${Math.floor(100000 + Math.random() * 900000)}`;
    const controlWidth = 190;
    const controlX = PAGE.WIDTH - PAGE.MARGIN - controlWidth;

    drawBox(doc, controlX, currentY - 2, controlWidth, 42, COLORS.cardBg, COLORS.lightBorder, 3);

    let metaY = currentY + 2;
    const drawMetaRow = (label, val) => {
        doc.font(FONT.bold)
           .fontSize(FONT_SIZE.small)
           .fillColor(COLORS.darkSlate)
           .text(label, controlX + 6, metaY, { width: 80, align: "left", lineBreak: false });

        doc.font(FONT.regular)
           .fontSize(FONT_SIZE.small)
           .fillColor(COLORS.bodyText)
           .text(val, controlX + 86, metaY, { width: 96, align: "right", lineBreak: false });

        metaY += 9.5;
    };

    drawMetaRow("Statement Ref:", docRefId);
    drawMetaRow("Statement Date:", formatDate(reportDate || new Date()));
    drawMetaRow("Generated By:", generatedBy || REPORT_CONFIG.generatedBy);
    drawMetaRow("Generated At:", formatDateTime(new Date()));

    currentY += 42;

    // 4. Section Title & Divider
    doc.font(FONT.bold)
       .fontSize(FONT_SIZE.subTitle)
       .fillColor(COLORS.brandBlue)
       .text(title.toUpperCase(), PAGE.MARGIN, currentY, { lineBreak: false });

    currentY += 12;
    drawLine(doc, PAGE.MARGIN, currentY, PAGE.WIDTH - PAGE.MARGIN, currentY, COLORS.lightBorder, 0.5);
    currentY += 6;

    // 5. Applied Filters Bar
    const filterEntries = Object.entries(filters || {}).filter(([_, v]) => v !== undefined && v !== null && v !== "");
    if (filterEntries.length > 0) {
        doc.font(FONT.bold)
           .fontSize(FONT_SIZE.small)
           .fillColor(COLORS.mutedText)
           .text("APPLIED PARAMETERS & FILTERS:", PAGE.MARGIN, currentY, { lineBreak: false });

        currentY += 9;

        let filterX = PAGE.MARGIN;
        filterEntries.forEach(([key, value]) => {
            const labelStr = `${key.toUpperCase()}: ${value}`;
            const textWidth = doc.widthOfString(labelStr, { font: FONT.bold, size: FONT_SIZE.tiny });
            const badgeWidth = textWidth + 10;

            if (filterX + badgeWidth > PAGE.WIDTH - PAGE.MARGIN) {
                filterX = PAGE.MARGIN;
                currentY += 14;
            }

            drawBox(doc, filterX, currentY, badgeWidth, 12, COLORS.cardBg, COLORS.lightBorder, 2);

            doc.font(FONT.bold)
               .fontSize(FONT_SIZE.tiny)
               .fillColor(COLORS.darkSlate)
               .text(labelStr, filterX + 5, currentY + 2, { width: textWidth, align: "left", lineBreak: false });

            filterX += badgeWidth + 5;
        });

        currentY += 14;
        drawLine(doc, PAGE.MARGIN, currentY, PAGE.WIDTH - PAGE.MARGIN, currentY, COLORS.lightBorder, 0.5);
        currentY += 6;
    }

    return currentY;
};

// ============================================================
// FINANCIAL EXECUTIVE SUMMARY GRID (COMPACT SINGLE/DOUBLE ROW)
// ============================================================

const drawSummaryCards = (doc, summary = {}, startY) => {
    if (!summary || Object.keys(summary).length === 0) return startY;

    doc.font(FONT.bold)
       .fontSize(FONT_SIZE.heading)
       .fillColor(COLORS.bankNavy)
       .text("FINANCIAL SUMMARY & ACCOUNT OVERVIEW", PAGE.MARGIN, startY, { lineBreak: false });

    startY += 10;

    const cards = [];

    Object.entries(summary).forEach(([key, val]) => {
        if (val === undefined || val === null) return;

        const lowerKey = key.toLowerCase();
        let formattedVal = String(val);
        let color = COLORS.darkSlate;

        if (
            lowerKey.includes("revenue") ||
            lowerKey.includes("amount") ||
            lowerKey.includes("fee") ||
            lowerKey.includes("gst") ||
            lowerKey.includes("tds") ||
            lowerKey.includes("net") ||
            lowerKey.includes("gross") ||
            lowerKey.includes("volume") ||
            lowerKey.includes("payin") ||
            lowerKey.includes("payout") ||
            lowerKey.includes("charge") ||
            lowerKey.includes("price") ||
            lowerKey.includes("balance") ||
            lowerKey.includes("ticket")
        ) {
            formattedVal = formatCurrency(val);
            color = (lowerKey.includes("fee") || lowerKey.includes("charge")) ? COLORS.brandBlue : COLORS.status.SUCCESS.text;
        } else if (lowerKey.includes("rate") || lowerKey.includes("ratio") || lowerKey.includes("percent")) {
            formattedVal = `${Number(val || 0)}%`;
            color = COLORS.brandBlue;
        } else if (lowerKey.includes("success")) {
            color = COLORS.status.SUCCESS.text;
        } else if (lowerKey.includes("fail") || lowerKey.includes("reject")) {
            color = COLORS.status.FAILED.text;
        } else if (lowerKey.includes("pend")) {
            color = COLORS.status.PENDING.text;
        }

        const titleLabel = key
            .replace(/([A-Z])/g, " $1")
            .replace(/_/g, " ")
            .trim()
            .toUpperCase();

        cards.push({ title: titleLabel, val: formattedVal, color });
    });

    if (cards.length === 0) return startY;

    const gap = 6;
    const cardsPerRow = Math.min(cards.length, 4);
    const cardWidth = (PAGE.PRINTABLE_WIDTH - (gap * (cardsPerRow - 1))) / cardsPerRow;
    const cardHeight = 30;

    let currentX = PAGE.MARGIN;
    let currentY = startY;

    cards.forEach((card, index) => {
        if (index > 0 && index % cardsPerRow === 0) {
            currentX = PAGE.MARGIN;
            currentY += cardHeight + gap;
        }

        drawBox(doc, currentX, currentY, cardWidth, cardHeight, COLORS.cardBg, COLORS.lightBorder, 2);

        // Top Accent Line on Card
        doc.save()
           .fillColor(card.color || COLORS.brandBlue)
           .rect(currentX, currentY, cardWidth, 1.5)
           .fill()
           .restore();

        doc.font(FONT.bold)
           .fontSize(FONT_SIZE.tiny)
           .fillColor(COLORS.mutedText)
           .text(card.title, currentX + 5, currentY + 4, { width: cardWidth - 10, lineBreak: false });

        doc.font(FONT.bold)
           .fontSize(FONT_SIZE.subHeading)
           .fillColor(card.color || COLORS.darkSlate)
           .text(card.val, currentX + 5, currentY + 15, { width: cardWidth - 10, lineBreak: false });

        currentX += cardWidth + gap;
    });

    return currentY + cardHeight + 10;
};

// ============================================================
// DYNAMIC HIGH-PRECISION TABLE ENGINE
// ============================================================

const buildDynamicColumns = (headers = []) => {
    let rawHeaders = headers;
    if (!rawHeaders || !Array.isArray(rawHeaders) || rawHeaders.length === 0) {
        rawHeaders = [
            { id: "transaction_id", title: "TRANSACTION ID" },
            { id: "merchant_name", title: "MERCHANT" },
            { id: "amount", title: "AMOUNT" },
            { id: "status", title: "STATUS" },
            { id: "created_at", title: "DATE & TIME" }
        ];
    }

    const availableWidth = PAGE.PRINTABLE_WIDTH;

    const columns = rawHeaders.map(h => {
        if (typeof h === "string") {
            h = { id: h, title: h };
        }
        const id = String((h && (h.id || h.key || h.field)) || "");
        const title = String((h && (h.title || h.header || h.name || id)) || "").toUpperCase();
        let weight = 1;
        let align = "left";

        const lowerId = id.toLowerCase();
        if (lowerId.includes("id")) {
            weight = 0.85;
            align = "left";
        } else if (
            lowerId.includes("amount") ||
            lowerId.includes("fee") ||
            lowerId.includes("gst") ||
            lowerId.includes("tds") ||
            lowerId.includes("revenue") ||
            lowerId.includes("net") ||
            lowerId.includes("gross") ||
            lowerId.includes("volume") ||
            lowerId.includes("payin") ||
            lowerId.includes("payout") ||
            lowerId.includes("price") ||
            lowerId.includes("charge") ||
            lowerId.includes("balance")
        ) {
            weight = 1.05;
            align = "right";
        } else if (lowerId.includes("status") || lowerId.includes("method") || lowerId.includes("type") || lowerId.includes("currency")) {
            weight = 0.9;
            align = "center";
        } else if (lowerId.includes("date") || lowerId.includes("at")) {
            weight = 1.15;
            align = "center";
        } else if (lowerId.includes("email") || lowerId.includes("name") || lowerId.includes("merchant") || lowerId.includes("business") || lowerId.includes("reason")) {
            weight = 1.35;
            align = "left";
        }

        return { id, key: id, title, weight, align };
    });

    const totalWeight = columns.reduce((acc, c) => acc + c.weight, 0) || 1;

    return columns.map(c => ({
        key: c.key || c.id || "",
        id: c.id || c.key || "",
        title: c.title || "",
        width: Math.floor((c.weight / totalWeight) * availableWidth),
        align: c.align || "left"
    }));
};

const formatCellValue = (columnKey, record) => {
    if (!record || !columnKey) return "-";
    const val = record[columnKey];
    if (val === undefined || val === null) return "-";

    const key = String(columnKey).toLowerCase();

    if (
        key.includes("amount") ||
        key.includes("fee") ||
        key.includes("gst") ||
        key.includes("tds") ||
        key.includes("net") ||
        key.includes("gross") ||
        key.includes("revenue") ||
        key.includes("volume") ||
        key.includes("payin") ||
        key.includes("payout") ||
        key.includes("price") ||
        key.includes("charge") ||
        key.includes("balance")
    ) {
        return formatCurrency(val);
    }
    if (key.includes("date") || key.includes("created_at") || key.includes("updated_at") || key.includes("settlement_date")) {
        return formatDateTime(val);
    }
    return String(val);
};

const drawTableHeaderRow = (doc, columns, startY) => {
    const rowHeight = 18;

    doc.save()
       .fillColor(COLORS.bankNavy)
       .roundedRect(PAGE.MARGIN, startY, PAGE.PRINTABLE_WIDTH, rowHeight, 2)
       .fill()
       .restore();

    let currentX = PAGE.MARGIN;

    columns.forEach((col, index) => {
        doc.font(FONT.bold)
           .fontSize(FONT_SIZE.small)
           .fillColor(COLORS.white)
           .text(col.title, currentX + 4, startY + 5, {
               width: col.width - 8,
               align: col.align || "left",
               lineBreak: false
           });

        if (index < columns.length - 1) {
            drawLine(doc, currentX + col.width, startY + 2, currentX + col.width, startY + rowHeight - 2, "#1E293B", 0.4);
        }

        currentX += col.width;
    });

    return startY + rowHeight;
};

const drawTableRow = (doc, columns, record, rowIndex, startY) => {
    const rowHeight = 17;

    if (rowIndex % 2 === 1) {
        doc.save()
           .fillColor(COLORS.cardBg)
           .rect(PAGE.MARGIN, startY, PAGE.PRINTABLE_WIDTH, rowHeight)
           .fill()
           .restore();
    }

    let currentX = PAGE.MARGIN;

    columns.forEach((col, index) => {
        const colKey = String(col.key || col.id || "");
        const isStatus = colKey.toLowerCase().includes("status");

        if (isStatus) {
            drawStatusBadge(doc, record[colKey], currentX, startY, col.width);
        } else {
            const rawVal = formatCellValue(colKey, record);
            const textVal = truncateText(rawVal, col.width > 110 ? 28 : 16);
            const isAmount = colKey.toLowerCase().includes("amount") ||
                             colKey.toLowerCase().includes("fee") ||
                             colKey.toLowerCase().includes("net") ||
                             colKey.toLowerCase().includes("gross") ||
                             colKey.toLowerCase().includes("revenue");

            doc.font(isAmount ? FONT.bold : FONT.regular)
               .fontSize(FONT_SIZE.body)
               .fillColor(COLORS.darkSlate)
               .text(textVal, currentX + 4, startY + 4.5, {
                   width: col.width - 8,
                   align: col.align || "left",
                   lineBreak: false
               });
        }

        if (index < columns.length - 1) {
            drawLine(doc, currentX + col.width, startY, currentX + col.width, startY + rowHeight, COLORS.gridDivider, 0.4);
        }

        drawLine(doc, currentX, startY + rowHeight, currentX + col.width, startY + rowHeight, COLORS.lightBorder, 0.4);

        currentX += col.width;
    });

    return startY + rowHeight;
};

const checkPageOverflow = (doc, currentY, requiredHeight, columns) => {
    if (currentY + requiredHeight > MAX_PAGE_Y) {
        doc.addPage({
            size: PAGE.SIZE,
            layout: PAGE.LAYOUT,
            margins: { top: PAGE.MARGIN, left: PAGE.MARGIN, right: PAGE.MARGIN, bottom: PAGE.MARGIN }
        });
        return drawTableHeaderRow(doc, columns, PAGE.MARGIN);
    }
    return currentY;
};

const drawTableTotalsRow = (doc, columns, records, startY) => {
    const rowHeight = 20;

    let totalCount = records ? records.length : 0;
    let totalAmount = 0;

    if (records && Array.isArray(records)) {
        records.forEach(r => {
            if (r) {
                const amt = r.amount || r.gross_amount || r.net_amount || r.refund_amount || r.totalAmount || r.total_amount || r.revenue || r.total_revenue || 0;
                totalAmount += Number(amt) || 0;
            }
        });
    }

    doc.save()
       .fillColor(COLORS.cardBg)
       .roundedRect(PAGE.MARGIN, startY, PAGE.PRINTABLE_WIDTH, rowHeight, 2)
       .fill()
       .restore();

    drawLine(doc, PAGE.MARGIN, startY, PAGE.WIDTH - PAGE.MARGIN, startY, COLORS.bankNavy, 0.75);
    drawLine(doc, PAGE.MARGIN, startY + rowHeight, PAGE.WIDTH - PAGE.MARGIN, startY + rowHeight, COLORS.bankNavy, 1.25);

    doc.font(FONT.bold)
       .fontSize(FONT_SIZE.body)
       .fillColor(COLORS.bankNavy)
       .text(`STATEMENT SUMMARY TOTALS (${totalCount} RECORDS)`, PAGE.MARGIN + 6, startY + 5.5, { lineBreak: false });

    if (totalAmount > 0) {
        doc.font(FONT.bold)
           .fontSize(FONT_SIZE.subHeading)
           .fillColor(COLORS.bankNavy)
           .text(`TOTAL VOLUME: ${formatCurrency(totalAmount)}`, PAGE.WIDTH - PAGE.MARGIN - 240, startY + 5, {
               width: 230,
               align: "right",
               lineBreak: false
           });
    }

    return startY + rowHeight + 8;
};

const drawTransactionTable = (doc, { title = "STATEMENT DETAILS", headers = [], records = [], startY }) => {
    const columns = buildDynamicColumns(headers);

    doc.font(FONT.bold)
       .fontSize(FONT_SIZE.heading)
       .fillColor(COLORS.bankNavy)
       .text(title.toUpperCase(), PAGE.MARGIN, startY, { lineBreak: false });

    startY += 10;
    startY = drawTableHeaderRow(doc, columns, startY);

    if (!records || records.length === 0) {
        doc.font(FONT.italic)
           .fontSize(FONT_SIZE.body)
           .fillColor(COLORS.mutedText)
           .text("No financial records found for the selected period.", PAGE.MARGIN, startY + 10, {
               width: PAGE.PRINTABLE_WIDTH,
               align: "center",
               lineBreak: false
           });
        return startY + 25;
    }

    let currentY = startY;

    records.forEach((record, index) => {
        currentY = checkPageOverflow(doc, currentY, 17, columns);
        currentY = drawTableRow(doc, columns, record, index, currentY);
    });

    currentY = checkPageOverflow(doc, currentY, 20, columns);
    currentY = drawTableTotalsRow(doc, columns, records, currentY);

    return currentY;
};

// ============================================================
// BANK SECURITY STAMP & WATERMARK
// ============================================================

const drawBankSecurityNotice = (doc, startY) => {
    // Only draw notice if it fits safely on current page without creating extra page
    if (startY + 22 > MAX_PAGE_Y) return startY;

    const noticeWidth = PAGE.PRINTABLE_WIDTH;
    const noticeHeight = 20;

    drawBox(doc, PAGE.MARGIN, startY, noticeWidth, noticeHeight, COLORS.cardBg, COLORS.lightBorder, 2.5);

    doc.font(FONT.bold)
       .fontSize(FONT_SIZE.tiny)
       .fillColor(COLORS.bankNavy)
       .text("OFFICIAL COMPUTER-GENERATED FINANCIAL STATEMENT - Valid without physical signature.", PAGE.MARGIN + 6, startY + 3.5, {
           width: noticeWidth - 12,
           lineBreak: false
       });

    doc.font(FONT.regular)
       .fontSize(5.5)
       .fillColor(COLORS.mutedText)
       .text("This document is generated by the Payment Gateway Core System. For support or dispute resolution, contact support@paymentgateway.com.", PAGE.MARGIN + 6, startY + 11.5, {
           width: noticeWidth - 12,
           lineBreak: false
       });

    return startY + noticeHeight + 4;
};

const drawWatermark = (doc, text = REPORT_CONFIG.watermark) => {
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.save();
        doc.rotate(-25, { origin: [PAGE.WIDTH / 2, PAGE.HEIGHT / 2] });
        doc.font(FONT.bold)
           .fillOpacity(0.035)
           .fillColor(COLORS.bankNavy)
           .fontSize(72)
           .text(text, PAGE.WIDTH / 2 - 300, PAGE.HEIGHT / 2 - 30, {
               width: 600,
               align: "center",
               lineBreak: false
           });
        doc.restore();
    }
};

const drawFooter = (doc) => {
    const pages = doc.bufferedPageRange();
    const footerY = PAGE.HEIGHT - 18;

    for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);

        drawLine(doc, PAGE.MARGIN, footerY - 4, PAGE.WIDTH - PAGE.MARGIN, footerY - 4, COLORS.lightBorder, 0.4);

        doc.font(FONT.bold)
           .fontSize(FONT_SIZE.tiny)
           .fillColor(COLORS.mutedText)
           .text(`${REPORT_CONFIG.company} | CONFIDENTIAL FINANCIAL STATEMENT`, PAGE.MARGIN, footerY, {
               lineBreak: false
           });

        doc.font(FONT.regular)
           .fontSize(FONT_SIZE.tiny)
           .fillColor(COLORS.mutedText)
           .text(`Page ${i + 1} of ${pages.count}`, PAGE.WIDTH - PAGE.MARGIN - 100, footerY, {
               width: 100,
               align: "right",
               lineBreak: false
           });
    }
};

// ============================================================
// MAIN EXPORT PDF FUNCTION
// ============================================================

/**
 * Generates a Bank-Grade PDF Report & Statement and streams it to file.
 * 
 * @param {Object} options
 * @param {string} options.fileName - Output filename base
 * @param {string} options.title - Report Header Title
 * @param {Object} options.summary - Financial summary metrics object
 * @param {Array} options.records - Array of transaction/report data rows
 * @param {Array} options.headers - Array of column header objects [{ id, title }]
 * @param {Object} options.filters - Applied filter object
 * @param {string} options.generatedBy - Generator username/role
 * @returns {Promise<Object>} Export result details
 */
const exportPDF = async ({
    fileName = "financial_statement",
    title = "Transaction Statement",
    summary = {},
    records = [],
    headers = [],
    filters = {},
    generatedBy = REPORT_CONFIG.generatedBy
}) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = createDocument();
            const { stream, fileName: generatedFileName, filePath } = createWriteStream(fileName);

            doc.pipe(stream);

            // Render Document Sections
            let currentY = drawHeader(doc, { title, reportDate: filters.date, generatedBy, filters });

            if (summary && Object.keys(summary).length > 0) {
                currentY = drawSummaryCards(doc, summary, currentY);
            }

            currentY = drawTransactionTable(doc, {
                title: `${title} Details`,
                headers,
                records,
                startY: currentY
            });

            // Temporarily set bottom margin to 0 during security notice, watermark, and footer passes
            // so PDFKit text renderer never triggers auto-page-break on disclaimers/footers!
            const prevBottomMargin = doc.page.margins.bottom;
            doc.page.margins.bottom = 0;

            drawBankSecurityNotice(doc, currentY);
            drawWatermark(doc);
            drawFooter(doc);

            doc.page.margins.bottom = prevBottomMargin;

            // Finalize PDF Document
            doc.end();

            stream.on("finish", () => {
                const stats = fs.statSync(filePath);
                resolve({
                    success: true,
                    fileName: generatedFileName,
                    filePath,
                    downloadPath: `/uploads/reports/pdf/${generatedFileName}`,
                    downloadUrl: `/uploads/reports/pdf/${generatedFileName}`,
                    size: stats.size,
                    generatedAt: new Date()
                });
            });

            stream.on("error", (err) => {
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
    });
};

// ============================================================
// COMPATIBILITY & HELPER EXPORTS
// ============================================================

const deleteExportedFile = async (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
        }
    } catch (error) {
        console.error("Failed to delete exported PDF:", error.message);
    }
};

const getFileDetails = (filePath) => {
    if (!fs.existsSync(filePath)) return null;
    const stats = fs.statSync(filePath);
    return {
        filePath,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        isFile: stats.isFile()
    };
};

const formatFileSize = (bytes = 0) => {
    if (bytes < 1024) return `${bytes} Bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

const pdfHealthCheck = () => {
    return {
        success: true,
        engine: "PDFKit Enterprise",
        exportDirectory: EXPORT_PATH,
        directoryExists: fs.existsSync(EXPORT_PATH),
        timestamp: new Date()
    };
};

// ============================================================
// MODULE EXPORTS
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