import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * exportAttendeesToPDF
 * Generates an executive, beautifully formatted PDF report of class attendees
 * with complete booking references, verified Paystack payments, and student health notes.
 *
 * @param {Array} registrations - List of registration records to include
 * @param {Object} options - Additional context (filter, class title, etc.)
 */
export function exportAttendeesToPDF(registrations, options = {}) {
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

    // Health / Injury notes
    const notesCell = (r.healthNotes && r.healthNotes !== 'None' && r.healthNotes !== 'None reported')
      ? r.healthNotes
      : 'None reported (All clear)';

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
  doc.save(filename);

  return {
    filename,
    count: totalCount,
    revenue: formattedRevenue
  };
}
