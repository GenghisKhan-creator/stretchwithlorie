import { useState, useMemo, useEffect } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Search,
  Plus,
  CheckCircle2,
  HeartPulse,
  RefreshCw,
  CheckCheck,
  Download,
  FileSpreadsheet,
  Edit3,
  Trash2,
  Gift,
  Sparkles,
  MessageCircle,
  Phone,
  ClipboardList,
  AlertTriangle,
  Clock,
  CreditCard,
  ShieldCheck,
  X
} from 'lucide-react';
import AddClassModal from './AddClassModal';
import EditClassModal from './EditClassModal';
import StudentQuestionnairePage from './StudentQuestionnairePage';
import ShortVideosSection from './ShortVideosSection';
import CreatorReferralsManager from './CreatorReferralsManager';
import EventInquiriesManager from './EventInquiriesManager';
import GiftCardsManager from './GiftCardsManager';
import TransactionsManager from './TransactionsManager';
import MobileMoneyLogo from './MobileMoneyLogo';
import { PaystackIcon } from './RegistrationForm';
import { exportAttendeesToPDF } from '../utils/pdfExport';
import { exportAttendeesToCSV } from '../utils/csvExport';
import { DEFAULT_INSTRUCTOR_AVATAR } from '../data/mockData';
import { api } from '../services/api';
import { studioSocket } from '../services/websocket';

// Helper to normalize phone numbers for Ghanaian WhatsApp (+233)
function cleanPhoneForWhatsApp(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '233' + cleaned.slice(1);
  }
  return cleaned;
}

// Helper to format exact date and time for admin inspection
function formatExactDateTime(dateInput) {
  if (!dateInput) return { dateStr: 'Recent', timeStr: '', fullStr: 'Recent Booking' };
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      return { dateStr: String(dateInput), timeStr: '', fullStr: String(dateInput) };
    }
    const dateStr = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timeStr = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return {
      dateStr,
      timeStr,
      fullStr: `${dateStr} at ${timeStr}`,
      iso: d.toISOString()
    };
  } catch {
    return { dateStr: 'Recent', timeStr: '', fullStr: 'Recent' };
  }
}

// Helper to extract normalized date and month from any registration
function parseRegistrationDate(reg) {
  if (reg.sessionDate && /^\d{4}-\d{2}-\d{2}$/.test(reg.sessionDate)) {
    const [yyyy, mm, dd] = reg.sessionDate.split('-');
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return {
      dateKey: reg.sessionDate,
      monthKey: `${yyyy}-${mm}`,
      monthLabel: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      dateLabel: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      dayName: d.toLocaleDateString('en-US', { weekday: 'long' })
    };
  }

  // Check if registration has a specific slot day (e.g. Wednesday 7:00 AM, Saturday 8:30 AM, Sunday 6:00 PM)
  if (reg.slotLabel) {
    const dayMatch = reg.slotLabel.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Wed|Sat|Sun|Mon|Tue|Thu|Fri)/i);
    if (dayMatch) {
      const day = dayMatch[1];
      const cleanDay = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
      return {
        dateKey: `slot-${cleanDay.toLowerCase()}`,
        monthKey: 'weekly',
        monthLabel: 'Weekly Schedule',
        dateLabel: `${cleanDay} (${reg.slotLabel})`,
        dayName: cleanDay
      };
    }
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
      dateLabel: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      dayName: d.toLocaleDateString('en-US', { weekday: 'long' })
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
      dateLabel: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      dayName: d.toLocaleDateString('en-US', { weekday: 'long' })
    };
  }

  return {
    dateKey: 'unknown',
    monthKey: 'unknown',
    monthLabel: 'Other Sessions',
    dateLabel: raw || 'Flexible Date',
    dayName: 'Flexible Day'
  };
}

// Dynamic list of valid admin tabs
const VALID_ADMIN_TABS = ['roster', 'transactions', 'inquiries', 'giftcards', 'referrals', 'videos'];

function getInitialAdminTab() {
  try {
    const params = new URLSearchParams(window.location.search);
    const tabParam = (params.get('tab') || '').toLowerCase().trim();
    if (VALID_ADMIN_TABS.includes(tabParam)) {
      return tabParam;
    }

    const hash = window.location.hash.replace(/^#/, '').toLowerCase().trim();
    if (VALID_ADMIN_TABS.includes(hash)) {
      return hash;
    }

    const sessionTab = sessionStorage.getItem('stretchwithlorie_admin_active_tab');
    if (sessionTab && VALID_ADMIN_TABS.includes(sessionTab)) {
      return sessionTab;
    }

    const localTab = localStorage.getItem('stretchwithlorie_admin_active_tab');
    if (localTab && VALID_ADMIN_TABS.includes(localTab)) {
      return localTab;
    }
  } catch {
    // fallback
  }
  return 'roster';
}

export default function InstructorDashboard({
  classes,
  registrations,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onToggleCheckIn,
  onRefreshData,
  showToast
}) {
  // Navigation Tab: 'roster' | 'inquiries' | 'giftcards' | 'referrals' | 'videos'
  const [activeTab, setActiveTab] = useState(getInitialAdminTab);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState('ALL'); // 'ALL' | 'CHECKED_IN' | 'PENDING'
  
  // Modals & Edits
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [exportNotice, setExportNotice] = useState(null);

  // Dev Testing: Purge test data modal state
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [purgeConfirmText, setPurgeConfirmText] = useState('');
  const [isPurging, setIsPurging] = useState(false);

  // Student details view state initialized from URL query params
  const [selectedStudentId, setSelectedStudentId] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('studentId') || params.get('regId') || null;
    } catch {
      return null;
    }
  });

  // Derive the active student profile for the full-page view
  const selectedStudentForModal = useMemo(() => {
    if (!selectedStudentId || !registrations?.length) return null;
    return registrations.find(
      (r) => String(r.id) === String(selectedStudentId) || String(r.bookingRef) === String(selectedStudentId)
    ) || null;
  }, [selectedStudentId, registrations]);

  // Tab navigation handler with URL query param & storage persistence
  const handleTabChange = (newTab) => {
    if (!VALID_ADMIN_TABS.includes(newTab)) return;
    setActiveTab(newTab);
    setSelectedStudentId(null);
    try {
      sessionStorage.setItem('stretchwithlorie_admin_active_tab', newTab);
      localStorage.setItem('stretchwithlorie_admin_active_tab', newTab);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTab);
      url.searchParams.delete('studentId');
      url.searchParams.delete('regId');
      window.history.pushState({ tab: newTab }, '', url.toString());
    } catch (err) {
      console.error('Failed to update URL for tab:', err);
    }
  };

  // Open and close student details questionnaire page with URL synchronization
  const handleOpenStudentDetails = (reg) => {
    const studentIdentifier = reg.id || reg.bookingRef;
    setSelectedStudentId(studentIdentifier);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'roster');
      url.searchParams.set('studentId', studentIdentifier);
      window.history.pushState({ tab: 'roster', studentId: studentIdentifier }, '', url.toString());
    } catch (err) {
      console.error('Failed to update URL for student details:', err);
    }
  };

  const handleCloseStudentDetails = () => {
    setSelectedStudentId(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('studentId');
      url.searchParams.delete('regId');
      window.history.pushState({ tab: activeTab }, '', url.toString());
    } catch (err) {
      console.error('Failed to update URL on closing student details:', err);
    }
  };

  // Keep URL query param and storage in sync with activeTab
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('tab') !== activeTab) {
        url.searchParams.set('tab', activeTab);
        window.history.replaceState({ tab: activeTab }, '', url.toString());
      }
      sessionStorage.setItem('stretchwithlorie_admin_active_tab', activeTab);
      localStorage.setItem('stretchwithlorie_admin_active_tab', activeTab);
    } catch (err) {
      console.error('Failed to sync active tab with URL/storage:', err);
    }
  }, [activeTab]);

  // Handle browser Back / Forward navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const tabParam = (params.get('tab') || '').toLowerCase().trim();
        if (VALID_ADMIN_TABS.includes(tabParam)) {
          setActiveTab(tabParam);
        }
        const studentParam = params.get('studentId') || params.get('regId');
        setSelectedStudentId(studentParam || null);
      } catch (err) {
        console.error('Error handling popstate in InstructorDashboard:', err);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Consolidated Dashboard Stats from Backend (classes + videos + gift cards)
  const [dashboardStats, setDashboardStats] = useState(null);
  const [socketStatus, setSocketStatus] = useState(() => studioSocket.getStatus());

  useEffect(() => {
    let isMounted = true;
    const fetchStats = () => {
      api.getDashboardStats().then((data) => {
        if (isMounted && data) {
          setDashboardStats(data);
        }
      }).catch(() => {});
    };

    fetchStats();

    // Live WebSocket connection status
    const unsubStatus = studioSocket.subscribe('STATUS_CHANGE', ({ status }) => {
      if (isMounted) setSocketStatus(status);
    });

    // Refresh stats in real time on any booking, inquiry or gift card event
    const unsubWildcard = studioSocket.subscribe('*', (msg) => {
      if (msg?.type && ['NEW_REGISTRATION', 'NEW_EVENT_INQUIRY', 'NEW_GIFT_CARD', 'GIFT_CARD_REDEEMED'].includes(msg.type)) {
        fetchStats();
      }
    });

    return () => {
      isMounted = false;
      unsubStatus();
      unsubWildcard();
    };
  }, [registrations, classes]);

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

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        reg.studentName.toLowerCase().includes(query) ||
        reg.email.toLowerCase().includes(query) ||
        reg.phone.toLowerCase().includes(query) ||
        reg.bookingRef.toLowerCase().includes(query) ||
        (reg.paystackRef && reg.paystackRef.toLowerCase().includes(query)) ||
        reg.className.toLowerCase().includes(query);

      const matchesClass =
        selectedClassFilter === 'ALL' || reg.classId === selectedClassFilter;

      const regDateInfo = parseRegistrationDate(reg);

      const matchesMonth =
        selectedMonthFilter === 'ALL' || regDateInfo.monthKey === selectedMonthFilter;

      const matchesDate =
        selectedDateFilter === 'ALL' ||
        regDateInfo.dateKey === selectedDateFilter ||
        (regDateInfo.dayName && regDateInfo.dayName.toLowerCase() === selectedDateFilter.toLowerCase()) ||
        (reg.slotLabel && reg.slotLabel.toLowerCase().includes(selectedDateFilter.toLowerCase()));

      const matchesAttendance =
        attendanceFilter === 'ALL' ||
        (attendanceFilter === 'CHECKED_IN' && reg.checkedIn) ||
        (attendanceFilter === 'PENDING' && !reg.checkedIn);

      return matchesSearch && matchesClass && matchesMonth && matchesDate && matchesAttendance;
    });
  }, [registrations, searchTerm, selectedClassFilter, selectedMonthFilter, selectedDateFilter, attendanceFilter]);

  // Attendance metrics
  const filteredAttendanceStats = useMemo(() => {
    const total = filteredRegistrations.length;
    const checkedIn = filteredRegistrations.filter((r) => r.checkedIn).length;
    const pending = total - checkedIn;
    const attendanceRate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
    return { total, checkedIn, pending, attendanceRate };
  }, [filteredRegistrations]);

  // PDF Export Trigger
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
      setExportNotice(`Downloaded PDF (${result.filename}) for ${result.count} attendees!`);
      setTimeout(() => setExportNotice(null), 5000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // CSV Export Trigger
  const handleExportCSV = () => {
    const targetList = filteredRegistrations.length > 0 ? filteredRegistrations : registrations;
    if (targetList.length === 0) {
      alert('No attendee records match the current filter to export.');
      return;
    }
    const result = exportAttendeesToCSV(targetList);
    setExportNotice(`Downloaded CSV (${result.filename}) for ${result.count} attendees!`);
    setTimeout(() => setExportNotice(null), 5000);
  };

  // Class Delete Handler
  const handleDeleteClass = async (cls) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${cls.title}" from the studio schedule? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      if (onDeleteClass) {
        await onDeleteClass(cls.id);
      } else {
        await api.deleteClass(cls.id);
        showToast?.('success', `Class "${cls.title}" deleted.`);
        onRefreshData?.();
      }
    } catch (err) {
      showToast?.('error', err.message || 'Failed to delete class.');
    }
  };

  // Dev Testing Tool: Purge all operational records while preserving admin auth
  const handlePurgeTestData = async () => {
    if (purgeConfirmText.trim().toUpperCase() !== 'RESET') {
      showToast?.('error', 'Please type "RESET" to confirm purging test data.');
      return;
    }

    try {
      setIsPurging(true);
      const res = await api.purgeTestData();
      showToast?.('success', res.message || 'Studio test data cleared successfully!');
      setIsPurgeModalOpen(false);
      setPurgeConfirmText('');
      if (onRefreshData) {
        await onRefreshData();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error('Purge error:', err);
      showToast?.('error', err.message || 'Failed to purge database test data.');
    } finally {
      setIsPurging(false);
    }
  };

  // DEDICATED FULL-PAGE VIEW: Student Profile & Questionnaire Page
  if (selectedStudentForModal) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <StudentQuestionnairePage
          registration={selectedStudentForModal}
          onBack={handleCloseStudentDetails}
          onToggleCheckIn={onToggleCheckIn}
        />
      </div>
    );
  }

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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-[#E5ECE2] border border-[#DCE4D9] px-2.5 py-0.5 text-xs font-semibold text-[#5A6952]">
                Instructor Control Center
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F8FD] border border-[#B6EEFC] px-2 py-0.5 text-[11px] font-bold text-[#0288D1]">
                <PaystackIcon className="h-3 w-3" />
                Paystack Live
              </span>
              {socketStatus === 'connected' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF7EE] border border-[#BCE8C5] px-2.5 py-0.5 text-[11px] font-bold text-[#207D38]">
                  <span className="h-2 w-2 rounded-full bg-[#207D38] animate-pulse" />
                  Realtime Live
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 border border-stone-200 px-2 py-0.5 text-[11px] font-medium text-stone-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
                  {socketStatus === 'reconnecting' ? 'Reconnecting...' : 'Connecting...'}
                </span>
              )}
            </div>
            <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-[#2B2E31]">
              Studio Operations & Administration
            </h1>
            <p className="text-xs sm:text-sm text-[#5C6260] mt-0.5">
              Welcome back, Lorie. Monitor classes, attendee rosters, celebration inquiries, and wellness gift vouchers.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dev Testing Control: Purge Test Data Button */}
          <button
            type="button"
            onClick={() => {
              setPurgeConfirmText('');
              setIsPurgeModalOpen(true);
            }}
            title="Dev Testing Tool: Wipe test bookings, passes, inquiries, and reset capacities (Preserves Admin Auth)"
            className="flex items-center gap-1.5 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-3.5 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer group"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-500 group-hover:text-red-700 transition-colors" />
            <span className="hidden sm:inline">Purge Test Data (Dev)</span>
            <span className="sm:hidden">Purge Data</span>
          </button>

          {onRefreshData && (
            <button
              type="button"
              onClick={onRefreshData}
              title="Refresh All Studio Data"
              className="flex items-center gap-1.5 rounded-2xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs font-semibold text-[#5C6260] hover:bg-[#FAF8F5] hover:text-[#2B2E31] transition-all shadow-2xs cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          )}

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

      {/* Modern Studio Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E6E1D8] no-scrollbar">
        <button
          type="button"
          onClick={() => handleTabChange('roster')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'roster'
              ? 'bg-[#232D21] text-[#F7E7C4] shadow-md'
              : 'bg-white text-[#5C6260] border border-[#E6E1D8] hover:bg-[#FAF8F5] hover:text-[#2B2E31]'
          }`}
        >
          <Calendar className="h-4 w-4 text-[#7A8B71]" />
          <span>Classes & Rosters</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-mono">
            {registrations.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('transactions')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'transactions'
              ? 'bg-[#232D21] text-[#F7E7C4] shadow-md'
              : 'bg-white text-[#5C6260] border border-[#E6E1D8] hover:bg-[#FAF8F5] hover:text-[#2B2E31]'
          }`}
        >
          <CreditCard className="h-4 w-4 text-[#C8A253]" />
          <span>Financial Transactions</span>
          {dashboardStats?.stats?.totalRevenueGHS ? (
            <span className="rounded-full bg-[#FAF5EB] text-[#8C6D23] border border-[#E8D7B0] px-2 py-0.5 text-[10px] font-bold">
              GH₵{dashboardStats.stats.totalRevenueGHS.toLocaleString()}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('inquiries')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'inquiries'
              ? 'bg-[#232D21] text-[#F7E7C4] shadow-md'
              : 'bg-white text-[#5C6260] border border-[#E6E1D8] hover:bg-[#FAF8F5] hover:text-[#2B2E31]'
          }`}
        >
          <Sparkles className="h-4 w-4 text-[#C8A253]" />
          <span>Private Event Inquiries</span>
          {dashboardStats?.stats?.eventInquiriesCount ? (
            <span className="rounded-full bg-[#C8A253] text-[#232D21] px-2 py-0.5 text-[10px] font-bold">
              {dashboardStats.stats.eventInquiriesCount}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('giftcards')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'giftcards'
              ? 'bg-[#232D21] text-[#F7E7C4] shadow-md'
              : 'bg-white text-[#5C6260] border border-[#E6E1D8] hover:bg-[#FAF8F5] hover:text-[#2B2E31]'
          }`}
        >
          <Gift className="h-4 w-4 text-[#C8A253]" />
          <span>Gift Cards Desk</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('referrals')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'referrals'
              ? 'bg-[#232D21] text-[#F7E7C4] shadow-md'
              : 'bg-white text-[#5C6260] border border-[#E6E1D8] hover:bg-[#FAF8F5] hover:text-[#2B2E31]'
          }`}
        >
          <TrendingUp className="h-4 w-4 text-[#C8A253]" />
          <span>Creator Promo Codes</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('videos')}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'videos'
              ? 'bg-[#232D21] text-[#F7E7C4] shadow-md'
              : 'bg-white text-[#5C6260] border border-[#E6E1D8] hover:bg-[#FAF8F5] hover:text-[#2B2E31]'
          }`}
        >
          <Plus className="h-4 w-4 text-[#7A8B71]" />
          <span>Video Vault</span>
        </button>
      </div>

      {/* Export notification badge */}
      {exportNotice && (
        <div className="rounded-2xl bg-[#E5ECE2] border border-[#DCE4D9] p-3 text-xs font-semibold text-[#5A6952] flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-[#5A6952]" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: CLASSES & ATTENDEE ROSTERS */}
      {/* ============================================================== */}
      {activeTab === 'roster' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Key Metric Stat Cards (Consolidated with video & gift card revenue) */}
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

            {/* Total Studio Revenue */}
            <div className="rounded-3xl border border-[#E6E1D8] bg-white p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5C6260]">
                  Gross Studio Intake
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF5EB] text-[#8C6D23] border border-[#E8D7B0]">
                  <DollarSign className="h-4 w-4 text-[#C8A253]" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2E31]">
                    GH₵{dashboardStats?.stats?.totalRevenueGHS ? dashboardStats.stats.totalRevenueGHS.toLocaleString() : stats.totalRevenue.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-medium text-[#8C6D23]">
                    collected
                  </span>
                </div>
                {dashboardStats?.stats?.revenueBreakdown && (
                  <p className="text-[10px] text-[#5C6260] mt-1 truncate">
                    Classes: GH₵{dashboardStats.stats.revenueBreakdown.classBookingsGHS} • Videos: GH₵{dashboardStats.stats.revenueBreakdown.videoVaultGHS} • Gifts: GH₵{dashboardStats.stats.revenueBreakdown.giftCardsGHS}
                  </p>
                )}
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

          {/* Class Capacity Overview (With Edit & Delete Capabilities) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2B2E31]">
                  Class Capacity & Schedule Controls
                </h2>
                <p className="text-xs text-[#5C6260]">
                  Adjust room capacities, update session prices, or filter attendee rosters.
                </p>
              </div>
              {selectedClassFilter !== 'ALL' && (
                <button
                  onClick={() => setSelectedClassFilter('ALL')}
                  className="text-xs font-semibold text-[#7A8B71] hover:underline cursor-pointer"
                >
                  Clear Class Filter
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map((cls) => {
                const booked = cls.bookedCount || 0;
                const max = cls.maxCapacity || 1;
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
                        <div className="flex items-center gap-1.5">
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

                          {/* Class Action Buttons: Edit & Delete */}
                          <button
                            type="button"
                            onClick={() => setEditingClass(cls)}
                            className="rounded-lg p-1 text-[#5C6260] hover:text-[#2B2E31] hover:bg-[#FAF5EB] transition-colors"
                            title="Edit class pricing & capacity"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-[#8C6D23]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClass(cls)}
                            className="rounded-lg p-1 text-[#5C6260] hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="Delete this class"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-serif text-base font-bold text-[#2B2E31]">
                        {cls.title}
                      </h3>
                      <p className="text-xs text-[#5C6260] mt-0.5">
                        {cls.instructor?.name || 'Lorie'} • {cls.room || 'Studio Sanctuary'}
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
                      {/* Daily Slot Breakdown (e.g. Wed, Sat, Sun counts) */}
                      {cls.hasScheduleSlots && cls.scheduleSlots?.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-[#E6E1D8]/70 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold text-[#5C6260] uppercase tracking-wider">
                            <span>Day Slots</span>
                            <span>Mats Booked</span>
                          </div>
                          <div className="space-y-1">
                            {cls.scheduleSlots.map((slot) => (
                              <div
                                key={slot.id}
                                className="flex items-center justify-between text-[11px] bg-[#FAF8F5] rounded-xl px-2.5 py-1 border border-[#E6E1D8]/60"
                              >
                                <span className="font-medium text-[#2B2E31] truncate mr-2">
                                  {slot.label || `${slot.day} ${slot.time}`}
                                </span>
                                <span
                                  className={`font-bold shrink-0 ${
                                    slot.isFull
                                      ? 'text-stone-500'
                                      : slot.spotsLeft <= 2
                                      ? 'text-amber-800'
                                      : 'text-[#5A6952]'
                                  }`}
                                >
                                  {slot.bookedCount} / {slot.maxCapacity} {slot.isFull ? '(Sold Out)' : `(${slot.spotsLeft} left)`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Filter Quick Action */}
                    <div className="mt-4 pt-3 border-t border-[#E6E1D8] flex items-center justify-between">
                      <span className="text-xs text-[#5C6260] font-semibold">
                        GH₵{cls.price} / ticket
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedClassFilter(isFilterActive ? 'ALL' : cls.id)
                        }
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
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

                {/* Export Buttons: PDF & CSV */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleExportPDF({ forceDownload: true })}
                    className="flex items-center gap-1.5 rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2 text-xs font-semibold text-[#2B2E31] hover:bg-[#FAF8F5] transition-all shadow-2xs cursor-pointer"
                    title="Download branded PDF roster table"
                  >
                    <Download className="h-3.5 w-3.5 text-[#7A8B71]" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2 text-xs font-semibold text-[#2B2E31] hover:bg-[#FAF8F5] transition-all shadow-2xs cursor-pointer"
                    title="Download CSV for Excel / Sheets"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-[#5A6952]" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Attendance quick counters */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium pt-1 border-t border-[#E6E1D8]/60">
                <span className="text-[#5C6260]">Session Attendance:</span>
                <span className="rounded-full bg-white border border-[#E6E1D8] px-2.5 py-0.5 text-[#2B2E31] font-semibold">
                  Total: {filteredAttendanceStats.total}
                </span>
                <span className="rounded-full bg-[#E5ECE2] border border-[#DCE4D9] px-2.5 py-0.5 text-[#5A6952] font-semibold flex items-center gap-1">
                  <CheckCheck className="h-3 w-3" />
                  Checked In: {filteredAttendanceStats.checkedIn}
                </span>
                <span className="rounded-full bg-[#FAF5EB] border border-[#E8D7B0] px-2.5 py-0.5 text-[#8C6D23] font-semibold">
                  Pending: {filteredAttendanceStats.pending}
                </span>
                <span className="rounded-full bg-white border border-[#E6E1D8] px-2.5 py-0.5 text-[#5C6260] font-semibold">
                  Check-in Rate: {filteredAttendanceStats.attendanceRate}%
                </span>
                {selectedDateFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setSelectedDateFilter('ALL')}
                    className="inline-flex items-center gap-1 rounded-full bg-[#EBF0E9] text-[#2F3C2C] px-2.5 py-0.5 text-[11px] font-bold border border-[#7A8B71]/40 hover:bg-[#DDE4DA] transition-colors cursor-pointer"
                  >
                    <span>Day Filter Active</span>
                    <span className="text-[10px]">✕</span>
                  </button>
                )}
              </div>

              {/* Quick Day & Session Headcount Pills Strip */}
              {availableDates.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none flex-nowrap">
                  <span className="text-[11px] font-bold text-[#5C6260] uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-[#7A8B71]" />
                    <span>Day Headcount:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedDateFilter('ALL')}
                    className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedDateFilter === 'ALL'
                        ? 'bg-[#232D21] text-[#F7E7C4] shadow-xs'
                        : 'bg-white border border-[#E6E1D8] text-[#5C6260] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    All Days ({registrations.length})
                  </button>
                  {availableDates.map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setSelectedDateFilter(selectedDateFilter === d.key ? 'ALL' : d.key)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        selectedDateFilter === d.key
                          ? 'bg-[#7A8B71] text-white shadow-xs ring-2 ring-[#7A8B71]/30'
                          : 'bg-white border border-[#E6E1D8] text-[#2B2E31] hover:border-[#7A8B71] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <span>{d.label}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                          selectedDateFilter === d.key ? 'bg-white/20 text-white' : 'bg-[#E5ECE2] text-[#5A6952]'
                        }`}
                      >
                        {d.count} booked
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Filters Row (5-column responsive layout) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {/* 1. Search Input */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5C6260]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search attendee, email, ref..."
                    className="w-full rounded-2xl border border-[#E6E1D8] bg-white pl-10 pr-4 py-2.5 text-xs text-[#2B2E31] focus:border-[#7A8B71] focus:ring-1 focus:ring-[#7A8B71] outline-none shadow-2xs"
                  />
                </div>

                {/* 2. Class Filter */}
                <div>
                  <select
                    value={selectedClassFilter}
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                    className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2.5 text-xs text-[#2B2E31] focus:border-[#7A8B71] outline-none shadow-2xs cursor-pointer"
                  >
                    <option value="ALL">All Scheduled Classes</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Specific Day / Session Date Filter */}
                <div>
                  <select
                    value={selectedDateFilter}
                    onChange={(e) => setSelectedDateFilter(e.target.value)}
                    className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2.5 text-xs text-[#2B2E31] focus:border-[#7A8B71] outline-none shadow-2xs cursor-pointer"
                  >
                    <option value="ALL">All Days / Dates ({registrations.length})</option>
                    {availableDates.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.label} ({d.count} booked)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Month Filter */}
                <div>
                  <select
                    value={selectedMonthFilter}
                    onChange={(e) => {
                      setSelectedMonthFilter(e.target.value);
                      setSelectedDateFilter('ALL');
                    }}
                    className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2.5 text-xs text-[#2B2E31] focus:border-[#7A8B71] outline-none shadow-2xs cursor-pointer"
                  >
                    <option value="ALL">All Months</option>
                    {availableMonths.map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.label} ({m.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Attendance Status Filter */}
                <div>
                  <select
                    value={attendanceFilter}
                    onChange={(e) => setAttendanceFilter(e.target.value)}
                    className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2.5 text-xs text-[#2B2E31] focus:border-[#7A8B71] outline-none shadow-2xs cursor-pointer"
                  >
                    <option value="ALL">All Attendance States</option>
                    <option value="CHECKED_IN">Checked In (Present)</option>
                    <option value="PENDING">Pending Check-in</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Attendees Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-wider text-[#5C6260] border-b border-[#E6E1D8]">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Yogi Name & Ref</th>
                    <th className="py-3.5 px-4">Class Session</th>
                    <th className="py-3.5 px-4">Contact Info & Outreach</th>
                    <th className="py-3.5 px-4">Intake & Notes</th>
                    <th className="py-3.5 px-4">Paystack Status</th>
                    <th className="py-3.5 px-4">Booked At</th>
                    <th className="py-3.5 px-4 text-center">Attendance</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E1D8]">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-[#5C6260]">
                        <p className="font-serif text-base font-bold text-[#2B2E31]">
                          No yogi registrations found
                        </p>
                        <p className="text-xs text-[#5C6260] mt-1">
                          Try modifying your search query or selecting a different class filter.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => {
                      const intake = reg.intake || null;
                      const notesText = reg.healthNotes || '';
                      const hasInjuries = intake?.hasInjuries === 'Yes' || (notesText && notesText.includes('Injuries/Conditions:') && !notesText.includes('None reported'));
                      const injurySnippet = intake?.injuriesDetails || (notesText.match(/Injuries\/Conditions:\s*([^•]+)/)?.[1]?.trim()) || 'Injuries reported';
                      const isPregnant = intake?.pregnancyStatus === 'Pregnant' || notesText.includes('Currently Pregnant');
                      const mainGoal = intake?.customGoal || intake?.mainGoal || (notesText.match(/Goal:\s*([^•]+)/)?.[1]?.trim()) || 'Flexibility & Mobility';
                      const experienceLevel = intake?.experienceLevel || (notesText.includes('Intermediate') ? 'Intermediate' : (notesText.includes('Advanced') ? 'Advanced' : 'Beginner'));

                      const waPhone = cleanPhoneForWhatsApp(reg.phone);

                      return (
                        <tr key={reg.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          {/* Student Name & Booking Ref */}
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E5ECE2] text-[#5A6952] font-bold font-serif shrink-0">
                                {reg.studentName.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-serif font-bold text-[#2B2E31] text-sm">
                                  {reg.studentName}
                                </p>
                                <span className="font-mono text-[10px] text-[#5C6260] bg-stone-100 px-1.5 py-0.5 rounded-sm">
                                  {reg.bookingRef}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Class Name & Time */}
                          <td className="py-4 px-4">
                            <p className="font-medium text-[#2B2E31] max-w-xs xl:max-w-sm 2xl:max-w-md">
                              {reg.className}
                            </p>
                            <p className="text-[11px] text-[#5C6260] mt-0.5">
                              <span className="font-medium text-[#2B2E31]">{reg.classDate}</span> • {reg.classTime ? reg.classTime.split('-')[0].trim() : 'Session'}
                            </p>
                          </td>

                          {/* Contact Info & 1-Click Outreach */}
                          <td className="py-4 px-4">
                            <p className="text-xs text-[#2B2E31] max-w-xs xl:max-w-sm font-medium">
                              {reg.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-[#5C6260] font-mono">{reg.phone}</span>
                              {waPhone && (
                                <a
                                  href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                                    `Hello ${reg.studentName}! This is Lorie from Stretch with Lorie. Looking forward to having you for ${reg.className}!`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-[#5A6952] bg-[#E5ECE2] border border-[#DCE4D9] px-2 py-0.5 rounded-md hover:bg-[#DCE4D9] transition-colors"
                                  title="WhatsApp Student"
                                >
                                  <MessageCircle className="h-3 w-3 text-[#5A6952]" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                              <a
                                href={`tel:${reg.phone}`}
                                className="text-[10px] font-semibold text-[#7A8B71] hover:underline"
                                title="Call Student"
                              >
                                <Phone className="h-3 w-3 inline text-[#7A8B71]" />
                              </a>
                            </div>
                          </td>

                          {/* Intake Questionnaire & Safety Alerts */}
                          <td className="py-4 px-4">
                            <div className="space-y-1.5 max-w-sm 2xl:max-w-md">
                              <button
                                type="button"
                                onClick={() => handleOpenStudentDetails(reg)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E6E1D8] bg-white hover:bg-[#FAF5EB] hover:border-[#C8A253]/60 px-2.5 py-1 text-xs font-bold text-[#2B2E31] transition-all cursor-pointer shadow-2xs group"
                                title="Click to view full questionnaire answers"
                              >
                                <ClipboardList className="h-3.5 w-3.5 text-[#5A6952] group-hover:text-[#C8A253] transition-colors" />
                                <span>View Questionnaire</span>
                              </button>

                              <div className="flex flex-col gap-1">
                                {hasInjuries ? (
                                  <span
                                    onClick={() => handleOpenStudentDetails(reg)}
                                    className="cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold text-red-800 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md hover:bg-red-100 transition-colors"
                                    title={`Injuries: ${injurySnippet}`}
                                  >
                                    <AlertTriangle className="h-3 w-3 text-red-600 shrink-0" />
                                    <span className="truncate max-w-xs">{injurySnippet}</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-[#5C6260] flex items-center gap-1 truncate" title={mainGoal}>
                                    <HeartPulse className="h-3 w-3 text-[#5A6952] shrink-0" />
                                    <span className="truncate">{experienceLevel} • {mainGoal}</span>
                                  </span>
                                )}

                                {isPregnant && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                                    <span>🤰 Pregnant</span>
                                  </span>
                                )}
                              </div>
                            </div>
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
                              <span className="truncate max-w-[200px] xl:max-w-xs">{reg.paymentMethod || 'Paystack MoMo'}</span>
                            </div>
                            {reg.paystackRef && (
                              <span className="font-mono text-[9px] text-[#5C6260] block truncate max-w-[180px] xl:max-w-xs">
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
                          <td className="py-4 px-4">
                            {(() => {
                              const ts = formatExactDateTime(reg.registeredAt || reg.formattedTime);
                              return (
                                <div
                                  className="flex flex-col text-xs max-w-[130px] group cursor-default"
                                  title={`Exact booking time: ${ts.fullStr}${reg.bookingRef ? ` (${reg.bookingRef})` : ''}`}
                                >
                                  <span className="font-semibold text-[#2B2E31] flex items-center gap-1.5 whitespace-nowrap">
                                    <Calendar className="h-3 w-3 text-[#5A6952] shrink-0" />
                                    <span>{ts.dateStr}</span>
                                  </span>
                                  {ts.timeStr ? (
                                    <span className="text-[11px] text-[#5C6260] font-mono flex items-center gap-1 mt-0.5 whitespace-nowrap">
                                      <Clock className="h-2.5 w-2.5 text-[#C8A253] shrink-0" />
                                      <span>{ts.timeStr}</span>
                                    </span>
                                  ) : null}
                                </div>
                              );
                            })()}
                          </td>

                          {/* Attendance Toggle */}
                          <td className="py-4 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => onToggleCheckIn(reg.id)}
                              className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
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
                              onClick={() => handleOpenStudentDetails(reg)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E6E1D8] bg-white hover:bg-[#FAF8F5] px-3 py-1.5 text-xs font-semibold text-[#5C6260] hover:text-[#2B2E31] transition-colors cursor-pointer shadow-2xs"
                              title="View Full Questionnaire & Student Profile"
                            >
                              <ClipboardList className="h-3.5 w-3.5 text-[#5A6952]" />
                              <span>Details</span>
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
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: FINANCIAL TRANSACTIONS & MASTER REVENUE LEDGER */}
      {/* ============================================================== */}
      {activeTab === 'transactions' && (
        <TransactionsManager showToast={showToast} />
      )}

      {/* ============================================================== */}
      {/* TAB 3: PRIVATE CELEBRATIONS & EVENT INQUIRIES */}
      {/* ============================================================== */}
      {activeTab === 'inquiries' && (
        <EventInquiriesManager showToast={showToast} />
      )}

      {/* ============================================================== */}
      {/* TAB 3: GIFT CARDS & FRONT DESK REDEMPTION */}
      {/* ============================================================== */}
      {activeTab === 'giftcards' && (
        <GiftCardsManager showToast={showToast} />
      )}

      {/* ============================================================== */}
      {/* TAB 4: CREATOR COLLABORATIONS & PROMO CODES */}
      {/* ============================================================== */}
      {activeTab === 'referrals' && (
        <CreatorReferralsManager registrations={registrations} showToast={showToast} />
      )}

      {/* ============================================================== */}
      {/* TAB 5: VIDEO VAULT MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'videos' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E1D8] pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E5ECE2] border border-[#DCE4D9] px-2.5 py-0.5 text-xs font-semibold text-[#5A6952]">
                <span>Admin Video Vault</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2B2E31] mt-1">
                Manage & Post Guided Stretch Videos
              </h2>
              <p className="text-xs sm:text-sm text-[#5C6260]">
                Publish on-demand stretching sessions, set pricing, and monitor digital paywall unlocks.
              </p>
            </div>
          </div>

          <ShortVideosSection showToast={showToast} isAdmin={true} />
        </div>
      )}

      {/* Add Class Modal */}
      <AddClassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddClass={onAddClass}
      />

      {/* Edit Class Modal */}
      <EditClassModal
        key={editingClass?.id || 'none'}
        isOpen={Boolean(editingClass)}
        yogaClass={editingClass}
        onClose={() => setEditingClass(null)}
        onSaveClass={async (id, data) => {
          if (onUpdateClass) {
            await onUpdateClass(id, data);
          } else {
            await api.updateClass(id, data);
            showToast?.('success', 'Class updated successfully.');
            onRefreshData?.();
          }
        }}
      />

      {/* =========================================================================
          DEV TESTING CONTROL: PURGE ALL OPERATIONAL TEST DATA MODAL
         ========================================================================= */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[#E6E1D8] shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E6E1D8] pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold text-red-800">
                    <span>Dev Testing Tool</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#2B2E31] mt-0.5">
                    Wipe Studio Test Data
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPurgeModalOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scope Explanation */}
            <div className="space-y-3 text-xs text-[#5C6260]">
              <p className="font-semibold text-[#2B2E31]">
                This will purge all operational testing records from the database so you can test fresh:
              </p>

              <div className="rounded-2xl bg-red-50/70 border border-red-200/80 p-3.5 space-y-2 text-[#2B2E31]">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✕</span>
                  <span>Delete all <strong>student registrations & class bookings</strong> ({registrations.length} records)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✕</span>
                  <span>Delete all <strong>Monthly Flow Passes & wellness gift vouchers</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✕</span>
                  <span>Delete all <strong>private celebration event inquiries</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✕</span>
                  <span>Delete all <strong>pay-per-view video library unlocks</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#5A6952] font-bold">✓</span>
                  <span>Reset all <strong>classes back to 0 booked attendees</strong> (full room spots restored)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#5A6952] font-bold">✓</span>
                  <span>Reset all <strong>creator referral promo uses & commission back to 0</strong></span>
                </div>
              </div>

              {/* Security Preservation Guarantee */}
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 flex items-start gap-2.5 text-emerald-900">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block">Admin Authentication is 100% Preserved</span>
                  <p className="text-[11px] text-emerald-800">
                    Your login PIN, admin session, passwords, and security tokens are untouched. You will remain logged in.
                  </p>
                </div>
              </div>

              {/* Production Note */}
              <p className="text-[11px] text-[#8C6D23] italic bg-[#FAF5EB] p-2.5 rounded-xl border border-[#E8D7B0]">
                Note: This button and endpoint are temporary development utilities and will be destroyed prior to production deployment.
              </p>
            </div>

            {/* Safety Confirmation Input */}
            <div className="space-y-2 pt-2 border-t border-[#E6E1D8]">
              <label className="block text-xs font-bold text-[#2B2E31]">
                Type <span className="font-mono text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">RESET</span> to confirm:
              </label>
              <input
                type="text"
                value={purgeConfirmText}
                onChange={(e) => setPurgeConfirmText(e.target.value)}
                placeholder="RESET"
                className="w-full rounded-2xl border border-[#E6E1D8] bg-[#FAF8F5] px-4 py-2.5 font-mono font-bold text-xs uppercase tracking-wider text-[#2B2E31] outline-none focus:border-red-500 focus:bg-white shadow-2xs"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E6E1D8]">
              <button
                type="button"
                onClick={() => setIsPurgeModalOpen(false)}
                disabled={isPurging}
                className="rounded-2xl border border-[#E6E1D8] bg-white px-4 py-2.5 text-xs font-semibold text-[#5C6260] hover:bg-[#FAF8F5] transition-all cursor-pointer"
              >
                Cancel / Keep Data
              </button>

              <button
                type="button"
                onClick={handlePurgeTestData}
                disabled={purgeConfirmText.trim().toUpperCase() !== 'RESET' || isPurging}
                className="flex items-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2.5 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
              >
                {isPurging ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Purging Data...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Confirm & Wipe Test Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
