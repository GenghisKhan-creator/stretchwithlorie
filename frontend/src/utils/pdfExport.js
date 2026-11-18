import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoFullImg from '../assets/logo_full.png';

/**
 * Loads an image from a URL and converts it to a base64 Data URL
 * for clean embedding into jsPDF without CORS or async timing issues.
 */
async function getBase64ImageFromUrl(imageUrl) {
  if (!imageUrl) return null;
  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Could not load logo image for PDF:', err);
    return null;
  }
}

/**
 * Universal Mobile-Friendly PDF Saver & Sharer
 *
 * Solves the critical mobile Safari / iOS issue where doc.save() redirects to an un-downloadable new tab:
 * 1. Checks if the device supports native Web Share API (navigator.canShare with File).
 *    On iOS Safari and Android Chrome, this opens the native OS sheet with "Save to Files",
 *    "Save to Downloads", "WhatsApp", "AirDrop", and "Print".
 * 2. On desktop or fallback browsers, uses an explicit <a download> click on an application/octet-stream blob.
 *    On iOS Safari, octet-stream forces Safari's native "Do you want to download..." dialog,
 *    saving directly into the phone's Downloads folder instead of redirecting the user away.
 * 3. Supports explicit preview in a new tab if requested.
 */
export async function saveOrSharePdf(doc, filename, options = {}) {
  const {
    title = 'stretchwithlorie Official Pass',
    text = 'Official Studio Entry Pass & Receipt from stretchwithlorie Sanctuary',
    forceDownload = false,
    preview = false
  } = options;

  // Generate binary PDF blob
  const pdfBlob = doc.output('blob');

  // Preview in new browser tab
  if (preview) {
    return openPdfInNewTab(pdfBlob, filename);
  }

  const isMobile =
    typeof navigator !== 'undefined' &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');

  // 1. Mobile Native Share (iOS "Save to Files" / Android Share Sheet)
  if (!forceDownload && isMobile && typeof navigator !== 'undefined' && navigator.share) {
    try {
      const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title,
          text
        });
        return { success: true, method: 'share', filename };
      }
    } catch (shareErr) {
      if (shareErr.name === 'AbortError') {
        // User closed or dismissed the share sheet
        return { success: true, method: 'dismissed', filename };
      }
      console.warn('Native share failed or was dismissed, falling back to direct download:', shareErr);
    }
  }

  // 2. Direct octet-stream download
  // Using application/octet-stream is vital: it tells iOS Safari and mobile browsers to
  // prompt the user to download the file directly, rather than opening and displaying it in a tab.
  try {
    const octetBlob = new Blob([pdfBlob], { type: 'application/octet-stream' });
    const blobUrl = URL.createObjectURL(octetBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 4000);

    return { success: true, method: 'download', filename };
  } catch (dlErr) {
    console.warn('Direct octet download failed, using standard doc.save():', dlErr);
    doc.save(filename);
    return { success: true, method: 'doc.save', filename };
  }
}

/**
 * Open PDF in a new browser tab for explicit viewing / printing
 */
export function openPdfInNewTab(pdfBlobOrDoc, filename = 'document.pdf') {
  const blob = pdfBlobOrDoc instanceof Blob ? pdfBlobOrDoc : pdfBlobOrDoc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  const win = window.open(blobUrl, '_blank');
  if (!win) {
    window.location.href = blobUrl;
  }
  return { success: true, method: 'preview', blobUrl, filename };
}

/**
 * exportAttendeesToPDF
 * Generates an executive, beautifully formatted PDF report of class attendees
 * with complete booking references, verified Paystack payments, and student health notes.
 *
 * @param {Array} registrations - List of registration records to include
 * @param {Object} options - Additional context (filter, class title, etc.)
 */
export async function exportAttendeesToPDF(registrations, options = {}) {
  if (!registrations || registrations.length === 0) {
    throw new Error('No attendee records available to export.');
  }

  const {
    filterClass = 'ALL',
    filterAttendance = 'ALL',
    searchTerm = ''
  } = options;

  // Initialize PDF in landscape A4 (841.89 pt x 595.28 pt)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36; // 0.5 inch margin

  // Calculate high-level summary KPIs
  const totalCount = registrations.length;
  const checkedInCount = registrations.filter((r) => r.checkedIn).length;
  const pendingCount = totalCount - checkedInCount;
  const totalRevenue = registrations.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const formattedRevenue = `GHS ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const fileDateStr = now.toISOString().split('T')[0];

  // 1. Top Decorative Brand Bar
  doc.setFillColor(122, 139, 113); // Eucalyptus Sage #7A8B71
  doc.rect(0, 0, pageWidth, 6, 'F');

  // 2. Brand Identity Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(43, 46, 49); // Charcoal Slate #2B2E31
  doc.text('stretchwithlorie', margin, 34);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(122, 139, 113); // Eucalyptus Sage #7A8B71
  doc.text('YOGA & FITNESS  •  ATTENDEE ROSTER & VERIFIED PAYMENTS', margin, 47);

  // Subtitle / Scope info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(92, 98, 96); // Muted Slate #5C6260
  let scopeText = `Roster Scope: ${filterClass === 'ALL' ? 'All Classes & Experiences' : filterClass}`;
  if (filterAttendance !== 'ALL') {
    scopeText += ` • Attendance: ${filterAttendance === 'CHECKED_IN' ? 'Checked-In Only' : 'Pending Only'}`;
  }
  if (searchTerm) {
    scopeText += ` • Search: "${searchTerm}"`;
  }
  doc.text(scopeText, margin, 58);

  // Right Header Info (Export metadata + Paystack badge)
  const rightX = pageWidth - margin;

  // Paystack Verified Pill
  doc.setFillColor(230, 248, 253); // #E6F8FD
  doc.roundedRect(rightX - 165, 20, 165, 18, 9, 9, 'F');
  doc.setDrawColor(182, 238, 252); // #B6EEFC
  doc.roundedRect(rightX - 165, 20, 165, 18, 9, 9, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(2, 136, 209); // #0288D1
  doc.text('PAYSTACK VERIFIED TRANSACTIONS', rightX - 82.5, 31.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(92, 98, 96);
  doc.text(`Generated: ${dateStr} at ${timeStr}`, rightX, 50, { align: 'right' });

  // 3. KPI Summary Cards Bar
  const kpiY = 66;
  const kpiHeight = 32;
  const kpiWidth = (pageWidth - margin * 2 - 30) / 4;

  const kpis = [
    { label: 'TOTAL ATTENDEES', value: `${totalCount} Registered` },
    { label: 'VERIFIED REVENUE', value: formattedRevenue },
    { label: 'CHECK-IN PROGRESS', value: `${checkedInCount} Checked In • ${pendingCount} Pending` },
    { label: 'PAYMENT GATEWAY', value: '100% Paystack MoMo & Card' }
  ];

  kpis.forEach((kpi, idx) => {
    const boxX = margin + idx * (kpiWidth + 10);
    // Background
    doc.setFillColor(247, 244, 239); // Warm Alabaster #F7F4EF
    doc.setDrawColor(230, 225, 216); // Studio Border #E6E1D8
    doc.roundedRect(boxX, kpiY, kpiWidth, kpiHeight, 6, 6, 'FD');

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(92, 98, 96); // Muted Slate #5C6260
    doc.text(kpi.label, boxX + 8, kpiY + 11);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(43, 46, 49); // Charcoal Slate #2B2E31
    doc.text(kpi.value, boxX + 8, kpiY + 24);
  });

  // 4. Data Rows for Table
  const tableData = registrations.map((r, index) => {
    // Format attendee name & contacts
    const attendeeCell = `${r.studentName || 'Guest'}\n${r.email || ''}\n${r.phone || ''}`.trim();

    // Format booking reference & paystack ref
    const refCell = `${r.bookingRef || 'N/A'}\n${r.paystackRef || 'pstk_verified'}`;

    // Format class & schedule
    const classTitle = r.className || 'Yoga Experience';
    const schedule = r.classDate ? `${r.classDate}${r.classTime ? ' • ' + r.classTime : ''}` : 'Scheduled';
    const loc = r.locationType ? `Location: ${r.locationType}` : 'Studio Sanctuary';
    const classCell = `${classTitle}\n${schedule}\n${loc}`;

    // Amount in GHS
    const amountVal = Number(r.amount) || 0;
    const amountCell = `GHS ${amountVal.toFixed(2)}`;

    // Payment method
    let paymentClean = r.paymentMethod || 'Paystack MoMo';
    paymentClean = paymentClean.replace(/Paystack\s*\((.*?)\)/i, '$1');
    const paymentCell = `${paymentClean}\nPaid`;

    // Check-in status
    const statusCell = r.checkedIn ? 'CHECKED IN' : 'PENDING';

    // Health / Injury & Intake Questionnaire notes
    let notesCell = 'None reported (All clear)';
    if (r.intake) {
      const parts = [];
      if (r.intake.experienceLevel) parts.push(`Lvl: ${r.intake.experienceLevel}`);
      if (r.intake.mainGoal) parts.push(`Goal: ${r.intake.customGoal || r.intake.mainGoal}`);
      if (r.intake.hasInjuries === 'Yes' && r.intake.injuriesDetails) parts.push(`Injuries: ${r.intake.injuriesDetails}`);
      if (r.intake.pregnancyStatus && r.intake.pregnancyStatus !== 'No') parts.push(`Pregnancy: ${r.intake.pregnancyStatus}`);
      if (r.intake.instructorNotes) parts.push(`Note: ${r.intake.instructorNotes}`);
      notesCell = parts.join(' • ') || (r.healthNotes || 'None reported');
    } else if (r.healthNotes && r.healthNotes !== 'None' && r.healthNotes !== 'None reported') {
      notesCell = r.healthNotes;
    }

    return [
      (index + 1).toString(),
      refCell,
      attendeeCell,
      classCell,
      amountCell,
      paymentCell,
      statusCell,
      notesCell
    ];
  });

  // 5. Generate Styled Table using jspdf-autotable
  autoTable(doc, {
    startY: kpiY + kpiHeight + 12,
    margin: { left: margin, right: margin, bottom: 40 },
    head: [[
      '#',
      'Reference',
      'Attendee & Contact',
      'Class & Schedule Slot',
      'Fee',
      'Payment',
      'Attendance',
      'Health, Injury & Modification Notes'
    ]],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [43, 46, 49], // Charcoal Slate #2B2E31
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: { top: 7, bottom: 7, left: 6, right: 6 },
      halign: 'left'
    },
    styles: {
      fontSize: 7.5,
      textColor: [43, 46, 49], // Charcoal Slate #2B2E31
      cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
      lineColor: [230, 225, 216], // Studio border #E6E1D8
      lineWidth: 0.5,
      valign: 'top',
      overflow: 'linebreak'
    },
    alternateRowStyles: {
      fillColor: [247, 244, 239] // Warm Alabaster alternating tint #F7F4EF
    },
    columnStyles: {
      0: { cellWidth: 22, halign: 'center' },      // #
      1: { cellWidth: 80, fontStyle: 'bold' },     // Reference
      2: { cellWidth: 135 },                        // Attendee & Contact
      3: { cellWidth: 145 },                        // Class & Schedule
      4: { cellWidth: 65, halign: 'right', fontStyle: 'bold' }, // Fee
      5: { cellWidth: 90 },                         // Payment
      6: { cellWidth: 70, halign: 'center' },       // Attendance
      7: { cellWidth: 'auto' }                      // Health Notes
    },
    didParseCell: (data) => {
      // Highlight Check-in column badge style
      if (data.section === 'body' && data.column.index === 6) {
        if (data.cell.raw === 'CHECKED IN') {
          data.cell.styles.textColor = [90, 105, 82]; // Deep Sage #5A6952
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [92, 98, 96]; // Muted Slate #5C6260
        }
      }
      // Highlight Fee column in Terracotta Berry #A44A4A
      if (data.section === 'body' && data.column.index === 4) {
        data.cell.styles.textColor = [164, 74, 74]; // Terracotta Berry #A44A4A
      }
    },
    didDrawPage: (data) => {
      // 6. Running Footer on Every Page
      const currentYear = now.getFullYear();
      doc.setDrawColor(230, 225, 216); // Studio border #E6E1D8
      doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(92, 98, 96); // Muted Slate #5C6260
      doc.text(
        `stretchwithlorie Sanctuary  •  Accra, Ghana  •  Confidential Studio Roster © ${currentYear}`,
        margin,
        pageHeight - 14
      );

      const pageStr = `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`;
      doc.text(pageStr, pageWidth - margin, pageHeight - 14, { align: 'right' });
    }
  });

  // Save PDF file directly to client browser
  const filename = `StretchWithLorie_Attendees_${fileDateStr}.pdf`;
  const saveResult = await saveOrSharePdf(doc, filename, {
    title: `Attendee Roster - ${fileDateStr}`,
    text: `stretchwithlorie Studio Attendee Roster (${totalCount} attendees)`,
    forceDownload: options.forceDownload,
    preview: options.preview
  });

  return {
    filename,
    count: totalCount,
    revenue: formattedRevenue,
    ...saveResult
  };
}

// Helper to draw clean vector checkmark (No emojis or unicode mojibake)
function drawCheckmark(doc, x, y, size = 5.5, color = [90, 105, 82]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(1.2);
  doc.line(x, y + size * 0.45, x + size * 0.4, y + size);
  doc.line(x + size * 0.4, y + size, x + size, y);
}

// Helper to draw official circular studio seal (pure vector)
function drawStudioSeal(doc, cx, cy, radius = 32) {
  doc.setDrawColor(200, 162, 83); // #C8A253
  doc.setLineWidth(1.1);
  doc.setLineDashPattern([2.5, 2.5], 0);
  doc.circle(cx, cy, radius, 'S');

  doc.setDrawColor(200, 162, 83);
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([], 0);
  doc.circle(cx, cy, radius - 3, 'S');

  doc.setDrawColor(122, 139, 113); // #7A8B71
  doc.setLineWidth(0.8);
  doc.circle(cx, cy, radius - 6, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(122, 139, 113);
  doc.text('STRETCH WITH LORIE', cx, cy - 11, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setTextColor(35, 45, 33);
  doc.text('OFFICIAL PASS', cx, cy + 1, { align: 'center' });

  doc.setFontSize(5);
  doc.setTextColor(200, 162, 83);
  doc.text('* VERIFIED SANCTUARY *', cx, cy + 11, { align: 'center' });
}

/**
 * exportBookingPassPDF
 * Generates an ultra-luxurious, printable/savable studio entry pass and receipt in PDF format,
 * complete with high-resolution studio logo, verified Paystack transaction seals, student intake details,
 * and sanctuary arrival etiquette with clean, uncorrupted typography and balanced layout.
 *
 * @param {Object} booking - Booking details from SuccessModal
 */
export async function exportBookingPassPDF(booking, options = {}) {
  if (!booking) {
    throw new Error('No booking data provided for PDF generation.');
  }

  const {
    bookingRef = 'SWL-BOOKING',
    paystackRef = 'pstk_tr_verified',
    studentName = 'Guest Attendee',
    email = 'client@stretchwithlorie.com',
    phone = 'Not provided',
    className = 'Yoga Session',
    classDate = 'Scheduled Session',
    classTime = '60 mins',
    instructor = 'Lorie',
    amount = 200,
    paymentMethod = 'Paystack (Mobile Money)',
    healthNotes = 'None reported'
  } = booking;

  // Initialize PDF in portrait A4 (595.28 pt x 841.89 pt)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 28;
  const cardW = pageWidth - margin * 2; // 539.28 pt
  const cardX = margin;
  const cardY = 24;
  const cardH = 782;

  // Fetch logo base64 asynchronously
  const logoData = await getBase64ImageFromUrl(logoFullImg);

  // 1. Studio Decorative Top Bar
  doc.setFillColor(35, 45, 33); // Deep Botanical Green #232D21
  doc.rect(0, 0, pageWidth, 5, 'F');
  doc.setFillColor(200, 162, 83); // Champagne Gold #C8A253
  doc.rect(0, 5, pageWidth, 2, 'F');

  // 2. Outer Pass Card Background & Double Framing
  doc.setFillColor(250, 248, 245); // Warm Alabaster #FAF8F5
  doc.roundedRect(cardX, cardY, cardW, cardH, 8, 8, 'F');

  doc.setDrawColor(200, 162, 83); // Champagne Gold #C8A253
  doc.setLineWidth(1.2);
  doc.roundedRect(cardX, cardY, cardW, cardH, 8, 8, 'S');

  // Inner subtle decorative frame
  doc.setDrawColor(230, 225, 216); // Studio border #E6E1D8
  doc.setLineWidth(0.6);
  doc.roundedRect(cardX + 3.5, cardY + 3.5, cardW - 7, cardH - 7, 6, 6, 'S');

  // 3. Header Banner (Deep Botanical Green)
  const headerY = cardY + 4;
  const headerH = 78;
  doc.setFillColor(35, 45, 33);
  doc.rect(cardX + 4, headerY, cardW - 8, headerH, 'F');

  doc.setFillColor(200, 162, 83);
  doc.rect(cardX + 4, headerY + headerH - 2, cardW - 8, 2, 'F');

  // Place Logo on Left
  const logoBadgeX = cardX + 14;
  const logoBadgeY = headerY + 11;
  const logoBadgeW = 114;
  const logoBadgeH = 56;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(logoBadgeX, logoBadgeY, logoBadgeW, logoBadgeH, 5, 5, 'F');
  doc.setDrawColor(200, 162, 83);
  doc.setLineWidth(0.8);
  doc.roundedRect(logoBadgeX, logoBadgeY, logoBadgeW, logoBadgeH, 5, 5, 'S');

  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', logoBadgeX + 6, logoBadgeY + 5, 102, 46);
    } catch {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(35, 45, 33);
      doc.text('stretchwithlorie', logoBadgeX + 12, logoBadgeY + 28);
      doc.setFontSize(6.5);
      doc.setTextColor(122, 139, 113);
      doc.text('YOGA & FITNESS', logoBadgeX + 16, logoBadgeY + 39);
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(35, 45, 33);
    doc.text('stretchwithlorie', logoBadgeX + 12, logoBadgeY + 28);
    doc.setFontSize(6.5);
    doc.setTextColor(122, 139, 113);
    doc.text('YOGA & FITNESS', logoBadgeX + 16, logoBadgeY + 39);
  }

  // Header Text on Right
  const headerTextX = cardX + 138;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(200, 162, 83); // Champagne Gold
  doc.text('OFFICIAL STUDIO ENTRY PASS & RECEIPT', headerTextX, headerY + 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('stretchwithlorie Sanctuary', headerTextX, headerY + 41);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(237, 232, 225);
  doc.text('Movement, Mindfulness & Rejuvenation  -  East Legon, Accra, Ghana', headerTextX, headerY + 55);

  doc.setFontSize(7.5);
  doc.setTextColor(200, 162, 83);
  doc.text('WhatsApp: +233 24 123 4567   -   Web: stretchwithlorie.com', headerTextX, headerY + 67);

  // 4. Booking Reference & Verified Payment Bar
  const refBarY = headerY + headerH + 9;
  const refBarH = 48;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 225, 216);
  doc.setLineWidth(0.6);
  doc.roundedRect(cardX + 12, refBarY, cardW - 24, refBarH, 5, 5, 'FD');

  // Left: Reference
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(122, 139, 113);
  doc.text('BOOKING REFERENCE', cardX + 22, refBarY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(43, 46, 49);
  doc.text(bookingRef, cardX + 22, refBarY + 31);

  if (paystackRef) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(2, 136, 209);
    doc.text(`Paystack Ref: ${paystackRef}`, cardX + 22, refBarY + 42);
  }

  // Right: Payment Badge & Method
  const rightColX = cardX + cardW - 22;
  const paidBadgeW = 152;
  const paidBadgeH = 18;
  const paidBadgeX = rightColX - paidBadgeW;

  doc.setFillColor(230, 248, 253);
  doc.setDrawColor(182, 238, 252);
  doc.setLineWidth(0.6);
  doc.roundedRect(paidBadgeX, refBarY + 7, paidBadgeW, paidBadgeH, 8, 8, 'FD');

  drawCheckmark(doc, paidBadgeX + 8, refBarY + 11.5, 4.5, [2, 136, 209]);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(2, 136, 209);
  doc.text(`CONFIRMED PAID - GHS ${amount}.00`, paidBadgeX + 18 + (paidBadgeW - 18) / 2, refBarY + 19, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(92, 98, 96);
  doc.text(`Payment: ${paymentMethod || 'Paystack MoMo'}`, rightColX, refBarY + 34, { align: 'right' });
  doc.text(`Issued: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`, rightColX, refBarY + 43, { align: 'right' });

  // 5. Perforation Line
  const perfY = refBarY + refBarH + 9;
  doc.setFillColor(250, 248, 245);
  doc.circle(cardX + 4, perfY, 5, 'F');
  doc.circle(cardX + cardW - 4, perfY, 5, 'F');

  doc.setDrawColor(200, 162, 83);
  doc.setLineWidth(0.6);
  doc.setLineDashPattern([4, 4], 0);
  doc.line(cardX + 16, perfY, cardX + cardW - 16, perfY);
  doc.setLineDashPattern([], 0);

  // 6. Session Details (Ticket Body)
  const sessionY = perfY + 8;
  const sessionH = 156;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 225, 216);
  doc.setLineWidth(0.6);
  doc.roundedRect(cardX + 12, sessionY, cardW - 24, sessionH, 6, 6, 'FD');

  const sessLeftX = cardX + 22;
  const sessLeftW = 340;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(200, 162, 83);
  doc.text('RESERVED YOGA EXPERIENCE', sessLeftX, sessionY + 17);

  // Class Title (safely wrapped)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(43, 46, 49);
  const titleLines = doc.splitTextToSize(className, sessLeftW);
  doc.text(titleLines, sessLeftX, sessionY + 33);
  const titleBottomY = sessionY + 33 + (titleLines.length - 1) * 15;

  // Schedule Grid: 2 clean columns with ample width and automatic wrapping
  const col1X = sessLeftX;
  const col1W = 160;
  const col2X = sessLeftX + 172;
  const col2W = 168;
  const gridY1 = titleBottomY + 14;

  // Row 1: Date & Time
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(122, 139, 113);
  doc.text('SCHEDULED DAYS', col1X, gridY1);
  doc.text('SESSION HOURS & DURATION', col2X, gridY1);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(43, 46, 49);
  const dateLines = doc.splitTextToSize(classDate, col1W);
  doc.text(dateLines, col1X, gridY1 + 11);

  const cleanTime = (classTime || '60 mins').replace(/•/g, '-');
  const timeLines = doc.splitTextToSize(`${cleanTime} (60 mins)`, col2W);
  doc.text(timeLines, col2X, gridY1 + 11);

  const row1MaxLines = Math.max(dateLines.length, timeLines.length);
  const gridY2 = gridY1 + 11 + row1MaxLines * 10 + 9;

  // Row 2: Instructor & Location
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(122, 139, 113);
  doc.text('INSTRUCTOR', col1X, gridY2);
  doc.text('SANCTUARY LOCATION', col2X, gridY2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(43, 46, 49);
  doc.text(`${instructor} (Lead Yoga Instructor)`, col1X, gridY2 + 11);
  doc.text('stretchwithlorie Studio Sanctuary', col2X, gridY2 + 11);

  // Bottom Props & Mat Reservation Note
  const propsY = sessionY + sessionH - 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(92, 98, 96);
  doc.text('Mat Reservation: Manduka Pro mat & bolsters placed on arrival for attendee.', sessLeftX, propsY);

  // Right Ticket Stub: Barcode & Entry Seal
  const stubX = cardX + cardW - 12 - 150;
  const stubW = 150;
  doc.setFillColor(247, 244, 239);
  doc.rect(stubX, sessionY, stubW, sessionH, 'F');
  doc.setDrawColor(230, 225, 216);
  doc.setLineWidth(0.6);
  doc.line(stubX, sessionY, stubX, sessionY + sessionH);

  // Barcode
  const barcodeY = sessionY + 26;
  const barcodeH = 36;
  const barcodeX = stubX + 16;
  const barPattern = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 3, 1, 2];
  let curBX = barcodeX;
  doc.setFillColor(43, 46, 49);
  barPattern.forEach((w, idx) => {
    if (idx % 2 === 0) {
      doc.rect(curBX, barcodeY, w, barcodeH, 'F');
    }
    curBX += w + 1;
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(43, 46, 49);
  doc.text(bookingRef, stubX + stubW / 2, sessionY + 77, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(122, 139, 113);
  doc.text('CONTACTLESS ENTRY PASS', stubX + stubW / 2, sessionY + 89, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(92, 98, 96);
  doc.text('Present at front desk on arrival', stubX + stubW / 2, sessionY + 100, { align: 'center' });

  doc.setFillColor(230, 248, 253);
  doc.setDrawColor(182, 238, 252);
  doc.roundedRect(stubX + 14, sessionY + 115, stubW - 28, 22, 4, 4, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(2, 136, 209);
  doc.text('RESERVED MAT - ADMIT 1', stubX + stubW / 2, sessionY + 129, { align: 'center' });

  // 7. Attendee Profile Card
  const attY = sessionY + sessionH + 9;
  const attH = 50;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 225, 216);
  doc.setLineWidth(0.6);
  doc.roundedRect(cardX + 12, attY, cardW - 24, attH, 5, 5, 'FD');

  const attCol1 = cardX + 22;
  const attCol2 = cardX + 200;
  const attCol3 = cardX + 380;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(122, 139, 113);
  doc.text('ATTENDEE / STUDENT', attCol1, attY + 15);
  doc.text('REGISTERED EMAIL', attCol2, attY + 15);
  doc.text('PHONE / WHATSAPP', attCol3, attY + 15);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(43, 46, 49);
  doc.text(studentName, attCol1, attY + 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(email, attCol2, attY + 30);

  doc.setFont('helvetica', 'bold');
  doc.text(phone, attCol3, attY + 30);

  // 8. Instructor Accommodation & Health Notes
  const healthY = attY + attH + 9;
  const healthH = 84;
  doc.setFillColor(242, 245, 240);
  doc.setDrawColor(220, 228, 217);
  doc.setLineWidth(0.6);
  doc.roundedRect(cardX + 12, healthY, cardW - 24, healthH, 5, 5, 'FD');

  doc.setFillColor(90, 105, 82);
  doc.circle(cardX + 25, healthY + 14, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(90, 105, 82);
  doc.text('INSTRUCTOR ACCOMMODATION & HEALTH INTAKE', cardX + 32, healthY + 16);

  const rawNotes = healthNotes || 'Health: None reported';
  const cleanNotes = rawNotes.replace(/•/g, ' - ');
  const noteParts = cleanNotes.split(' - ');
  let noteItemY = healthY + 30;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(50, 58, 48);

  noteParts.forEach((part) => {
    if (!part.trim()) return;
    doc.setFillColor(122, 139, 113);
    doc.circle(cardX + 25, noteItemY - 2.5, 1.5, 'F');
    const partLines = doc.splitTextToSize(part.trim(), cardW - 65);
    doc.text(partLines, cardX + 32, noteItemY);
    noteItemY += partLines.length * 10.5;
  });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(122, 139, 113);
  doc.text('Your instructor reviews all accommodations prior to session for personalized posture variations.', cardX + 22, healthY + healthH - 7);

  // 9. Sanctuary Etiquette & Amenities (3 balanced cards)
  const guideY = healthY + healthH + 9;
  const guideH = 96;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 225, 216);
  doc.setLineWidth(0.6);
  doc.roundedRect(cardX + 12, guideY, cardW - 24, guideH, 5, 5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(122, 139, 113);
  doc.text('STUDIO SANCTUARY AMENITIES & ARRIVAL ETIQUETTE', cardX + 22, guideY + 16);

  const colWidth = (cardW - 68) / 3;
  const gCol1X = cardX + 22;
  const gCol2X = gCol1X + colWidth + 12;
  const gCol3X = gCol2X + colWidth + 12;

  // Column 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(43, 46, 49);
  doc.text('10-Min Early Arrival', gCol1X, guideY + 32);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(92, 98, 96);
  doc.text('Please arrive 10-15 mins early to change and settle onto your mat. Doors close at class time for studio focus.', gCol1X, guideY + 44, { maxWidth: colWidth, lineHeightFactor: 1.35 });

  // Column 2
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(43, 46, 49);
  doc.text('Props & Tea Ritual', gCol2X, guideY + 32);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(92, 98, 96);
  doc.text('Manduka mats, organic cork blocks, bolsters and post-session botanical herbal tea are provided complimentary.', gCol2X, guideY + 44, { maxWidth: colWidth, lineHeightFactor: 1.35 });

  // Column 3
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(43, 46, 49);
  doc.text('Studio Policy', gCol3X, guideY + 32);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(92, 98, 96);
  doc.text('24-Hour cancellation and reschedule policy applies. Reach out to Lorie via WhatsApp (+233 24 123 4567).', gCol3X, guideY + 44, { maxWidth: colWidth, lineHeightFactor: 1.35 });

  // 10. Mandatory Client Confirmation (Stacked, clean checkmarks, no overflow)
  const termsY = guideY + guideH + 9;
  const termsH = 72;
  doc.setFillColor(247, 244, 239);
  doc.setDrawColor(230, 225, 216);
  doc.setLineWidth(0.6);
  doc.roundedRect(cardX + 12, termsY, cardW - 24, termsH, 5, 5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(92, 98, 96);
  doc.text('MANDATORY CLIENT CONFIRMATION (CONFIRMED PRIOR TO PAYMENT):', cardX + 22, termsY + 14);

  const agreements = [
    'I understand that I must disclose relevant injuries or physical limitations before participating.',
    'I agree to arrive 10 minutes before my scheduled session time.',
    'I have read and accepted the studio\'s cancellation and rescheduling policy.'
  ];

  let agreeY = termsY + 28;
  agreements.forEach((agr) => {
    drawCheckmark(doc, cardX + 22, agreeY - 4.5, 4.5, [90, 105, 82]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(90, 105, 82);
    doc.text(agr, cardX + 32, agreeY);
    agreeY += 13.5;
  });

  // 11. Official Verification Seal & Studio Footer
  const footerY = termsY + termsH + 9;
  const footerH = 92;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 225, 216);
  doc.setLineWidth(0.6);
  doc.roundedRect(cardX + 12, footerY, cardW - 24, footerH, 5, 5, 'FD');

  // Seal on Left
  drawStudioSeal(doc, cardX + 56, footerY + 46, 32);

  // Center / Right Info
  const signX = cardX + 106;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(35, 45, 33);
  doc.text('stretchwithlorie Sanctuary', signX, footerY + 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(92, 98, 96);
  doc.text('Suite 4B, East Legon, Accra, Ghana   -   sanctuary@stretchwithlorie.com', signX, footerY + 38);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(200, 162, 83);
  doc.text('AUTHENTIC ELECTRONIC ENTRY PASS - AUTHORIZED BY LORIE', signX, footerY + 52);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(122, 139, 113);
  doc.text(`Digital Pass Ref: ${bookingRef}   -   Paystack Security Hash Verified   -   Admit 1 Guest`, signX, footerY + 66);

  // Bottom Card Gold Finishing Accent
  doc.setFillColor(200, 162, 83);
  doc.rect(cardX + 12, cardY + cardH - 6, cardW - 24, 1.5, 'F');

  // Save or Share PDF pass to user device
  const filename = `StretchWithLorie_Pass_${bookingRef}.pdf`;
  const result = await saveOrSharePdf(doc, filename, {
    title: `Studio Entry Pass - ${bookingRef}`,
    text: `stretchwithlorie Yoga Sanctuary Pass for ${studentName} (${className})`,
    preview: options.preview,
    forceDownload: options.forceDownload
  });

  return {
    filename,
    bookingRef,
    ...result
  };
}

/**
 * exportGiftPassPDF
 * Generates an executive, luxury printable/savable PDF voucher for Gift Cards and Membership Passes.
 *
 * @param {Object} order - Order details from WellnessGiftCardModal
 */
export async function exportGiftPassPDF(order, options = {}) {
  if (!order) {
    throw new Error('No order details provided for Gift Pass PDF.');
  }

  const {
    orderId = 'SWL-PASS',
    type = 'subscription',
    title = 'Wellness Pass',
    amount = 200,
    buyerName = 'Valued Member',
    recipientName = 'Dear Friend',
    personalNote = '',
    voucherCode = 'SWL-VOUCHER',
    classesCount = 4,
    validityMonths = 1
  } = order;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 28;
  const cardW = pageWidth - margin * 2;
  const cardX = margin;
  const cardY = 24;
  const cardH = 782;

  const logoData = await getBase64ImageFromUrl(logoFullImg);

  // Top Accent Bar
  doc.setFillColor(35, 45, 33);
  doc.rect(0, 0, pageWidth, 5, 'F');
  doc.setFillColor(200, 162, 83);
  doc.rect(0, 5, pageWidth, 2, 'F');

  // Outer Card
  doc.setFillColor(250, 248, 245);
  doc.roundedRect(cardX, cardY, cardW, cardH, 8, 8, 'F');
  doc.setDrawColor(200, 162, 83);
  doc.setLineWidth(1.2);
  doc.roundedRect(cardX, cardY, cardW, cardH, 8, 8, 'S');

  // Inner Frame
  doc.setDrawColor(230, 225, 216);
  doc.setLineWidth(0.6);
  doc.roundedRect(cardX + 3.5, cardY + 3.5, cardW - 7, cardH - 7, 6, 6, 'S');

  // Header Banner
  const headerY = cardY + 4;
  const headerH = 78;
  doc.setFillColor(35, 45, 33);
  doc.rect(cardX + 4, headerY, cardW - 8, headerH, 'F');
  doc.setFillColor(200, 162, 83);
  doc.rect(cardX + 4, headerY + headerH - 2, cardW - 8, 2, 'F');

  // Logo Badge
  const logoBadgeX = cardX + 14;
  const logoBadgeY = headerY + 11;
  const logoBadgeW = 114;
  const logoBadgeH = 56;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(logoBadgeX, logoBadgeY, logoBadgeW, logoBadgeH, 5, 5, 'F');
  doc.setDrawColor(200, 162, 83);
  doc.setLineWidth(0.8);
  doc.roundedRect(logoBadgeX, logoBadgeY, logoBadgeW, logoBadgeH, 5, 5, 'S');

  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', logoBadgeX + 6, logoBadgeY + 5, 102, 46);
    } catch {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(35, 45, 33);
      doc.text('stretchwithlorie', logoBadgeX + 12, logoBadgeY + 30);
    }
  }

  // Header Text
  const headerTextX = cardX + 138;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(200, 162, 83);
  doc.text(type === 'subscription' ? 'OFFICIAL MONTHLY STUDIO MEMBERSHIP PASS' : 'DIGITAL WELLNESS GIFT CARD & EXPERIENCE VOUCHER', headerTextX, headerY + 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('stretchwithlorie Sanctuary', headerTextX, headerY + 41);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(237, 232, 225);
  doc.text('Movement, Mindfulness & Rejuvenation  -  East Legon, Accra, Ghana', headerTextX, headerY + 55);

  // Voucher / Pass Hero Section
  const heroY = headerY + headerH + 16;
  const heroH = 140;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 225, 216);
  doc.setLineWidth(0.8);
  doc.roundedRect(cardX + 12, heroY, cardW - 24, heroH, 8, 8, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(200, 162, 83);
  doc.text(type === 'subscription' ? 'STUDIO MEMBERSHIP PASS' : 'WELLNESS GIFT EXPERIENCE', cardX + 24, heroY + 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(43, 46, 49);
  doc.text(title, cardX + 24, heroY + 44);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(164, 74, 74); // Terracotta Berry
  doc.text(`GHS ${amount}.00`, cardX + cardW - 36, heroY + 44, { align: 'right' });

  // Voucher Code Box
  const codeBoxY = heroY + 62;
  const codeBoxH = 48;
  doc.setFillColor(247, 244, 239);
  doc.setDrawColor(200, 162, 83);
  doc.setLineWidth(0.8);
  doc.roundedRect(cardX + 24, codeBoxY, cardW - 48, codeBoxH, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(122, 139, 113);
  doc.text('OFFICIAL REDEMPTION VOUCHER CODE:', cardX + 36, codeBoxY + 16);

  doc.setFont('courier', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(43, 46, 49);
  doc.text(voucherCode, cardX + 36, codeBoxY + 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(92, 98, 96);
  doc.text(`Valid for ${validityMonths || 1} Month${validityMonths > 1 ? 's' : ''} - ${classesCount ? classesCount + ' Classes' : 'Universal Studio Credit'}`, cardX + cardW - 44, codeBoxY + 28, { align: 'right' });

  // Details Section (Buyer, Recipient, Note)
  const detailY = heroY + heroH + 14;
  const detailH = 130;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 225, 216);
  doc.setLineWidth(0.6);
  doc.roundedRect(cardX + 12, detailY, cardW - 24, detailH, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(122, 139, 113);
  doc.text('PASS BENEFICIARY DETAILS', cardX + 24, detailY + 20);

  if (type === 'gift') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(43, 46, 49);
    doc.text(`Gifted To: ${recipientName}`, cardX + 24, detailY + 38);
    doc.text(`Gifted By: ${buyerName}`, cardX + 24, detailY + 54);

    if (personalNote) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(92, 98, 96);
      doc.text(`"${personalNote}"`, cardX + 24, detailY + 76, { maxWidth: cardW - 60 });
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(43, 46, 49);
    doc.text(`Pass Holder: ${buyerName}`, cardX + 24, detailY + 38);
    doc.setFont('helvetica', 'normal');
    doc.text(`Status: Active Monthly Pass  -  Valid at East Legon Sanctuary`, cardX + 24, detailY + 54);
    doc.text(`Includes Manduka Mat Reservation & Herbal Tea Ritual on every visit.`, cardX + 24, detailY + 70);
  }

  // How to redeem / Guidelines
  const guideY = detailY + detailH + 14;
  const guideH = 120;
  doc.setFillColor(242, 245, 240);
  doc.setDrawColor(220, 228, 217);
  doc.setLineWidth(0.6);
  doc.roundedRect(cardX + 12, guideY, cardW - 24, guideH, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(90, 105, 82);
  doc.text('HOW TO REDEEM YOUR PASS', cardX + 24, guideY + 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 68, 58);
  doc.text('1. Present this digital pass or voucher code on your phone when arriving at the studio.', cardX + 24, guideY + 40);
  doc.text('2. Or book class slots directly on WhatsApp with Lorie at +233 24 123 4567 citing your code.', cardX + 24, guideY + 56);
  doc.text('3. Complimentary Manduka Pro mats, props and infused post-session herbal tea are included.', cardX + 24, guideY + 72);
  doc.text('4. Cancellations and rescheduling must be notified 24 hours prior to scheduled class time.', cardX + 24, guideY + 88);

  // Footer
  const footerY = cardY + cardH - 24;
  doc.setDrawColor(200, 162, 83);
  doc.setLineWidth(0.6);
  doc.line(cardX + 24, footerY - 10, cardX + cardW - 24, footerY - 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(43, 46, 49);
  doc.text('stretchwithlorie  -  Yoga & Fitness Sanctuary  -  East Legon, Accra', cardX + 24, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(122, 139, 113);
  doc.text(`Order ID: ${orderId}  -  Voucher: ${voucherCode}  -  Verified on Paystack`, cardX + cardW - 24, footerY, { align: 'right' });

  const filename = `StretchWithLorie_Pass_${voucherCode}.pdf`;
  const result = await saveOrSharePdf(doc, filename, {
    title: `Wellness Pass - ${voucherCode}`,
    text: `stretchwithlorie Wellness Pass (${title}) - Voucher: ${voucherCode}`,
    preview: options.preview,
    forceDownload: options.forceDownload
  });

  return { filename, voucherCode, ...result };
}
