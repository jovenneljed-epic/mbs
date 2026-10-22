/* =========================================================
   SCHOOL PRINT SERVICE
   Mobile Bible School & Seminary Academic Management System
   Generates beautiful, high-resolution official print templates
   Uses an isolated print frame to completely bypass SPA/overflow traps.
========================================================= */

export interface PrintSummaryCard {
    label: string;
    value: string | number;
    subtext?: string;
}

export interface PrintColumn {
    header: string;
    width?: string;
    align?: "left" | "center" | "right";
}

export interface SchoolReportPrintData {
    title: string;
    category?: string;
    description?: string;
    filterSummary?: string;
    summaryCards?: PrintSummaryCard[];
    columns: PrintColumn[];
    rows: (string | number)[][];
}

export interface SchoolDocumentPrintData {
    docType: "com" | "diploma" | "tor" | "id" | "admission" | "good-moral" | "gradebook";
    docTitle: string;
    studentName: string;
    studentId: string;
    program: string;
    yearLevel: string;
    learningMode: string;
    contactNumber?: string;
    email?: string;
    address?: string;
    guardianName?: string;
    guardianContact?: string;
    subjects: {
        code: string;
        title: string;
        units: number;
        schedule: string;
        room: string;
        instructor: string;
        grade?: string;
    }[];
    ratePerUnit: number;
    totalTuition: number;
    amountPaid: number;
    balance: number;
    paymentStatus: string;
}

export interface SchoolReceiptPrintData {
    receiptNumber: string;
    transactionDate: string;
    studentName: string;
    studentId: string;
    courseName: string;
    yearLevel?: string;
    paymentMethod: string;
    referenceNumber?: string;
    paymentCategory: string;
    particulars: {
        description: string;
        units?: number;
        rate?: number;
        amount: number;
    }[];
    subtotal: number;
    discount?: number;
    amountPaid: number;
    amountInWords: string;
    previousBalance: number;
    remainingBalance: number;
    cashierName: string;
    notes?: string;
}

export interface AdmissionLetterData {
    applicantName: string;
    applicantCode: string;
    program: string;
    modeOfLearning: string;
    applicantType?: string;
    applicationDate: string;
    examScore?: string;
    interviewRating?: string;
    address?: string;
    contactNumber?: string;
    email?: string;
    guardianName?: string;
    admittedTerm?: string;
    admittedBy?: string;
}

export class SchoolPrintService {
    /**
     * Prints an official academic report table with school letterhead, summary stats, and signature block.
     */
    public static printReport(data: SchoolReportPrintData): void {
        const currentDate = new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
        const currentTime = new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        });
        const docRefNumber = `MBS-REP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const summaryCardsHtml = data.summaryCards && data.summaryCards.length > 0
            ? `
            <div class="kpi-grid">
                ${data.summaryCards.map(c => `
                    <div class="kpi-card">
                        <div class="kpi-label">${c.label}</div>
                        <div class="kpi-val">${c.value}</div>
                        ${c.subtext ? `<div class="kpi-sub">${c.subtext}</div>` : ""}
                    </div>
                `).join("")}
            </div>
            `
            : "";

        const tableHeadersHtml = data.columns.map(col => `
            <th style="${col.width ? `width: ${col.width};` : ""} text-align: ${col.align || 'left'};">
                ${col.header}
            </th>
        `).join("");

        const tableRowsHtml = data.rows.map((row, idx) => `
            <tr class="${idx % 2 === 1 ? 'alt-row' : ''}">
                ${row.map((cell, colIdx) => {
                    const align = data.columns[colIdx]?.align || 'left';
                    return `<td style="text-align: ${align};">${cell}</td>`;
                }).join("")}
            </tr>
        `).join("");

        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>${data.title} - Mobile Bible School</title>
            <style>
                @page {
                    size: A4 portrait;
                    margin: 12mm 12mm 15mm 12mm;
                }
                * {
                    box-sizing: border-box;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                body {
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    color: #0f172a;
                    background: #ffffff;
                    font-size: 11pt;
                    line-height: 1.4;
                }
                .print-container {
                    width: 100%;
                    max-width: 100%;
                }
                /* Top Letterhead Bar */
                .top-accent-bar {
                    height: 5px;
                    background: linear-gradient(90deg, #1877f2 0%, #0284c7 50%, #1e40af 100%);
                    margin-bottom: 16px;
                }
                .header-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 14px;
                }
                .header-left {
                    vertical-align: middle;
                }
                .school-title {
                    font-size: 20pt;
                    font-weight: 900;
                    color: #0f172a;
                    letter-spacing: -0.5px;
                    margin: 0;
                    text-transform: uppercase;
                }
                .school-subtitle {
                    font-size: 9pt;
                    font-weight: 600;
                    color: #64748b;
                    margin: 2px 0 0 0;
                    letter-spacing: 0.3px;
                }
                .school-tagline {
                    font-size: 8pt;
                    color: #94a3b8;
                    margin: 1px 0 0 0;
                }
                .header-right {
                    text-align: right;
                    vertical-align: middle;
                }
                .doc-badge {
                    display: inline-block;
                    background: #e7f3ff;
                    color: #1877f2;
                    border: 1px solid #cce4ff;
                    padding: 4px 10px;
                    font-size: 8pt;
                    font-weight: 800;
                    border-radius: 4px;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }
                .meta-line {
                    font-size: 8pt;
                    color: #64748b;
                    margin: 1px 0;
                }
                .meta-line strong {
                    color: #1e293b;
                }
                /* Report Title Banner */
                .report-title-banner {
                    background: #f8fafc;
                    border-left: 4px solid #1877f2;
                    border-top: 1px solid #e2e8f0;
                    border-right: 1px solid #e2e8f0;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 10px 14px;
                    margin-bottom: 14px;
                    border-radius: 0 6px 6px 0;
                }
                .banner-title {
                    font-size: 13pt;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 2px 0;
                }
                .banner-desc {
                    font-size: 8.5pt;
                    color: #475569;
                    margin: 0;
                }
                .banner-filter {
                    font-size: 8pt;
                    font-weight: 700;
                    color: #1877f2;
                    margin-top: 4px;
                }
                /* KPI Grid */
                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                    margin-bottom: 14px;
                }
                .kpi-card {
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    padding: 8px 10px;
                }
                .kpi-label {
                    font-size: 7pt;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .kpi-val {
                    font-size: 13pt;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 1px 0;
                }
                .kpi-sub {
                    font-size: 7pt;
                    color: #64748b;
                }
                /* Main Table */
                table.data-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 8.5pt;
                    margin-bottom: 18px;
                }
                table.data-table th {
                    background: #1e293b;
                    color: #ffffff;
                    font-weight: 700;
                    font-size: 7.5pt;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    padding: 7px 8px;
                    border: 1px solid #0f172a;
                }
                table.data-table td {
                    padding: 6px 8px;
                    border: 1px solid #cbd5e1;
                    color: #1e293b;
                    vertical-align: middle;
                }
                table.data-table tr.alt-row td {
                    background: #f8fafc;
                }
                /* Signatures Block */
                .signature-section {
                    margin-top: 24px;
                    page-break-inside: avoid;
                }
                .sig-heading {
                    font-size: 7.5pt;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 12px;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 4px;
                }
                .sig-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    text-align: center;
                }
                .sig-box {
                    padding-top: 28px;
                }
                .sig-line {
                    width: 80%;
                    margin: 0 auto 4px auto;
                    border-bottom: 1px solid #0f172a;
                }
                .sig-name {
                    font-size: 8.5pt;
                    font-weight: 800;
                    color: #0f172a;
                }
                .sig-role {
                    font-size: 7.5pt;
                    color: #64748b;
                }
                /* Footer */
                .print-footer {
                    margin-top: 18px;
                    padding-top: 8px;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    font-size: 7pt;
                    color: #94a3b8;
                }
            </style>
        </head>
        <body>
            <div class="print-container">
                <div class="top-accent-bar"></div>

                <table class="header-table">
                    <tr>
                        <td class="header-left">
                            <h1 class="school-title">Mobile Bible School</h1>
                            <div class="school-subtitle">School of Theology, Christian Ministry & Biblical Studies</div>
                            <div class="school-tagline">Academic System • Commission on Higher Education Partner Seminary</div>
                        </td>
                        <td class="header-right">
                            <div class="doc-badge">OFFICIAL ACADEMIC REPORT</div>
                            <div class="meta-line">Control No: <strong>${docRefNumber}</strong></div>
                            <div class="meta-line">Issue Date: <strong>${currentDate} • ${currentTime}</strong></div>
                            <div class="meta-line">Classification: <strong>Academic & Institutional Record</strong></div>
                        </td>
                    </tr>
                </table>

                <div class="report-title-banner">
                    <div class="banner-title">${data.title}</div>
                    ${data.description ? `<div class="banner-desc">${data.description}</div>` : ""}
                    ${data.filterSummary ? `<div class="banner-filter">${data.filterSummary}</div>` : ""}
                </div>

                ${summaryCardsHtml}

                <table class="data-table">
                    <thead>
                        <tr>
                            ${tableHeadersHtml}
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRowsHtml}
                    </tbody>
                </table>

                <div class="signature-section">
                    <div class="sig-heading">Institutional Verification & Sign-off</div>
                    <div class="sig-grid">
                        <div class="sig-box">
                            <div class="sig-line"></div>
                            <div class="sig-name">Mrs. Clarissa Mendez</div>
                            <div class="sig-role">Office of the University Registrar</div>
                        </div>
                        <div class="sig-box">
                            <div class="sig-line"></div>
                            <div class="sig-name">Dr. Samuel Vance, Th.D.</div>
                            <div class="sig-role">Dean of Academic Affairs</div>
                        </div>
                        <div class="sig-box">
                            <div class="sig-line"></div>
                            <div class="sig-name">Rev. Emmanuel Davis, D.D.</div>
                            <div class="sig-role">President & Chancellor</div>
                        </div>
                    </div>
                </div>

                <div class="print-footer">
                    <span>Mobile Bible School Academic Registry • Valid for Official Verification</span>
                    <span>CONFIDENTIAL ACADEMIC DOCUMENT • Page 1 of 1</span>
                </div>
            </div>
        </body>
        </html>
        `;

        this.executePrint(html);
    }

    /**
     * Prints official academic documents (Certificate of Matriculation, Diploma, Transcript, etc.).
     */
    public static printDocument(data: SchoolDocumentPrintData): void {
        const currentDate = new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
        const docRefNumber = `MBS-DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const totalUnits = data.subjects.reduce((sum, s) => sum + s.units, 0);

        let bodyContent = "";

        if (data.docType === "diploma") {
            bodyContent = `
            <div class="diploma-border">
                <div class="diploma-inner">
                    <div class="diploma-emblem">✝</div>
                    <div class="diploma-latin">In Nomine Domini Nostri Jesu Christi</div>
                    <h1 class="diploma-school">Mobile Bible School</h1>
                    <div class="diploma-sub">School of Theology & Christian Ministry • Main Seminary Campus</div>
                    
                    <p class="diploma-intro">
                        The Board of Trustees and Academic Faculty, upon recommendation of the Academic Council,<br>
                        hereby confer upon
                    </p>
                    
                    <div class="diploma-name">${data.studentName}</div>
                    
                    <p class="diploma-confer">
                        who has honorably completed all prescribed courses of study, theological field cohorts, and credit requirements,<br>
                        the degree of
                    </p>
                    
                    <div class="diploma-degree">${data.program || "Bachelor of Theology (B.Th.)"}</div>
                    
                    <p class="diploma-rights">
                        with all the rights, privileges, pastoral credentials, and academic honors appertaining thereto.<br>
                        Given at the Main Seminary Campus, this ${currentDate}.
                    </p>

                    <div class="diploma-signatures">
                        <div class="diploma-sig-box">
                            <div class="diploma-line"></div>
                            <div class="diploma-sig-name">Dr. Samuel Vance, Th.D.</div>
                            <div class="diploma-sig-title">Dean of Academic Affairs</div>
                        </div>
                        <div class="diploma-seal">
                            OFFICIAL<br>ACADEMIC<br>SEAL
                        </div>
                        <div class="diploma-sig-box">
                            <div class="diploma-line"></div>
                            <div class="diploma-sig-name">Rev. Emmanuel Davis, D.D.</div>
                            <div class="diploma-sig-title">President & Chancellor</div>
                        </div>
                    </div>
                </div>
            </div>
            `;
        } else {
            // Standard COM / TOR / Admission Form
            bodyContent = `
            <div class="top-accent-bar"></div>

            <table class="header-table">
                <tr>
                    <td class="header-left">
                        <h1 class="school-title">Mobile Bible School</h1>
                        <div class="school-subtitle">School of Theology, Christian Ministry & Biblical Studies</div>
                        <div class="school-tagline">Academic Affairs & Admissions Office • Main Campus</div>
                    </td>
                    <td class="header-right">
                        <div class="doc-badge">OFFICIAL ACADEMIC DOCUMENT</div>
                        <div class="meta-line">Control No: <strong>${docRefNumber}</strong></div>
                        <div class="meta-line">Issue Date: <strong>${currentDate}</strong></div>
                        <div class="meta-line">Status: <strong>OFFICIALLY ENROLLED</strong></div>
                    </td>
                </tr>
            </table>

            <div class="doc-title-box">
                <h2>${data.docTitle.toUpperCase()}</h2>
                <p>Academic Year 2026–2027 • First Semester Regular Session</p>
            </div>

            <table class="student-info-table">
                <tr>
                    <td class="info-label">STUDENT NAME:</td>
                    <td class="info-value"><strong>${data.studentName}</strong></td>
                    <td class="info-label">STUDENT ID:</td>
                    <td class="info-value"><span class="id-badge">${data.studentId}</span></td>
                </tr>
                <tr>
                    <td class="info-label">DEGREE PROGRAM:</td>
                    <td class="info-value">${data.program || "Bachelor of Theology (B.Th.)"}</td>
                    <td class="info-label">YEAR LEVEL:</td>
                    <td class="info-value">${data.yearLevel || "1st Year"}</td>
                </tr>
                <tr>
                    <td class="info-label">MODE OF LEARNING:</td>
                    <td class="info-value">${data.learningMode || "Modular Field Cohort"}</td>
                    <td class="info-label">CONTACT / EMAIL:</td>
                    <td class="info-value">${data.contactNumber || "N/A"} • ${data.email || "N/A"}</td>
                </tr>
                <tr>
                    <td class="info-label">GUARDIAN / SPONSOR:</td>
                    <td class="info-value">${data.guardianName || "N/A"} (${data.guardianContact || "N/A"})</td>
                    <td class="info-label">ACADEMIC STANDING:</td>
                    <td class="info-value" style="color: #16a34a; font-weight: 700;">In Good Standing</td>
                </tr>
            </table>

            <div class="section-title">Enrolled Subject Curriculum & Class Schedule</div>

            <table class="subjects-table">
                <thead>
                    <tr>
                        <th style="width: 15%;">SUBJECT CODE</th>
                        <th style="width: 35%;">SUBJECT TITLE</th>
                        <th style="width: 10%; text-align: center;">UNITS</th>
                        <th style="width: 25%;">SCHEDULE & ROOM</th>
                        <th style="width: 15%;">${data.docType === 'tor' ? 'FINAL GRADE' : 'INSTRUCTOR'}</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.subjects.map((s, idx) => `
                        <tr class="${idx % 2 === 1 ? 'alt-row' : ''}">
                            <td style="font-weight: 700; color: #1877f2;">${s.code}</td>
                            <td><strong>${s.title}</strong></td>
                            <td style="text-align: center; font-weight: 700;">${s.units}</td>
                            <td style="font-size: 8pt; color: #475569;">${s.schedule} • ${s.room}</td>
                            <td style="font-size: 8.5pt;">${data.docType === 'tor' ? '<strong style="color: #15803d;">1.25 (PASSED)</strong>' : s.instructor}</td>
                        </tr>
                    `).join("")}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="text-align: right; font-weight: 800;">TOTAL ACADEMIC LOAD:</td>
                        <td style="text-align: center; font-weight: 800;">${totalUnits} Units</td>
                        <td colspan="2" style="font-size: 8pt; color: #64748b;">Full Semestral Theological Study Load</td>
                    </tr>
                </tfoot>
            </table>

            ${data.docType !== 'tor' ? `
            <div class="section-title">Tuition Assessment & Payment Ledger</div>

            <table class="finance-table">
                <tr>
                    <td>
                        <div class="fin-label">Rate Per Unit</div>
                        <div class="fin-val">₱${data.ratePerUnit.toLocaleString()}</div>
                    </td>
                    <td>
                        <div class="fin-label">Total Assessment</div>
                        <div class="fin-val">₱${data.totalTuition.toLocaleString()}</div>
                    </td>
                    <td>
                        <div class="fin-label">Total Paid</div>
                        <div class="fin-val" style="color: #15803d;">₱${data.amountPaid.toLocaleString()}</div>
                    </td>
                    <td>
                        <div class="fin-label">Remaining Balance</div>
                        <div class="fin-val" style="color: ${data.balance > 0 ? '#b91c1c' : '#15803d'};">₱${data.balance.toLocaleString()}</div>
                    </td>
                    <td>
                        <div class="fin-label">Payment Status</div>
                        <div class="status-badge ${data.paymentStatus.toLowerCase()}">${data.paymentStatus}</div>
                    </td>
                </tr>
            </table>
            ` : ""}

            <div class="signature-section">
                <div class="sig-grid-2">
                    <div class="sig-box">
                        <div class="sig-line"></div>
                        <div class="sig-name">Mrs. Clarissa Mendez</div>
                        <div class="sig-role">Office of the University Registrar</div>
                    </div>
                    <div class="sig-box">
                        <div class="sig-line"></div>
                        <div class="sig-name">${data.studentName}</div>
                        <div class="sig-role">Student Conforme & Signature</div>
                    </div>
                </div>
            </div>

            <div class="print-footer">
                <span>Certified by Mobile Bible School Academic Registrar • Official Copy</span>
                <span>System Verification ID: ${docRefNumber}</span>
            </div>
            `;
        }

        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>${data.docTitle} - ${data.studentName}</title>
            <style>
                @page {
                    size: A4 portrait;
                    margin: 12mm 12mm 15mm 12mm;
                }
                * {
                    box-sizing: border-box;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                body {
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                    color: #0f172a;
                    background: #ffffff;
                    font-size: 10.5pt;
                    line-height: 1.4;
                }
                .top-accent-bar {
                    height: 5px;
                    background: linear-gradient(90deg, #1877f2 0%, #0284c7 50%, #1e40af 100%);
                    margin-bottom: 16px;
                }
                .header-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 12px;
                }
                .school-title {
                    font-size: 20pt;
                    font-weight: 900;
                    color: #0f172a;
                    margin: 0;
                    text-transform: uppercase;
                }
                .school-subtitle {
                    font-size: 9pt;
                    font-weight: 600;
                    color: #64748b;
                    margin: 2px 0 0 0;
                }
                .school-tagline {
                    font-size: 8pt;
                    color: #94a3b8;
                    margin: 1px 0 0 0;
                }
                .header-right {
                    text-align: right;
                    vertical-align: middle;
                }
                .doc-badge {
                    display: inline-block;
                    background: #e7f3ff;
                    color: #1877f2;
                    border: 1px solid #cce4ff;
                    padding: 4px 10px;
                    font-size: 8pt;
                    font-weight: 800;
                    border-radius: 4px;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }
                .meta-line {
                    font-size: 8pt;
                    color: #64748b;
                    margin: 1px 0;
                }
                .doc-title-box {
                    text-align: center;
                    background: #f8fafc;
                    border: 1px solid #cbd5e1;
                    padding: 10px;
                    margin-bottom: 14px;
                    border-radius: 6px;
                }
                .doc-title-box h2 {
                    margin: 0;
                    font-size: 14pt;
                    font-weight: 800;
                    color: #0f172a;
                    letter-spacing: 0.5px;
                }
                .doc-title-box p {
                    margin: 2px 0 0 0;
                    font-size: 8.5pt;
                    color: #64748b;
                }
                .student-info-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: #f8fafc;
                    border: 1px solid #cbd5e1;
                    margin-bottom: 14px;
                    font-size: 8.5pt;
                }
                .student-info-table td {
                    padding: 6px 10px;
                    border: 1px solid #e2e8f0;
                }
                .info-label {
                    width: 20%;
                    font-weight: 700;
                    color: #64748b;
                    background: #f1f5f9;
                }
                .info-value {
                    width: 30%;
                    color: #0f172a;
                }
                .id-badge {
                    font-family: monospace;
                    font-weight: 700;
                    color: #1877f2;
                    background: #e7f3ff;
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                .section-title {
                    font-size: 9.5pt;
                    font-weight: 800;
                    color: #0f172a;
                    text-transform: uppercase;
                    margin: 14px 0 6px 0;
                    border-left: 3px solid #1877f2;
                    padding-left: 6px;
                }
                table.subjects-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 8.5pt;
                    margin-bottom: 14px;
                }
                table.subjects-table th {
                    background: #1e293b;
                    color: #ffffff;
                    font-size: 7.5pt;
                    padding: 6px 8px;
                    border: 1px solid #0f172a;
                    text-align: left;
                }
                table.subjects-table td {
                    padding: 6px 8px;
                    border: 1px solid #cbd5e1;
                }
                table.subjects-table tfoot td {
                    background: #f8fafc;
                    font-weight: 700;
                }
                .finance-table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 1px solid #bbf7d0;
                    background: #f0fdf4;
                    margin-bottom: 18px;
                    text-align: center;
                }
                .finance-table td {
                    padding: 8px 10px;
                    border: 1px solid #bbf7d0;
                }
                .fin-label {
                    font-size: 7.5pt;
                    font-weight: 700;
                    color: #166534;
                    text-transform: uppercase;
                }
                .fin-val {
                    font-size: 11pt;
                    font-weight: 800;
                    color: #15803d;
                    margin-top: 2px;
                }
                .status-badge {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-size: 7.5pt;
                    font-weight: 800;
                    text-transform: uppercase;
                }
                .status-badge.paid { background: #dcfce7; color: #15803d; }
                .status-badge.partial { background: #fef3c7; color: #b45309; }
                .status-badge.unpaid { background: #fee2e2; color: #b91c1c; }
                .signature-section {
                    margin-top: 20px;
                    page-break-inside: avoid;
                }
                .sig-grid-2 {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 36px;
                    text-align: center;
                }
                .sig-box {
                    padding-top: 24px;
                }
                .sig-line {
                    width: 70%;
                    margin: 0 auto 4px auto;
                    border-bottom: 1px solid #0f172a;
                }
                .sig-name {
                    font-size: 8.5pt;
                    font-weight: 800;
                    color: #0f172a;
                }
                .sig-role {
                    font-size: 7.5pt;
                    color: #64748b;
                }
                .print-footer {
                    margin-top: 14px;
                    padding-top: 6px;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    font-size: 7pt;
                    color: #94a3b8;
                }
                /* Diploma Specific */
                .diploma-border {
                    border: 8px double #1877f2;
                    padding: 16px;
                    background: #fffdfa;
                }
                .diploma-inner {
                    border: 1px solid #cbd5e1;
                    padding: 30px 24px;
                    text-align: center;
                }
                .diploma-emblem {
                    font-size: 26pt;
                    color: #1877f2;
                }
                .diploma-latin {
                    font-style: italic;
                    font-size: 10pt;
                    color: #64748b;
                    margin: 4px 0 10px;
                }
                .diploma-school {
                    font-size: 24pt;
                    font-weight: 900;
                    color: #0f172a;
                    text-transform: uppercase;
                    margin: 0;
                    letter-spacing: 0.5px;
                }
                .diploma-sub {
                    font-size: 10pt;
                    color: #475569;
                    margin-bottom: 16px;
                }
                .diploma-intro {
                    font-size: 9.5pt;
                    color: #64748b;
                    margin: 12px 0;
                }
                .diploma-name {
                    font-size: 24pt;
                    font-weight: 900;
                    color: #0f172a;
                    font-family: Georgia, serif;
                    margin: 12px 0;
                    border-bottom: 2px solid #cbd5e1;
                    display: inline-block;
                    padding: 0 20px 4px 20px;
                }
                .diploma-confer {
                    font-size: 9.5pt;
                    color: #475569;
                    margin: 10px 0;
                }
                .diploma-degree {
                    font-size: 16pt;
                    font-weight: 800;
                    color: #1877f2;
                    margin: 10px 0;
                    text-transform: uppercase;
                }
                .diploma-rights {
                    font-size: 9pt;
                    color: #475569;
                    line-height: 1.5;
                    max-width: 80%;
                    margin: 12px auto 20px;
                }
                .diploma-signatures {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-top: 30px;
                    padding: 0 20px;
                }
                .diploma-sig-box {
                    width: 35%;
                    text-align: center;
                }
                .diploma-line {
                    border-bottom: 1px solid #0f172a;
                    margin-bottom: 4px;
                }
                .diploma-sig-name {
                    font-size: 8.5pt;
                    font-weight: 800;
                }
                .diploma-sig-title {
                    font-size: 7.5pt;
                    color: #64748b;
                }
                .diploma-seal {
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    border: 2px dashed #1877f2;
                    color: #1877f2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 6.5pt;
                    font-weight: 800;
                    text-align: center;
                    line-height: 1.2;
                }
            </style>
        </head>
        <body>
            <div class="print-container">
                ${bodyContent}
            </div>
        </body>
        </html>
        `;

        this.executePrint(html);
    }

    /**
     * Prints an official Student Tuition & Fee Official Receipt (OR)
     */
    public static printReceipt(data: SchoolReceiptPrintData): void {
        const formatCurrency = (amt: number) => `₱${Number(amt || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        const particularsRows = data.particulars.map(item => `
            <tr>
                <td style="padding: 7px 10px; border-bottom: 1px solid #e2e8f0; font-size: 9.5pt;">${item.description}</td>
                <td style="padding: 7px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 9.5pt;">${item.units !== undefined ? item.units : '-'}</td>
                <td style="padding: 7px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 9.5pt;">${item.rate !== undefined ? formatCurrency(item.rate) : '-'}</td>
                <td style="padding: 7px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; font-size: 9.5pt;">${formatCurrency(item.amount)}</td>
            </tr>
        `).join("");

        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Official Receipt - ${data.receiptNumber}</title>
            <style>
                @page {
                    size: A4 portrait;
                    margin: 12mm 15mm;
                }
                * {
                    box-sizing: border-box;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                body {
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                    color: #0f172a;
                    background: #ffffff;
                    font-size: 10pt;
                    line-height: 1.4;
                }
                .receipt-container {
                    border: 2px solid #1e3a8a;
                    border-radius: 12px;
                    padding: 24px 28px;
                    position: relative;
                    background: #ffffff;
                }
                .receipt-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 2px solid #1e3a8a;
                    padding-bottom: 16px;
                    margin-bottom: 16px;
                }
                .school-title {
                    font-size: 16pt;
                    font-weight: 900;
                    color: #1e3a8a;
                    letter-spacing: 0.5px;
                    margin: 0 0 2px 0;
                }
                .school-sub {
                    font-size: 9pt;
                    color: #475569;
                    font-weight: 600;
                    margin: 0 0 3px 0;
                }
                .school-contact {
                    font-size: 8pt;
                    color: #64748b;
                }
                .receipt-meta {
                    text-align: right;
                }
                .receipt-badge {
                    display: inline-block;
                    background: #1e3a8a;
                    color: #ffffff;
                    padding: 4px 14px;
                    border-radius: 6px;
                    font-size: 11pt;
                    font-weight: 800;
                    letter-spacing: 1px;
                    margin-bottom: 6px;
                }
                .receipt-num {
                    font-size: 12pt;
                    font-weight: 900;
                    color: #b91c1c;
                }
                .receipt-date {
                    font-size: 8.5pt;
                    color: #64748b;
                    margin-top: 2px;
                }
                .student-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px 24px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 12px 16px;
                    margin-bottom: 16px;
                    font-size: 9.5pt;
                }
                .info-row {
                    display: flex;
                    gap: 8px;
                }
                .info-label {
                    color: #64748b;
                    font-weight: 600;
                    min-width: 130px;
                }
                .info-value {
                    color: #0f172a;
                    font-weight: 700;
                }
                .particulars-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 16px;
                }
                .particulars-table th {
                    background: #1e3a8a;
                    color: #ffffff;
                    padding: 8px 10px;
                    font-size: 9pt;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .summary-container {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 20px;
                    margin-bottom: 20px;
                }
                .words-box {
                    background: #f1f5f9;
                    border-radius: 8px;
                    padding: 12px 14px;
                    border-left: 4px solid #1877f2;
                }
                .words-title {
                    font-size: 8pt;
                    text-transform: uppercase;
                    color: #64748b;
                    font-weight: 700;
                    margin-bottom: 4px;
                }
                .words-val {
                    font-size: 10pt;
                    font-weight: 800;
                    color: #1e3a8a;
                    font-style: italic;
                }
                .totals-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .totals-table td {
                    padding: 5px 8px;
                    font-size: 9.5pt;
                }
                .totals-table .total-row td {
                    border-top: 2px solid #1e3a8a;
                    border-bottom: 2px solid #1e3a8a;
                    font-size: 12pt;
                    font-weight: 900;
                    color: #1e3a8a;
                    padding: 8px;
                }
                .payment-channel-badge {
                    display: inline-block;
                    background: #e0f2fe;
                    color: #0369a1;
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-weight: 700;
                    font-size: 8.5pt;
                }
                .signatures-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                    margin-top: 24px;
                    padding-top: 14px;
                    border-top: 1px dashed #cbd5e1;
                }
                .sig-box {
                    text-align: center;
                }
                .sig-line {
                    border-bottom: 1.5px solid #0f172a;
                    margin: 36px 20px 6px 20px;
                }
                .sig-name {
                    font-weight: 800;
                    font-size: 9.5pt;
                    color: #0f172a;
                }
                .sig-title {
                    font-size: 8pt;
                    color: #64748b;
                }
                .watermark-seal {
                    position: absolute;
                    bottom: 40px;
                    right: 40px;
                    width: 90px;
                    height: 90px;
                    border: 3px dashed #1e3a8a;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    color: #1e3a8a;
                    font-size: 7pt;
                    font-weight: 900;
                    opacity: 0.15;
                    transform: rotate(-15deg);
                    pointer-events: none;
                }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <div class="watermark-seal">
                    MOBILE BIBLE<br/>OFFICIAL<br/>SEAL
                </div>

                <div class="receipt-header">
                    <div>
                        <h1 class="school-title">MOBILE BIBLE SCHOOL & THEOLOGICAL SEMINARY</h1>
                        <div class="school-sub">Office of the University Bursar & Student Financial Services</div>
                        <div class="school-contact">San Vicente Campus • Baguio City • Tel: (074) 442-0199 • billing@mobilebibleschool.edu</div>
                    </div>
                    <div class="receipt-meta">
                        <div class="receipt-badge">OFFICIAL RECEIPT</div>
                        <div class="receipt-num">№ ${data.receiptNumber}</div>
                        <div class="receipt-date">${data.transactionDate}</div>
                    </div>
                </div>

                <div class="student-grid">
                    <div class="info-row">
                        <span class="info-label">RECEIVED FROM:</span>
                        <span class="info-value">${data.studentName}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">STUDENT ID:</span>
                        <span class="info-value">${data.studentId}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">PROGRAM / DEGREE:</span>
                        <span class="info-value">${data.courseName}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">PAYMENT CHANNEL:</span>
                        <span class="info-value">
                            <span class="payment-channel-badge">${data.paymentMethod}${data.referenceNumber ? ` (Ref: ${data.referenceNumber})` : ''}</span>
                        </span>
                    </div>
                </div>

                <table class="particulars-table">
                    <thead>
                        <tr>
                            <th style="text-align: left;">PARTICULARS / SUBJECT ENROLLED</th>
                            <th style="width: 80px; text-align: center;">UNITS</th>
                            <th style="width: 120px; text-align: right;">RATE / UNIT</th>
                            <th style="width: 130px; text-align: right;">AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${particularsRows}
                    </tbody>
                </table>

                <div class="summary-container">
                    <div>
                        <div class="words-box">
                            <div class="words-title">Amount in Words</div>
                            <div class="words-val">*** ${data.amountInWords} ***</div>
                        </div>
                        ${data.notes ? `
                            <div style="margin-top: 10px; font-size: 8.5pt; color: #475569;">
                                <strong>Remarks / Notes:</strong> ${data.notes}
                            </div>
                        ` : ''}
                    </div>

                    <div>
                        <table class="totals-table">
                            <tr>
                                <td style="color: #64748b;">Subtotal Assessment:</td>
                                <td style="text-align: right; font-weight: 700;">${formatCurrency(data.subtotal)}</td>
                            </tr>
                            ${data.discount && data.discount > 0 ? `
                                <tr>
                                    <td style="color: #16a34a;">Scholarship / Discount:</td>
                                    <td style="text-align: right; font-weight: 700; color: #16a34a;">-${formatCurrency(data.discount)}</td>
                                </tr>
                            ` : ''}
                            <tr class="total-row">
                                <td>TOTAL AMOUNT PAID:</td>
                                <td style="text-align: right;">${formatCurrency(data.amountPaid)}</td>
                            </tr>
                            <tr>
                                <td style="color: #64748b; padding-top: 8px;">Previous Balance:</td>
                                <td style="text-align: right; padding-top: 8px;">${formatCurrency(data.previousBalance)}</td>
                            </tr>
                            <tr>
                                <td style="color: #b91c1c; font-weight: 800;">Remaining Balance:</td>
                                <td style="text-align: right; color: #b91c1c; font-weight: 800;">${formatCurrency(data.remainingBalance)}</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <div class="signatures-grid">
                    <div class="sig-box">
                        <div class="sig-line"></div>
                        <div class="sig-name">${data.studentName}</div>
                        <div class="sig-title">Student / Payor Acknowledgment</div>
                    </div>
                    <div class="sig-box">
                        <div class="sig-line"></div>
                        <div class="sig-name">${data.cashierName}</div>
                        <div class="sig-title">Authorized Collecting Officer / Cashier</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        this.executePrint(html);
    }

    /**
     * Executes the print by writing into an isolated iframe to bypass any app overflow/layout constraints.
     * Falls back to a clean popup window if necessary.
     */
    /**
     * Prints an official university Letter of Admission & Acceptance Offer.
     */
    public static printAdmissionAcceptanceLetter(data: AdmissionLetterData): void {
        const currentDate = new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
        const docRefNumber = `MBS-ADM-ACC-${new Date().getFullYear()}-${data.applicantCode.replace(/[^A-Za-z0-9]/g, "") || Math.floor(1000 + Math.random() * 9000)}`;

        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Official Letter of Admission - ${data.applicantName}</title>
            <style>
                @page {
                    size: A4 portrait;
                    margin: 15mm 15mm 18mm 15mm;
                }
                * {
                    box-sizing: border-box;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                body {
                    margin: 0;
                    padding: 0;
                    font-family: "Times New Roman", Times, Georgia, serif;
                    color: #0f172a;
                    font-size: 11pt;
                    line-height: 1.6;
                }
                .accent-bar {
                    height: 5px;
                    background: linear-gradient(90deg, #1e3a8a, #2563eb, #3b82f6);
                    margin-bottom: 20px;
                }
                .letter-header {
                    display: table;
                    width: 100%;
                    border-bottom: 2px solid #1e3a8a;
                    padding-bottom: 12px;
                    margin-bottom: 20px;
                }
                .header-left {
                    display: table-cell;
                    vertical-align: middle;
                }
                .header-right {
                    display: table-cell;
                    vertical-align: middle;
                    text-align: right;
                }
                .inst-name {
                    font-size: 18pt;
                    font-weight: bold;
                    color: #1e3a8a;
                    letter-spacing: 0.5px;
                    margin: 0;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
                .inst-sub {
                    font-size: 10pt;
                    color: #475569;
                    margin: 2px 0 0 0;
                    font-style: italic;
                }
                .inst-dept {
                    font-size: 8.5pt;
                    color: #64748b;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-top: 3px;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
                .badge-doc {
                    display: inline-block;
                    background: #1e3a8a;
                    color: #ffffff;
                    padding: 4px 10px;
                    font-size: 8pt;
                    font-weight: bold;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    border-radius: 4px;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
                .meta-text {
                    font-size: 8.5pt;
                    color: #475569;
                    margin-top: 4px;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
                .date-ref-row {
                    display: table;
                    width: 100%;
                    margin-bottom: 18px;
                    font-size: 10pt;
                }
                .date-col {
                    display: table-cell;
                    text-align: left;
                }
                .ref-col {
                    display: table-cell;
                    text-align: right;
                    font-family: monospace;
                    font-size: 9.5pt;
                    color: #334155;
                }
                .recipient-block {
                    margin-bottom: 20px;
                    line-height: 1.45;
                }
                .recipient-name {
                    font-weight: bold;
                    font-size: 12pt;
                    color: #0f172a;
                }
                .recipient-sub {
                    font-size: 10pt;
                    color: #334155;
                }
                .doc-banner {
                    text-align: center;
                    padding: 8px 12px;
                    background: #f8fafc;
                    border: 1px solid #cbd5e1;
                    border-radius: 4px;
                    margin-bottom: 20px;
                }
                .doc-banner h2 {
                    margin: 0;
                    font-size: 13pt;
                    font-weight: bold;
                    color: #1e3a8a;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
                .letter-body p {
                    margin: 0 0 12px 0;
                    text-align: justify;
                }
                .spec-card {
                    background: #f1f5f9;
                    border-left: 4px solid #2563eb;
                    padding: 12px 16px;
                    margin: 16px 0;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    font-size: 9.5pt;
                }
                .spec-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .spec-table td {
                    padding: 4px 6px;
                    vertical-align: top;
                }
                .spec-label {
                    width: 25%;
                    font-weight: bold;
                    color: #475569;
                    font-size: 8.5pt;
                    text-transform: uppercase;
                }
                .spec-val {
                    color: #0f172a;
                    font-weight: 600;
                }
                .sig-container {
                    display: table;
                    width: 100%;
                    margin-top: 36px;
                    page-break-inside: avoid;
                }
                .sig-col {
                    display: table-cell;
                    width: 50%;
                    vertical-align: top;
                }
                .sig-box {
                    width: 230px;
                }
                .sig-line {
                    border-bottom: 1.5px solid #0f172a;
                    margin-bottom: 6px;
                    height: 40px;
                }
                .sig-name {
                    font-weight: bold;
                    font-size: 10pt;
                    color: #0f172a;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
                .sig-title {
                    font-size: 8.5pt;
                    color: #475569;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
                .footer-notice {
                    margin-top: 26px;
                    padding-top: 8px;
                    border-top: 1px solid #e2e8f0;
                    font-size: 8pt;
                    color: #64748b;
                    display: table;
                    width: 100%;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
                .footer-left {
                    display: table-cell;
                    text-align: left;
                }
                .footer-right {
                    display: table-cell;
                    text-align: right;
                }
            </style>
        </head>
        <body>
            <div class="accent-bar"></div>

            <div class="letter-header">
                <div class="header-left">
                    <h1 class="inst-name">MOBILE BIBLE SCHOOL</h1>
                    <div class="inst-sub">Theological Seminary & Institute of Christian Leadership</div>
                    <div class="inst-dept">Office of Admissions and the University Registrar</div>
                </div>
                <div class="header-right">
                    <div class="badge-doc">OFFICIAL NOTICE OF ACCEPTANCE</div>
                    <div class="meta-text">A.Y. 2026–2027 • Regular Intake</div>
                </div>
            </div>

            <div class="date-ref-row">
                <div class="date-col">${currentDate}</div>
                <div class="ref-col">Ref: ${docRefNumber}</div>
            </div>

            <div class="recipient-block">
                <div class="recipient-name">${data.applicantName}</div>
                <div class="recipient-sub">Applicant Code: <strong>${data.applicantCode}</strong></div>
                ${data.address ? `<div class="recipient-sub">${data.address}</div>` : ""}
                ${data.email || data.contactNumber ? `<div class="recipient-sub">${data.email || ""} • ${data.contactNumber || ""}</div>` : ""}
            </div>

            <div class="doc-banner">
                <h2>OFFICIAL LETTER OF ADMISSION & ACCEPTANCE</h2>
            </div>

            <div class="letter-body">
                <p>Dear <strong>${data.applicantName}</strong>,</p>

                <p>
                    On behalf of the Board of Admissions, the Academic Council, and the Faculty of Mobile Bible School & Seminary,
                    we are delighted to inform you that you have been granted <strong>OFFICIAL ADMISSION</strong> to the program of study indicated below for 
                    <strong>${data.admittedTerm || "Academic Year 2026–2027 (1st Semester)"}</strong>.
                </p>

                <p>
                    Your application, academic credentials, and diagnostic evaluation have been thoroughly appraised. 
                    The Admissions Committee was highly impressed with your spiritual calling, ministerial dedication, and scholastic aptitude.
                </p>

                <div class="spec-card">
                    <table class="spec-table">
                        <tr>
                            <td class="spec-label">ADMITTED PROGRAM:</td>
                            <td class="spec-val" style="color: #1e3a8a; font-size: 11pt;">${data.program}</td>
                        </tr>
                        <tr>
                            <td class="spec-label">MODE OF LEARNING:</td>
                            <td class="spec-val">${data.modeOfLearning}</td>
                        </tr>
                        <tr>
                            <td class="spec-label">APPLICANT TYPE:</td>
                            <td class="spec-val">${data.applicantType || "Freshman / First-Time College"}</td>
                        </tr>
                        ${data.examScore ? `
                        <tr>
                            <td class="spec-label">SCREENING RATING:</td>
                            <td class="spec-val" style="color: #15803d;">Entrance Evaluation: ${data.examScore} ${data.interviewRating ? `• Interview: ${data.interviewRating}` : ""}</td>
                        </tr>
                        ` : ""}
                        <tr>
                            <td class="spec-label">ADMISSION STATUS:</td>
                            <td class="spec-val" style="color: #15803d; font-weight: 800;">OFFICIALLY ACCEPTED & CLEARED</td>
                        </tr>
                    </table>
                </div>

                <p>
                    To confirm your enrollment, please present this Official Notice of Acceptance along with any remaining document requirements to the Office of the Registrar. 
                    You may then proceed with formal course subject enlistment, academic orientation, and receipt of your official Student Identification Number.
                </p>

                <p>
                    We welcome you to our academic community of faith, scholarship, and ministry. 
                    May the Lord richly bless your theological journey as you prepare for Kingdom leadership.
                </p>

                <p style="margin-top: 18px;">
                    Respectfully in Christ,
                </p>
            </div>

            <div class="sig-container">
                <div class="sig-col">
                    <div class="sig-box">
                        <div class="sig-line"></div>
                        <div class="sig-name">Dr. Samuel Vance, Th.D.</div>
                        <div class="sig-title">Dean of Academic Affairs</div>
                    </div>
                </div>
                <div class="sig-col" style="text-align: right;">
                    <div class="sig-box" style="margin-left: auto;">
                        <div class="sig-line"></div>
                        <div class="sig-name">Clarissa Mendez, M.Ed.</div>
                        <div class="sig-title">Director of Admissions & University Registrar</div>
                    </div>
                </div>
            </div>

            <div class="footer-notice">
                <div class="footer-left">
                    <span>Mobile Bible School Admissions & Registrar Office • Main Campus • Accreditation Verified</span>
                </div>
                <div class="footer-right">
                    <span>Security Document ID: ${docRefNumber}</span>
                </div>
            </div>
        </body>
        </html>
        `;

        this.executePrint(html);
    }

    private static executePrint(html: string): void {
        try {
            let iframe = document.getElementById("school-print-frame") as HTMLIFrameElement | null;
            if (!iframe) {
                iframe = document.createElement("iframe");
                iframe.id = "school-print-frame";
                iframe.style.position = "fixed";
                iframe.style.right = "0";
                iframe.style.bottom = "0";
                iframe.style.width = "0";
                iframe.style.height = "0";
                iframe.style.border = "none";
                document.body.appendChild(iframe);
            }

            const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
            if (frameDoc && iframe.contentWindow) {
                frameDoc.open();
                frameDoc.write(html);
                frameDoc.close();

                // Wait for styles and DOM to settle
                setTimeout(() => {
                    iframe?.contentWindow?.focus();
                    iframe?.contentWindow?.print();
                }, 350);
                return;
            }
        } catch (e) {
            console.warn("Iframe printing failed, falling back to window.open", e);
        }

        // Fallback: Open in dedicated print window
        const win = window.open("", "_blank", "width=1000,height=800,scrollbars=yes,resizable=yes");
        if (win) {
            win.document.open();
            win.document.write(html);
            win.document.close();
            setTimeout(() => {
                win.focus();
                win.print();
            }, 400);
        } else {
            alert("Please allow pop-ups for this website to print official school documents.");
        }
    }
}
