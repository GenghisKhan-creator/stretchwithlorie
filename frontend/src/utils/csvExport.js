/**
 * CSV Exporter for Stretch with Lorie Attendee Rosters
 * Generates an RFC 4180 compliant CSV and triggers browser download.
 */

function escapeCsvField(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export function exportAttendeesToCSV(attendees, filename = null) {
  if (!attendees || attendees.length === 0) {
    alert('No attendee records to export.');
    return;
  }

  const defaultFilename = `stretchwithlorie_attendees_${new Date().toISOString().slice(0, 10)}.csv`;
  const finalFilename = filename || defaultFilename;

  const headers = [
    'Booking Ref',
    'Student Name',
    'Email',
    'Phone',
    'Class Enrolled',
    'Session Date',
    'Session Time',
    'Slot / Option',
    'Location',
    'Amount (GHS)',
    'Payment Status',
    'Payment Method',
    'Paystack Ref',
    'Promo / Discount Code',
    'Checked In',
    'Booked At',
    'Health Notes / Special Intake'
  ];

  const rows = attendees.map((reg) => [
    escapeCsvField(reg.bookingRef || reg.id),
    escapeCsvField(reg.studentName || ''),
    escapeCsvField(reg.email || ''),
    escapeCsvField(reg.phone || ''),
    escapeCsvField(reg.className || ''),
    escapeCsvField(reg.sessionDate || reg.classDate || ''),
    escapeCsvField(reg.sessionTime || reg.classTime || ''),
    escapeCsvField(reg.slotLabel || reg.slotId || ''),
    escapeCsvField(reg.locationType || 'Studio Sanctuary'),
    escapeCsvField(reg.amount || 0),
    escapeCsvField(reg.paymentStatus || 'Paid'),
    escapeCsvField(reg.paymentMethod || 'Paystack MoMo'),
    escapeCsvField(reg.paystackRef || ''),
    escapeCsvField(reg.promoCode ? `${reg.promoCode} (-GH₵${reg.discountAmount || 0})` : 'None'),
    escapeCsvField(reg.checkedIn ? 'Yes (Present)' : 'No (Pending)'),
    escapeCsvField(reg.formattedTime || reg.registeredAt || ''),
    escapeCsvField(reg.healthNotes || 'None declared')
  ]);

  const csvContent = [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  // UTF-8 BOM for Excel compatibility in Windows/Mac
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', finalFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, count: attendees.length, filename: finalFilename };
}
