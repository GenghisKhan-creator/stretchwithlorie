import { useState, useMemo } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Search,
  Download,
  Plus,
  CheckCircle2,
  HeartPulse,
  Eye,
  RefreshCw
} from 'lucide-react';
import AddClassModal from './AddClassModal';
import StudentDetailsModal from './StudentDetailsModal';
import MobileMoneyLogo from './MobileMoneyLogo';
import { PaystackIcon } from './RegistrationForm';

export default function InstructorDashboard({
  classes,
  registrations,
  onAddClass,
  onToggleCheckIn,
  onRefreshData
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState('ALL'); // 'ALL' | 'CHECKED_IN' | 'PENDING'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  const [exportNotice, setExportNotice] = useState(null);

  // Compute studio metrics
  const stats = useMemo(() => {
    const totalBookings = registrations.length;
    const totalRevenue = registrations.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalMaxCapacity = classes.reduce((acc, curr) => acc + (curr.maxCapacity || 0), 0);
    const totalActualBooked = classes.reduce((acc, curr) => acc + (curr.bookedCount || 0), 0);
    const fillRate = totalMaxCapacity > 0 ? Math.round((totalActualBooked / totalMaxCapacity) * 100) : 0;

    return {
      totalBookings,
      totalRevenue,
      totalMaxCapacity,
      fillRate,
      activeClasses: classes.length
    };
  }, [classes, registrations]);

  // Filter registrations based on search & filters
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      // Search matching: name, email, phone, booking ref, class name, or paystack ref
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        reg.studentName.toLowerCase().includes(query) ||
        reg.email.toLowerCase().includes(query) ||
        reg.phone.toLowerCase().includes(query) ||
        reg.bookingRef.toLowerCase().includes(query) ||
        (reg.paystackRef && reg.paystackRef.toLowerCase().includes(query)) ||
        reg.className.toLowerCase().includes(query);

      // Class filter
      const matchesClass =
        selectedClassFilter === 'ALL' || reg.classId === selectedClassFilter;

      // Attendance filter
      const matchesAttendance =
        attendanceFilter === 'ALL' ||
        (attendanceFilter === 'CHECKED_IN' && reg.checkedIn) ||
        (attendanceFilter === 'PENDING' && !reg.checkedIn);

      return matchesSearch && matchesClass && matchesAttendance;
    });
  }, [registrations, searchTerm, selectedClassFilter, attendanceFilter]);

  // CSV Export Trigger
  const handleExportCSV = () => {
    if (registrations.length === 0) {
      alert('No registrations available to export.');
      return;
    }

    // Prepare CSV rows
    const headers = [
      'Booking Reference',
      'Paystack Reference',
      'Student Name',
      'Email',
      'Phone / WhatsApp',
      'Class Name',
      'Class Date',
      'Class Time',
      'Instructor',
      'Amount Paid (GH₵)',
      'Payment Gateway',
      'Payment Method',
      'Payment Status',
      'Checked In',
      'Health & Injury Notes',
      'Registration Timestamp'
    ];

    const targetList = filteredRegistrations.length > 0 ? filteredRegistrations : registrations;

    const csvRows = [
      headers.join(','),
      ...targetList.map((r) =>
        [
          `"${r.bookingRef}"`,
          `"${r.paystackRef || 'pstk_mock_tr'}"`,
          `"${r.studentName.replace(/"/g, '""')}"`,
          `"${r.email}"`,
          `"${r.phone}"`,
          `"${r.className.replace(/"/g, '""')}"`,
          `"${r.classDate}"`,
          `"${r.classTime}"`,
          `"${r.instructor}"`,
          r.amount,
          `"Paystack"`,
          `"${r.paymentMethod || 'Paystack (MTN MoMo)'}"`,
          `"${r.paymentStatus}"`,
          r.checkedIn ? 'Yes' : 'No',
          `"${(r.healthNotes || '').replace(/"/g, '""')}"`,
          `"${r.registeredAt}"`
        ].join(',')
      )
    ];

    const csvContent = csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `StretchWithLorie_Paystack_Attendees_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(`Exported ${targetList.length} attendee records to CSV!`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E0DFDB] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#F5EBE1] border border-[#E8D7C8] px-2.5 py-0.5 text-xs font-semibold text-[#774929]">
              Instructor Control Center
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F8FD] border border-[#B6EEFC] px-2 py-0.5 text-[11px] font-bold text-[#0288D1]">
              <PaystackIcon className="h-3 w-3" />
              Paystack Live
            </span>
          </div>
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-[#201410]">
            Studio Operations & Rosters
          </h1>
          <p className="text-xs sm:text-sm text-[#88796B] mt-0.5">
            Monitor real-time class capacities, student medical notes, and verified Paystack Mobile Money payments.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {onRefreshData && (
            <button
              type="button"
              onClick={onRefreshData}
              title="Refresh Roster Data"
              className="flex items-center gap-1.5 rounded-2xl border border-[#E0DFDB] bg-white px-3 py-2.5 text-xs font-semibold text-[#88796B] hover:bg-[#FAF8F5] hover:text-[#201410] transition-all shadow-sm"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-2xl border border-[#E0DFDB] bg-white px-4 py-2.5 text-xs font-semibold text-[#201410] hover:bg-[#FAF8F5] transition-all shadow-sm"
          >
            <Download className="h-4 w-4 text-[#774929]" />
            <span>Export Attendee CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-[#774929] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#663D21] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Class</span>
          </button>
        </div>
      </div>

      {/* Export notification badge */}
      {exportNotice && (
        <div className="rounded-2xl bg-[#F5EBE1] border border-[#E8D7C8] p-3 text-xs font-semibold text-[#774929] flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-[#774929]" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Key Metric Stat Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4">
        {/* Total Bookings */}
        <div className="rounded-3xl border border-[#E0DFDB] bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#88796B]">
              Total Bookings
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F5EBE1] text-[#774929]">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#201410]">
              {stats.totalBookings}
            </span>
            <span className="text-[11px] font-medium text-[#774929]">
              yogis enrolled
            </span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="rounded-3xl border border-[#E0DFDB] bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#88796B]">
              Paystack Revenue
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F5EBE1] text-[#774929]">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#201410]">
              GH₵{stats.totalRevenue.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium text-[#774929]">
              collected
            </span>
          </div>
        </div>

        {/* Fill Rate */}
        <div className="rounded-3xl border border-[#E0DFDB] bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#88796B]">
              Capacity Fill Rate
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#E0DFDB] text-[#774929]">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#201410]">
              {stats.fillRate}%
            </span>
            <span className="text-[11px] font-medium text-[#774929]">
              avg occupancy
            </span>
          </div>
        </div>

        {/* Active Classes */}
        <div className="rounded-3xl border border-[#E0DFDB] bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#88796B]">
              Active Sessions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#E0DFDB] text-[#774929]">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#201410]">
              {stats.activeClasses}
            </span>
            <span className="text-[11px] font-medium text-[#88796B]">
              scheduled
            </span>
          </div>
        </div>
      </div>

      {/* Class Capacity Overview (Visual Progress Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#201410]">
              Class Capacity Overview
            </h2>
            <p className="text-xs text-[#88796B]">
              Signups vs maximum room capacities for each upcoming session.
            </p>
          </div>
          {selectedClassFilter !== 'ALL' && (
            <button
              onClick={() => setSelectedClassFilter('ALL')}
              className="text-xs font-semibold text-[#774929] hover:underline"
            >
              Clear Class Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => {
            const booked = cls.bookedCount;
            const max = cls.maxCapacity;
            const percentage = Math.min(100, Math.round((booked / max) * 100));
            const spotsRemaining = Math.max(0, max - booked);
            const isFilterActive = selectedClassFilter === cls.id;

            return (
              <div
                key={cls.id}
                className={`relative flex flex-col justify-between rounded-3xl p-5 border transition-all duration-200 ${
                  isFilterActive
                    ? 'border-[#774929] bg-[#FAF6F2] shadow-md ring-2 ring-[#774929]/20'
                    : 'border-[#E0DFDB] bg-white hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="rounded-full bg-[#F5EBE1] border border-[#E8D7C8] px-2 py-0.5 text-[11px] font-bold text-[#774929]">
                      {cls.category}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        spotsRemaining === 0
                          ? 'text-stone-500'
                          : spotsRemaining <= 2
                          ? 'text-amber-800'
                          : 'text-[#774929]'
                      }`}
                    >
                      {spotsRemaining === 0 ? 'Full' : `${spotsRemaining} spots left`}
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-[#201410]">
                    {cls.title}
                  </h3>
                  <p className="text-xs text-[#88796B] mt-0.5">
                    {cls.instructor.name} • {cls.room}
                  </p>
                  <p className="text-[11px] text-[#88796B] mt-1">
                    {cls.date} • {cls.time}
                  </p>

                  {/* Visual Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#382823]">
                        {booked} / {max} Mats Reserved
                      </span>
                      <span className="text-[#774929]">
                        {percentage}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-[#EAE4DC] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentage >= 100
                            ? 'bg-[#382823]'
                            : percentage >= 80
                            ? 'bg-[#774929]'
                            : 'bg-[#774929]'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Filter Quick Action */}
                <div className="mt-4 pt-3 border-t border-[#EAE6DF] flex items-center justify-between">
                  <span className="text-xs text-[#88796B]">
                    GH₵{cls.price} / ticket
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedClassFilter(isFilterActive ? 'ALL' : cls.id)
                    }
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isFilterActive
                        ? 'bg-[#774929] text-white'
                        : 'bg-[#F5EBE1] text-[#774929] hover:bg-[#E8D7C8]'
                    }`}
                  >
                    {isFilterActive ? 'Viewing Attendees' : 'Filter Roster'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Registrations Table Section */}
      <div className="rounded-3xl border border-[#E0DFDB] bg-white shadow-sm overflow-hidden">

        {/* Table Controls Bar */}
        <div className="p-5 sm:p-6 border-b border-[#E0DFDB] bg-[#FAF8F5]/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#201410] flex items-center gap-2">
                <span>Live Registrations & Attendee Roster</span>
                <span className="rounded-full bg-[#F5EBE1] border border-[#E8D7C8] px-2.5 py-0.5 text-xs font-bold text-[#774929]">
                  {filteredRegistrations.length}
                </span>
              </h2>
              <p className="text-xs text-[#88796B]">
                Real-time Paystack booking transactions, MoMo approvals, and student injury notes.
              </p>
            </div>

            {/* Quick stats on filtered set */}
            <div className="text-xs text-[#88796B]">
              Showing {filteredRegistrations.length} of {registrations.length} bookings
            </div>
          </div>

          {/* Filters & Search Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">

            {/* Search input */}
            <div className="sm:col-span-6 relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#88796B]">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search student, phone, booking ID, or Paystack ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-[#E0DFDB] bg-white py-2.5 pl-10 pr-4 text-base sm:text-sm text-[#201410] placeholder-[#A89E96] outline-none focus:border-[#774929] focus:ring-2 focus:ring-[#774929]/20"
              />
            </div>

            {/* Class selector filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="w-full rounded-2xl border border-[#E0DFDB] bg-white px-3 py-2.5 text-base sm:text-sm text-[#201410] outline-none focus:border-[#774929]"
              >
                <option value="ALL">All Classes (Full Schedule)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Attendance filter */}
            <div className="sm:col-span-3">
              <select
                value={attendanceFilter}
                onChange={(e) => setAttendanceFilter(e.target.value)}
                className="w-full rounded-2xl border border-[#E0DFDB] bg-white px-3 py-2.5 text-xs sm:text-sm text-[#201410] outline-none focus:border-[#774929]"
              >
                <option value="ALL">All Attendance</option>
                <option value="CHECKED_IN">Checked In Only</option>
                <option value="PENDING">Not Checked In</option>
              </select>
            </div>

          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#E0DFDB] bg-[#F3EFE9] text-[11px] font-semibold uppercase tracking-wider text-[#88796B]">
                <th className="py-3.5 px-4 sm:px-6">Student & Reference</th>
                <th className="py-3.5 px-4">Class Session</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Health / Injuries</th>
                <th className="py-3.5 px-4">Paystack Payment</th>
                <th className="py-3.5 px-4">Booked At</th>
                <th className="py-3.5 px-4 text-center">Attendance</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE6DF]">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#88796B]">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5EBE1]">
                      <Search className="h-5 w-5 text-[#774929]" />
                    </div>
                    <p className="font-semibold text-sm text-[#201410]">
                      No matching registrations found
                    </p>
                    <p className="text-xs mt-1">
                      Try clearing filters or searching for another keyword.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedClassFilter('ALL');
                        setAttendanceFilter('ALL');
                      }}
                      className="mt-3 text-xs font-semibold text-[#774929] underline"
                    >
                      Reset All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => {
                  const hasHealthNotes =
                    reg.healthNotes &&
                    reg.healthNotes !== 'None' &&
                    reg.healthNotes !== 'None reported';

                  return (
                    <tr
                      key={reg.id}
                      className="hover:bg-[#FAF8F5] transition-colors"
                    >
                      {/* Student Name & Reference */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5EBE1] text-[#774929] font-bold text-xs">
                            {reg.studentName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-[#201410]">
                              {reg.studentName}
                            </p>
                            <span className="font-mono text-[11px] text-[#88796B]">
                              {reg.bookingRef}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Class Enrolled */}
                      <td className="py-4 px-4">
                        <p className="font-medium text-[#201410] truncate max-w-[180px]">
                          {reg.className}
                        </p>
                        <p className="text-[11px] text-[#88796B]">
                          {reg.classDate.split(',')[0]} • {reg.classTime.split('-')[0]}
                        </p>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4">
                        <p className="text-xs text-[#201410] truncate max-w-[180px]">
                          {reg.email}
                        </p>
                        <a
                          href={`https://wa.me/${reg.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#774929] hover:underline"
                        >
                          {reg.phone}
                        </a>
                      </td>

                      {/* Health & Injury Notes */}
                      <td className="py-4 px-4">
                        {hasHealthNotes ? (
                          <div
                            onClick={() => setSelectedStudentForModal(reg)}
                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-2 py-1 text-xs text-amber-900 hover:bg-amber-100 max-w-[160px] truncate"
                            title={reg.healthNotes}
                          >
                            <HeartPulse className="h-3 w-3 text-amber-700 shrink-0" />
                            <span className="truncate">{reg.healthNotes}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#A89E96]">
                            None
                          </span>
                        )}
                      </td>

                      {/* Paystack Payment Status Badge */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F8FD] border border-[#B6EEFC] px-2.5 py-0.5 text-xs font-bold text-[#0288D1]">
                          <CheckCircle2 className="h-3 w-3" />
                          Paid (GH₵{reg.amount})
                        </span>
                        <div className="text-[10px] text-[#382823] mt-1 font-medium flex items-center gap-1.5">
                          {reg.paymentMethod && (reg.paymentMethod.includes('MTN') || reg.paymentMethod.includes('Telecel') || reg.paymentMethod.includes('AT') || reg.paymentMethod.includes('MoMo')) ? (
                            <MobileMoneyLogo network={reg.paymentMethod} variant="image" size="xs" className="h-4 w-auto rounded-xs shadow-2xs shrink-0" />
                          ) : (
                            <PaystackIcon className="h-2.5 w-2.5 shrink-0" />
                          )}
                          <span className="truncate max-w-[130px]">{reg.paymentMethod || 'Paystack MoMo'}</span>
                        </div>
                        {reg.paystackRef && (
                          <span className="font-mono text-[9px] text-[#88796B] block truncate max-w-[120px]">
                            {reg.paystackRef}
                          </span>
                        )}
                      </td>

                      {/* Booked Timestamp */}
                      <td className="py-4 px-4 text-xs text-[#88796B]">
                        {reg.formattedTime || 'Recent'}
                      </td>

                      {/* Attendance Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleCheckIn(reg.id)}
                          className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
                            reg.checkedIn
                              ? 'bg-[#774929] text-white shadow-sm'
                              : 'bg-[#F5EBE1] text-[#774929] hover:bg-[#E8D7C8]'
                          }`}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{reg.checkedIn ? 'Present' : 'Check In'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForModal(reg)}
                          className="rounded-xl border border-[#E0DFDB] p-1.5 text-[#88796B] hover:bg-[#FAF8F5] hover:text-[#201410] transition-colors"
                          title="View Student Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add Class Modal */}
      <AddClassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddClass={onAddClass}
      />

      {/* Student Details / Health Notes Modal */}
      <StudentDetailsModal
        registration={selectedStudentForModal}
        onClose={() => setSelectedStudentForModal(null)}
        onToggleCheckIn={onToggleCheckIn}
      />

    </div>
  );
}