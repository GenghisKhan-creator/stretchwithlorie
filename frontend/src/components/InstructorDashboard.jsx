import { useState, useMemo } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Search,
  Plus,
  CheckCircle2,
  HeartPulse,
  Eye,
  RefreshCw,
  CalendarDays,
  CheckCheck,
  Download
} from 'lucide-react';
import AddClassModal from './AddClassModal';
import StudentDetailsModal from './StudentDetailsModal';
import ShortVideosSection from './ShortVideosSection';
import CreatorReferralsManager from './CreatorReferralsManager';
import MobileMoneyLogo from './MobileMoneyLogo';
import { PaystackIcon } from './RegistrationForm';
import { exportAttendeesToPDF } from '../utils/pdfExport';
import { DEFAULT_INSTRUCTOR_AVATAR } from '../data/mockData';

// Helper to extract normalized date and month from any registration
function parseRegistrationDate(reg) {
  if (reg.sessionDate && /^\d{4}-\d{2}-\d{2}$/.test(reg.sessionDate)) {
    const [yyyy, mm, dd] = reg.sessionDate.split('-');
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return {
      dateKey: reg.sessionDate,
      monthKey: `${yyyy}-${mm}`,
      monthLabel: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      dateLabel: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    };
  }

  const raw = (reg.classDate || '').replace(/\(.*?\)/g, '').trim();
  const parsed = Date.parse(raw);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}-${mm}-${dd}`;
    return {
      dateKey,
      monthKey: `${yyyy}-${mm}`,
      monthLabel: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      dateLabel: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    };
  }

  if (reg.registeredAt) {
    const d = new Date(reg.registeredAt);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}-${mm}-${dd}`;
    return {
      dateKey,
      monthKey: `${yyyy}-${mm}`,
      monthLabel: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      dateLabel: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    };
  }

  return {
    dateKey: 'unknown',
    monthKey: 'unknown',
    monthLabel: 'Other Sessions',
    dateLabel: raw || 'Flexible Date'
  };
}

export default function InstructorDashboard({
  classes,
  registrations,
  onAddClass,
  onToggleCheckIn,
  onRefreshData,
  showToast
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState('ALL'); // 'ALL' | 'CHECKED_IN' | 'PENDING'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  const [exportNotice, setExportNotice] = useState(null);

  // Dynamic list of months and dates available in registrations
  const { availableMonths, availableDates } = useMemo(() => {
    const monthsMap = new Map();
    const datesMap = new Map();

    registrations.forEach((reg) => {
      const info = parseRegistrationDate(reg);
      if (info.monthKey !== 'unknown') {
        if (!monthsMap.has(info.monthKey)) {
          monthsMap.set(info.monthKey, { key: info.monthKey, label: info.monthLabel, count: 0 });
        }
        monthsMap.get(info.monthKey).count += 1;
      }

      if (info.dateKey !== 'unknown') {
        if (!datesMap.has(info.dateKey)) {
          datesMap.set(info.dateKey, {
            key: info.dateKey,
            monthKey: info.monthKey,
            label: info.dateLabel,
            count: 0
          });
        }
        datesMap.get(info.dateKey).count += 1;
      }
    });

    const months = Array.from(monthsMap.values()).sort((a, b) => a.key.localeCompare(b.key));
    const dates = Array.from(datesMap.values()).sort((a, b) => a.key.localeCompare(b.key));

    return { availableMonths: months, availableDates: dates };
  }, [registrations]);

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

  // Filter registrations based on search, class, month, day, & attendance
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

      // Date parsing for month and day filters
      const regDateInfo = parseRegistrationDate(reg);

      // Month filter
      const matchesMonth =
        selectedMonthFilter === 'ALL' || regDateInfo.monthKey === selectedMonthFilter;

      // Day / Date filter
      const matchesDate =
        selectedDateFilter === 'ALL' || regDateInfo.dateKey === selectedDateFilter;

      // Attendance filter
      const matchesAttendance =
        attendanceFilter === 'ALL' ||
        (attendanceFilter === 'CHECKED_IN' && reg.checkedIn) ||
        (attendanceFilter === 'PENDING' && !reg.checkedIn);

      return matchesSearch && matchesClass && matchesMonth && matchesDate && matchesAttendance;
    });
  }, [registrations, searchTerm, selectedClassFilter, selectedMonthFilter, selectedDateFilter, attendanceFilter]);

  // Attendance metrics for the active filter set
  const filteredAttendanceStats = useMemo(() => {
    const total = filteredRegistrations.length;
    const checkedIn = filteredRegistrations.filter((r) => r.checkedIn).length;
    const pending = total - checkedIn;
    const attendanceRate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
    return { total, checkedIn, pending, attendanceRate };
  }, [filteredRegistrations]);

  // PDF Export Trigger (Well-organized branded table of filtered records)
  const handleExportPDF = async (exportOptions = {}) => {
    const targetList = filteredRegistrations.length > 0 ? filteredRegistrations : registrations;
    if (targetList.length === 0) {
      alert('No attendee records match the current filter to export.');
      return;
    }

    try {
      const activeMonthLabel = selectedMonthFilter !== 'ALL'
        ? availableMonths.find((m) => m.key === selectedMonthFilter)?.label
        : null;
      const activeDateLabel = selectedDateFilter !== 'ALL'
        ? availableDates.find((d) => d.key === selectedDateFilter)?.label
        : null;
      const activeClassTitle = selectedClassFilter !== 'ALL'
        ? classes.find((c) => c.id === selectedClassFilter)?.title
        : null;

      const result = await exportAttendeesToPDF(targetList, {
        filterClass: activeClassTitle || selectedClassFilter,
        filterAttendance: attendanceFilter,
        filterMonth: activeMonthLabel,
        filterDate: activeDateLabel,
        searchTerm,
        forceDownload: exportOptions.forceDownload ?? true,
        preview: exportOptions.preview ?? false
      });
      setExportNotice(`Downloaded ${result.count} attendee records (${result.filename})!`);
      setTimeout(() => setExportNotice(null), 5000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E6E1D8] pb-6">
        <div className="flex items-center gap-3.5">
          <img
            src={DEFAULT_INSTRUCTOR_AVATAR}
            alt="Lorie - Lead Yoga Specialist"
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover object-[center_20%] ring-2 ring-[#7A8B71]/40 shadow-sm shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#E5ECE2] border border-[#DCE4D9] px-2.5 py-0.5 text-xs font-semibold text-[#5A6952]">
                Instructor Control Center
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F8FD] border border-[#B6EEFC] px-2 py-0.5 text-[11px] font-bold text-[#0288D1]">
                <PaystackIcon className="h-3 w-3" />
                Paystack Live
              </span>
            </div>
            <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-[#2B2E31]">
              Studio Operations & Rosters
            </h1>
            <p className="text-xs sm:text-sm text-[#5C6260] mt-0.5">
              Welcome back, Lorie. Monitor real-time class capacities, student medical notes, and verified Paystack payments.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {onRefreshData && (
            <button
              type="button"
              onClick={onRefreshData}
              title="Refresh Roster Data"
              className="flex items-center gap-1.5 rounded-2xl border border-[#E6E1D8] bg-white px-3 py-2.5 text-xs font-semibold text-[#5C6260] hover:bg-[#FAF8F5] hover:text-[#2B2E31] transition-all shadow-sm"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleExportPDF({ forceDownload: true })}
            className="flex items-center gap-2 rounded-2xl border border-[#E6E1D8] bg-white px-4 py-2.5 text-xs font-semibold text-[#2B2E31] hover:bg-[#FAF8F5] hover:border-[#7A8B71]/40 transition-all shadow-sm cursor-pointer"
            title="Download PDF table for the currently filtered attendee records"
          >
            <Download className="h-4 w-4 text-[#7A8B71]" />
            <span>Download Filtered PDF ({filteredRegistrations.length})</span>
          </button>

          <a
            href="#creator-referrals-manager"
            className="flex items-center gap-2 rounded-2xl border border-[#C8A253]/60 bg-[#FAF5EB] hover:bg-[#F3E9D2] px-4 py-2.5 text-xs font-bold text-[#8C6D23] shadow-sm transition-all cursor-pointer"
          >
            <span>Creators & Promo Codes</span>
          </a>

          <a
            href="#instructor-video-vault"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#C8A253] to-[#B68F40] hover:from-[#d4af61] hover:to-[#C8A253] px-4 py-2.5 text-xs font-bold text-[#1C231A] shadow-md transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Post Video</span>
          </a>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-[#A44A4A] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#8C3E3E] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Class</span>
          </button>
        </div>
      </div>

      {/* Export notification badge */}
      {exportNotice && (
        <div className="rounded-2xl bg-[#E5ECE2] border border-[#DCE4D9] p-3 text-xs font-semibold text-[#5A6952] flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-[#5A6952]" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Key Metric Stat Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4">
        {/* Total Bookings */}
        <div className="rounded-3xl border border-[#E6E1D8] bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5C6260]">
              Total Bookings
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E5ECE2] text-[#5A6952]">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2E31]">
              {stats.totalBookings}
            </span>
            <span className="text-[11px] font-medium text-[#5A6952]">
              yogis enrolled
            </span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="rounded-3xl border border-[#E6E1D8] bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5C6260]">
              Paystack Revenue
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF5EB] text-[#8C6D23] border border-[#E8D7B0]">
              <DollarSign className="h-4 w-4 text-[#C8A253]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2E31]">
              GH₵{stats.totalRevenue.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium text-[#8C6D23]">
              collected
            </span>
          </div>
        </div>

        {/* Fill Rate */}
        <div className="rounded-3xl border border-[#E6E1D8] bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5C6260]">
              Capacity Fill Rate
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F1F4EF] border border-[#E6E1D8] text-[#5A6952]">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2E31]">
              {stats.fillRate}%
            </span>
            <span className="text-[11px] font-medium text-[#5A6952]">
              avg occupancy
            </span>
          </div>
        </div>

        {/* Active Classes */}
        <div className="rounded-3xl border border-[#E6E1D8] bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5C6260]">
              Active Sessions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] text-[#5A6952]">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2E31]">
              {stats.activeClasses}
            </span>
            <span className="text-[11px] font-medium text-[#5C6260]">
              scheduled
            </span>
          </div>
        </div>
      </div>

      {/* Class Capacity Overview (Visual Progress Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2B2E31]">
              Class Capacity Overview
            </h2>
            <p className="text-xs text-[#5C6260]">
              Signups vs maximum room capacities for each upcoming session.
            </p>
          </div>
          {selectedClassFilter !== 'ALL' && (
            <button
              onClick={() => setSelectedClassFilter('ALL')}
              className="text-xs font-semibold text-[#7A8B71] hover:underline"
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
                    ? 'border-[#7A8B71] bg-[#F1F4EF] shadow-md ring-2 ring-[#7A8B71]/20'
                    : 'border-[#E6E1D8] bg-white hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="rounded-full bg-[#E5ECE2] border border-[#DCE4D9] px-2 py-0.5 text-[11px] font-bold text-[#5A6952]">
                      {cls.category}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        spotsRemaining === 0
                          ? 'text-stone-500'
                          : spotsRemaining <= 2
                          ? 'text-amber-800'
                          : 'text-[#5A6952]'
                      }`}
                    >
                      {spotsRemaining === 0 ? 'Full' : `${spotsRemaining} spots left`}
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-[#2B2E31]">
                    {cls.title}
                  </h3>
                  <p className="text-xs text-[#5C6260] mt-0.5">
                    {cls.instructor.name} • {cls.room}
                  </p>
                  <p className="text-[11px] text-[#5C6260] mt-1">
                    {cls.date} • {cls.time}
                  </p>

                  {/* Visual Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#2B2E31]">
                        {booked} / {max} Mats Reserved
                      </span>
                      <span className="text-[#5A6952]">
                        {percentage}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-[#EAE4DC] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentage >= 100
                            ? 'bg-[#2B2E31]'
                            : 'bg-[#7A8B71]'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Filter Quick Action */}
                <div className="mt-4 pt-3 border-t border-[#E6E1D8] flex items-center justify-between">
                  <span className="text-xs text-[#5C6260]">
                    GH₵{cls.price} / ticket
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedClassFilter(isFilterActive ? 'ALL' : cls.id)
                    }
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isFilterActive
                        ? 'bg-[#7A8B71] text-white'
                        : 'bg-[#E5ECE2] text-[#5A6952] hover:bg-[#DCE4D9]'
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
      <div className="rounded-3xl border border-[#E6E1D8] bg-white shadow-sm overflow-hidden">

        {/* Table Controls Bar */}
        <div className="p-5 sm:p-6 border-b border-[#E6E1D8] bg-[#FAF8F5]/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2B2E31] flex items-center gap-2">
                <span>Live Registrations & Attendee Roster</span>
                <span className="rounded-full bg-[#E5ECE2] border border-[#DCE4D9] px-2.5 py-0.5 text-xs font-bold text-[#5A6952]">
                  {filteredRegistrations.length}
                </span>
              </h2>
              <p className="text-xs text-[#5C6260]">
                Real-time Paystack booking transactions, MoMo approvals, and student injury notes.
              </p>
            </div>

            {/* Quick stats & Download action on filtered set */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="text-xs text-[#5C6260] hidden sm:block">
                Showing {filteredRegistrations.length} of {registrations.length} bookings
              </div>
              <button
                type="button"
                onClick={() => handleExportPDF({ forceDownload: true })}
                disabled={filteredRegistrations.length === 0}
                className="flex items-center gap-1.5 rounded-2xl bg-[#5A6952] hover:bg-[#465340] text-white px-3.5 py-2 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title="Download PDF report for the filtered attendees"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PDF ({filteredRegistrations.length})</span>
              </button>
            </div>
          </div>

          {/* Filters & Search Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">

            {/* Search input */}
            <div className="sm:col-span-4 relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5C6260]">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search student, booking ID, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-[#E6E1D8] bg-white py-2.5 pl-10 pr-4 text-base sm:text-sm text-[#2B2E31] placeholder-[#88908D] outline-none focus:border-[#7A8B71] focus:ring-2 focus:ring-[#7A8B71]/20 shadow-2xs"
              />
            </div>

            {/* Class selector filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3 py-2.5 text-base sm:text-sm text-[#2B2E31] outline-none focus:border-[#7A8B71] shadow-2xs"
              >
                <option value="ALL">All Classes (Full Schedule)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div className="sm:col-span-2">
              <select
                value={selectedMonthFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedMonthFilter(val);
                  if (val !== 'ALL' && selectedDateFilter !== 'ALL') {
                    const dateObj = availableDates.find((d) => d.key === selectedDateFilter);
                    if (dateObj && dateObj.monthKey !== val) {
                      setSelectedDateFilter('ALL');
                    }
                  }
                }}
                className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3 py-2.5 text-base sm:text-sm text-[#2B2E31] outline-none focus:border-[#7A8B71] shadow-2xs"
              >
                <option value="ALL">All Months</option>
                {availableMonths.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.label} ({m.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Day / Session Date Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedDateFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedDateFilter(val);
                  if (val !== 'ALL') {
                    const dateObj = availableDates.find((d) => d.key === val);
                    if (dateObj && selectedMonthFilter !== dateObj.monthKey) {
                      setSelectedMonthFilter(dateObj.monthKey);
                    }
                  }
                }}
                className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3 py-2.5 text-base sm:text-sm text-[#2B2E31] outline-none focus:border-[#7A8B71] shadow-2xs"
              >
                <option value="ALL">All Days / Dates</option>
                {availableDates
                  .filter((d) => selectedMonthFilter === 'ALL' || d.monthKey === selectedMonthFilter)
                  .map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.label} ({d.count} booked)
                    </option>
                  ))}
              </select>
            </div>

          </div>

          {/* Quick Date Pills & Attendance Status Filter Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-[#E6E1D8]/60">
            {/* Quick Filter Pills for Session Days */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#5C6260] font-medium mr-1 flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-[#7A8B71]" />
                Filter by Day:
              </span>
              <button
                type="button"
                onClick={() => setSelectedDateFilter('ALL')}
                className={`px-2.5 py-1 rounded-xl font-medium transition-all cursor-pointer ${
                  selectedDateFilter === 'ALL'
                    ? 'bg-[#2B2E31] text-white shadow-xs'
                    : 'bg-white border border-[#E6E1D8] text-[#5C6260] hover:bg-[#FAF8F5]'
                }`}
              >
                All Days
              </button>
              {availableDates.slice(0, 6).map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => {
                    setSelectedDateFilter(d.key);
                    setSelectedMonthFilter(d.monthKey);
                  }}
                  className={`px-2.5 py-1 rounded-xl font-medium transition-all cursor-pointer ${
                    selectedDateFilter === d.key
                      ? 'bg-[#7A8B71] text-white shadow-xs'
                      : 'bg-white border border-[#E6E1D8] text-[#5C6260] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {d.label.split(',')[0]} ({d.key.slice(5)})
                </button>
              ))}
            </div>

            {/* Attendance Status Filter Pill Group */}
            <div className="flex items-center gap-1.5 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setAttendanceFilter('ALL')}
                className={`px-2.5 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                  attendanceFilter === 'ALL'
                    ? 'bg-[#5A6952] text-white shadow-xs'
                    : 'bg-white border border-[#E6E1D8] text-[#5C6260] hover:bg-[#FAF8F5]'
                }`}
              >
                All ({filteredAttendanceStats.total})
              </button>
              <button
                type="button"
                onClick={() => setAttendanceFilter('CHECKED_IN')}
                className={`px-2.5 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                  attendanceFilter === 'CHECKED_IN'
                    ? 'bg-[#0288D1] text-white shadow-xs'
                    : 'bg-white border border-[#E6E1D8] text-[#0288D1] hover:bg-[#E6F8FD]'
                }`}
              >
                Checked In ({filteredAttendanceStats.checkedIn})
              </button>
              <button
                type="button"
                onClick={() => setAttendanceFilter('PENDING')}
                className={`px-2.5 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                  attendanceFilter === 'PENDING'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white border border-[#E6E1D8] text-amber-700 hover:bg-amber-50'
                }`}
              >
                Not Checked In ({filteredAttendanceStats.pending})
              </button>
            </div>
          </div>

          {/* Active Attendance Summary Banner */}
          {(selectedMonthFilter !== 'ALL' || selectedDateFilter !== 'ALL' || selectedClassFilter !== 'ALL' || attendanceFilter !== 'ALL' || searchTerm) && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2.5 rounded-2xl bg-[#E5ECE2]/70 border border-[#DCE4D9] text-xs">
              <div className="flex items-center gap-2 flex-wrap text-[#2B2E31]">
                <span className="font-bold flex items-center gap-1 text-[#5A6952]">
                  <CheckCheck className="h-3.5 w-3.5" />
                  Active Attendance View:
                </span>
                {selectedMonthFilter !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-[#DCE4D9] font-medium text-[11px]">
                    Month: {availableMonths.find((m) => m.key === selectedMonthFilter)?.label}
                  </span>
                )}
                {selectedDateFilter !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-[#DCE4D9] font-medium text-[11px]">
                    Day: {availableDates.find((d) => d.key === selectedDateFilter)?.label}
                  </span>
                )}
                {selectedClassFilter !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-[#DCE4D9] font-medium text-[11px]">
                    Class: {classes.find((c) => c.id === selectedClassFilter)?.title}
                  </span>
                )}
                {attendanceFilter !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-[#DCE4D9] font-medium text-[11px]">
                    Status: {attendanceFilter === 'CHECKED_IN' ? 'Checked In' : 'Pending'}
                  </span>
                )}
                <span className="font-semibold text-[#5A6952] ml-1">
                  • {filteredAttendanceStats.checkedIn} / {filteredAttendanceStats.total} Checked In ({filteredAttendanceStats.attendanceRate}%)
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleExportPDF({ forceDownload: true })}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-[#2B2E31] bg-white border border-[#DCE4D9] px-2.5 py-1 rounded-lg hover:bg-[#FAF8F5] transition-colors shadow-2xs cursor-pointer"
                  title="Download PDF report for this specific filter view"
                >
                  <Download className="h-3 w-3 text-[#7A8B71]" />
                  <span>Download PDF ({filteredAttendanceStats.total})</span>
                </button>
                {onToggleCheckIn && filteredAttendanceStats.pending > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      filteredRegistrations
                        .filter((r) => !r.checkedIn)
                        .forEach((r) => onToggleCheckIn(r.id));
                    }}
                    className="text-[11px] font-bold text-[#0288D1] bg-white border border-[#B6EEFC] px-2 py-0.5 rounded-lg hover:bg-[#E6F8FD] transition-colors cursor-pointer"
                  >
                    Check In All Pending ({filteredAttendanceStats.pending})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMonthFilter('ALL');
                    setSelectedDateFilter('ALL');
                    setSelectedClassFilter('ALL');
                    setAttendanceFilter('ALL');
                    setSearchTerm('');
                  }}
                  className="text-[11px] font-bold text-[#A44A4A] hover:underline cursor-pointer shrink-0"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#E6E1D8] bg-[#F1F4EF] text-[11px] font-semibold uppercase tracking-wider text-[#5C6260]">
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
            <tbody className="divide-y divide-[#E6E1D8]">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#5C6260]">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E5ECE2]">
                      <Search className="h-5 w-5 text-[#5A6952]" />
                    </div>
                    <p className="font-semibold text-sm text-[#2B2E31]">
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
                        setSelectedMonthFilter('ALL');
                        setSelectedDateFilter('ALL');
                        setAttendanceFilter('ALL');
                      }}
                      className="mt-3 text-xs font-semibold text-[#7A8B71] underline"
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
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E5ECE2] text-[#5A6952] font-bold text-xs">
                            {reg.studentName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-[#2B2E31]">
                              {reg.studentName}
                            </p>
                            <span className="font-mono text-[11px] text-[#5C6260]">
                              {reg.bookingRef}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Class Enrolled */}
                      <td className="py-4 px-4">
                        <p className="font-medium text-[#2B2E31] truncate max-w-[180px]">
                          {reg.className}
                        </p>
                        <p className="text-[11px] text-[#5C6260]">
                          <span className="font-medium text-[#2B2E31]">{reg.classDate}</span> • {reg.classTime.split('-')[0].trim()}
                        </p>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4">
                        <p className="text-xs text-[#2B2E31] truncate max-w-[180px]">
                          {reg.email}
                        </p>
                        <a
                          href={`https://wa.me/${reg.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#7A8B71] hover:underline"
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
                          <span className="text-xs text-[#88908D]">
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
                        <div className="text-[10px] text-[#2B2E31] mt-1 font-medium flex items-center gap-1.5">
                          {reg.paymentMethod && (reg.paymentMethod.includes('MTN') || reg.paymentMethod.includes('Telecel') || reg.paymentMethod.includes('AT') || reg.paymentMethod.includes('MoMo')) ? (
                            <MobileMoneyLogo network={reg.paymentMethod} variant="image" size="xs" className="h-4 w-auto rounded-xs shadow-2xs shrink-0" />
                          ) : (
                            <PaystackIcon className="h-2.5 w-2.5 shrink-0" />
                          )}
                          <span className="truncate max-w-[130px]">{reg.paymentMethod || 'Paystack MoMo'}</span>
                        </div>
                        {reg.paystackRef && (
                          <span className="font-mono text-[9px] text-[#5C6260] block truncate max-w-[120px]">
                            {reg.paystackRef}
                          </span>
                        )}
                        {reg.promoCode && (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-[#FAF5EB] border border-[#E8D7B0] px-1.5 py-0.5 text-[9px] font-bold text-[#8C6D23]">
                            Promo: {reg.promoCode}
                            {reg.discountAmount ? ` (-GH₵${reg.discountAmount})` : ''}
                          </span>
                        )}
                      </td>

                      {/* Booked Timestamp */}
                      <td className="py-4 px-4 text-xs text-[#5C6260]">
                        {reg.formattedTime || 'Recent'}
                      </td>

                      {/* Attendance Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleCheckIn(reg.id)}
                          className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
                            reg.checkedIn
                              ? 'bg-[#5A6952] text-white shadow-sm'
                              : 'bg-[#E5ECE2] text-[#5A6952] hover:bg-[#DCE4D9]'
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
                          className="rounded-xl border border-[#E6E1D8] p-1.5 text-[#5C6260] hover:bg-[#FAF8F5] hover:text-[#2B2E31] transition-colors"
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

      {/* Creator Collaborations, Referral Links & Discount Codes Manager */}
      <CreatorReferralsManager registrations={registrations} showToast={showToast} />

      {/* On-Demand Guided Video Management (Admin Portal) */}
      <div id="instructor-video-vault" className="mt-12 pt-8 border-t border-[#E6E1D8] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E5ECE2] border border-[#DCE4D9] px-2.5 py-0.5 text-xs font-semibold text-[#5A6952]">
              <span>Admin Video Vault</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2B2E31] mt-1">
              Manage & Post Guided Videos
            </h2>
            <p className="text-xs sm:text-sm text-[#5C6260]">
              Only administrators can post or remove videos. Visitors on the main site will only be able to preview and purchase sessions.
            </p>
          </div>
        </div>

        {/* Video Vault in Admin Mode (Can Post & Delete Videos) */}
        <ShortVideosSection showToast={showToast} isAdmin={true} />
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