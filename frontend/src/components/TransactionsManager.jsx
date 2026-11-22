import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Search,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  CreditCard,
  Sparkles,
  Phone,
  FileSpreadsheet,
  Layers,
  Gift,
  Video,
  ShieldCheck,
  X
} from 'lucide-react';
import MobileMoneyLogo from './MobileMoneyLogo';
import { PaystackIcon } from './RegistrationForm';
import { api } from '../services/api';
import { studioSocket } from '../services/websocket';

// Helper to format exact date and time for ledger inspection
function formatExactDateTime(dateInput) {
  if (!dateInput) return { dateStr: 'Recent', timeStr: '', fullStr: 'Recent' };
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

export default function TransactionsManager({ showToast }) {
  const [transactions, setTransactions] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRevenueGHS: 0,
    todayRevenueGHS: 0,
    monthRevenueGHS: 0,
    avgOrderValueGHS: 0,
    totalCount: 0,
    breakdown: {
      classBookings: 0,
      flowPasses: 0,
      giftCards: 0,
      videoUnlocks: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [streamFilter, setStreamFilter] = useState('ALL'); // 'ALL' | 'class_booking' | 'pass_purchase' | 'gift_card_purchase' | 'video_purchase'
  const [paymentFilter, setPaymentFilter] = useState('ALL'); // 'ALL' | 'momo' | 'card' | 'pass' | 'desk'
  const [timeFilter, setTimeFilter] = useState('ALL'); // 'ALL' | 'today' | 'week' | 'month'
  const [copiedRef, setCopiedRef] = useState(null);
  const [inspectedTx, setInspectedTx] = useState(null);

  // Fetch transactions from backend
  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getAllTransactions();
      if (res && res.data) {
        setTransactions(res.data);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
      showToast?.('error', 'Failed to load financial transactions.');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let isMounted = true;
    api.getAllTransactions()
      .then((res) => {
        if (isMounted && res?.data) {
          setTransactions(res.data);
          if (res.metrics) setMetrics(res.metrics);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load transactions on mount:', err);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time synchronization when new bookings or gift cards are purchased
  useEffect(() => {
    const unsubReg = studioSocket.subscribe('NEW_REGISTRATION', () => {
      loadTransactions();
    });
    const unsubCard = studioSocket.subscribe('NEW_GIFT_CARD', () => {
      loadTransactions();
    });
    const unsubRedeemed = studioSocket.subscribe('GIFT_CARD_REDEEMED', () => {
      loadTransactions();
    });

    return () => {
      unsubReg();
      unsubCard();
      unsubRedeemed();
    };
  }, [loadTransactions]);

  // 1-Click Copy Reference (Paystack or Booking Ref)
  const handleCopyRef = (ref, label = 'Reference') => {
    if (!ref) return;
    navigator.clipboard?.writeText(ref);
    setCopiedRef(ref);
    showToast?.('info', `📋 Copied ${label}: ${ref}`);
    setTimeout(() => setCopiedRef(null), 2500);
  };

  // Filtered transactions calculation
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCustomer = (tx.customerName || '').toLowerCase().includes(q);
        const matchPhone = (tx.customerPhone || '').toLowerCase().includes(q);
        const matchEmail = (tx.customerEmail || '').toLowerCase().includes(q);
        const matchItem = (tx.itemTitle || '').toLowerCase().includes(q);
        const matchBookingRef = (tx.bookingRef || '').toLowerCase().includes(q);
        const matchPaystackRef = (tx.paystackRef || '').toLowerCase().includes(q);
        const matchPromo = (tx.promoCode || '').toLowerCase().includes(q);
        if (!matchCustomer && !matchPhone && !matchEmail && !matchItem && !matchBookingRef && !matchPaystackRef && !matchPromo) {
          return false;
        }
      }

      // 2. Stream Type
      if (streamFilter !== 'ALL') {
        if (streamFilter === 'passes_and_cards') {
          if (tx.streamType !== 'pass_purchase' && tx.streamType !== 'gift_card_purchase') return false;
        } else if (tx.streamType !== streamFilter) {
          return false;
        }
      }

      // 3. Payment Method
      if (paymentFilter !== 'ALL') {
        const pm = (tx.paymentMethod || '').toLowerCase();
        if (paymentFilter === 'momo' && !pm.includes('momo') && !pm.includes('mtn') && !pm.includes('telecel') && !pm.includes('at')) {
          return false;
        }
        if (paymentFilter === 'card' && !pm.includes('card')) {
          return false;
        }
        if (paymentFilter === 'pass' && !pm.includes('pass') && !pm.includes('voucher')) {
          return false;
        }
        if (paymentFilter === 'desk' && !pm.includes('desk') && !pm.includes('studio desk')) {
          return false;
        }
      }

      // 4. Time Window Filter
      if (timeFilter !== 'ALL' && tx.timestamp) {
        const txDate = new Date(tx.timestamp);
        const now = new Date();
        if (timeFilter === 'today') {
          const isToday = txDate.toDateString() === now.toDateString();
          if (!isToday) return false;
        } else if (timeFilter === 'week') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          if (txDate < sevenDaysAgo) return false;
        } else if (timeFilter === 'month') {
          const isSameMonth = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
          if (!isSameMonth) return false;
        }
      }

      return true;
    });
  }, [transactions, searchQuery, streamFilter, paymentFilter, timeFilter]);

  // Dynamic metrics computed from filtered set
  const filteredTotalGHS = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => acc + (tx.amount || 0), 0);
  }, [filteredTransactions]);

  // Export filtered transactions to CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      showToast?.('warning', 'No transactions found to export.');
      return;
    }

    const headers = [
      'Transaction ID',
      'Exact Date',
      'Exact Time',
      'Stream Type',
      'Service / Item Purchased',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'Gross Amount (GHS)',
      'Discount Applied (GHS)',
      'Promo Code',
      'Payment Method',
      'Payment Gateway',
      'Paystack Reference',
      'Booking Reference / Code',
      'Payment Status'
    ];

    const rows = filteredTransactions.map((tx) => {
      const dt = formatExactDateTime(tx.timestamp);
      return [
        `"${tx.id}"`,
        `"${dt.dateStr}"`,
        `"${dt.timeStr}"`,
        `"${tx.streamLabel || tx.streamType}"`,
        `"${(tx.itemTitle || '').replace(/"/g, '""')}"`,
        `"${(tx.customerName || '').replace(/"/g, '""')}"`,
        `"${tx.customerPhone || ''}"`,
        `"${tx.customerEmail || ''}"`,
        (tx.amount || 0).toFixed(2),
        (tx.discountAmount || 0).toFixed(2),
        `"${tx.promoCode || ''}"`,
        `"${(tx.paymentMethod || '').replace(/"/g, '""')}"`,
        `"${tx.paymentGateway || 'Paystack'}"`,
        `"${tx.paystackRef || ''}"`,
        `"${tx.bookingRef || ''}"`,
        `"${tx.paymentStatus || 'Paid'}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StretchWithLorie_Transactions_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast?.('success', `📥 Exported ${filteredTransactions.length} transactions to CSV.`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* =========================================================================
          TOP BANNER: Financial Operations & Realtime Audit Header
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E1D8] pb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-[#E5ECE2] border border-[#DCE4D9] px-2.5 py-0.5 text-xs font-semibold text-[#5A6952]">
              Financial Control & Revenue
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F8FD] border border-[#B6EEFC] px-2 py-0.5 text-[11px] font-bold text-[#0288D1]">
              <PaystackIcon className="h-3 w-3" />
              Paystack Settlement Audit
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF5EB] border border-[#E8D7B0] px-2.5 py-0.5 text-[11px] font-bold text-[#8C6D23]">
              <ShieldCheck className="h-3 w-3 text-[#C8A253]" />
              Immutable Ledger
            </span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2E31] mt-1">
            Master Financial Transactions Ledger
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6260] mt-0.5 max-w-2xl">
            Live cross-channel audit of every inflow: Studio Class Bookings, Monthly Flow Passes, Wellness Gift Vouchers, and Video Library Unlocks.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={loadTransactions}
            title="Reload Transactions Ledger"
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2 text-xs font-semibold text-[#5C6260] hover:bg-[#FAF8F5] hover:text-[#2B2E31] transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-[#C8A253]' : ''}`} />
            <span className="hidden sm:inline">Refresh Ledger</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-2xl bg-[#232D21] px-4 py-2 text-xs font-bold text-[#F7E7C4] hover:bg-[#2F3C2C] transition-all shadow-md cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-[#C8A253]" />
            <span>Export CSV Ledger</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          EXECUTIVE REVENUE KPI METRICS
         ========================================================================= */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Total Gross Revenue */}
        <div className="rounded-3xl border border-[#E6E1D8] bg-gradient-to-br from-white to-[#FAF8F5] p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#5C6260]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Gross Revenue</span>
            <DollarSign className="h-4 w-4 text-[#5A6952]" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-xs font-bold text-[#5C6260]">GH₵</span>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2E31]">
              {(metrics.totalRevenueGHS || filteredTotalGHS).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[10px] text-[#5C6260] pt-0.5">
            All-time collected studio inflows
          </p>
        </div>

        {/* This Month's Inflow */}
        <div className="rounded-3xl border border-[#E6E1D8] bg-gradient-to-br from-white to-[#FAF8F5] p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#5C6260]">
            <span className="text-xs font-semibold uppercase tracking-wider">This Month's Inflow</span>
            <Calendar className="h-4 w-4 text-[#C8A253]" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-xs font-bold text-[#8C6D23]">GH₵</span>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#8C6D23]">
              {(metrics.monthRevenueGHS || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[10px] text-[#5C6260] pt-0.5">
            Current calendar month receipts
          </p>
        </div>

        {/* Today's Inflow */}
        <div className="rounded-3xl border border-[#E6E1D8] bg-gradient-to-br from-white to-[#FAF8F5] p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#5C6260]">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Inflow</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-xs font-bold text-emerald-700">GH₵</span>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-emerald-800">
              {(metrics.todayRevenueGHS || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[10px] text-[#5C6260] pt-0.5">
            Cleared transactions today
          </p>
        </div>

        {/* Volume & AOV */}
        <div className="rounded-3xl border border-[#E6E1D8] bg-gradient-to-br from-white to-[#FAF8F5] p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#5C6260]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Volume & AOV</span>
            <CreditCard className="h-4 w-4 text-[#7A8B71]" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2E31]">
              {transactions.length}
            </span>
            <span className="text-xs text-[#5C6260]">
              txs • ~GH₵{metrics.avgOrderValueGHS || 0} avg
            </span>
          </div>
          <p className="text-[10px] text-[#5C6260] pt-0.5">
            Average transaction value
          </p>
        </div>
      </div>

      {/* Revenue Stream Breakdown Pills */}
      {metrics.breakdown && (
        <div className="rounded-3xl border border-[#E6E1D8] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5C6260] flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-[#5A6952]" />
              <span>Revenue by Product Stream:</span>
            </span>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <button
                type="button"
                onClick={() => setStreamFilter('class_booking')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border transition-all cursor-pointer ${
                  streamFilter === 'class_booking'
                    ? 'bg-[#E5ECE2] border-[#7A8B71] text-[#232D21] font-bold shadow-2xs'
                    : 'bg-[#FAF8F5] border-[#E6E1D8] text-[#5C6260] hover:text-[#2B2E31]'
                }`}
              >
                <Calendar className="h-3 w-3 text-[#5A6952]" />
                <span>Class Bookings:</span>
                <strong className="text-[#2B2E31]">GH₵{(metrics.breakdown.classBookings || 0).toLocaleString()}</strong>
              </button>

              <button
                type="button"
                onClick={() => setStreamFilter('pass_purchase')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border transition-all cursor-pointer ${
                  streamFilter === 'pass_purchase'
                    ? 'bg-[#FAF5EB] border-[#E8D7B0] text-[#8C6D23] font-bold shadow-2xs'
                    : 'bg-[#FAF8F5] border-[#E6E1D8] text-[#5C6260] hover:text-[#2B2E31]'
                }`}
              >
                <Sparkles className="h-3 w-3 text-[#C8A253]" />
                <span>Flow Passes:</span>
                <strong className="text-[#8C6D23]">GH₵{(metrics.breakdown.flowPasses || 0).toLocaleString()}</strong>
              </button>

              <button
                type="button"
                onClick={() => setStreamFilter('gift_card_purchase')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border transition-all cursor-pointer ${
                  streamFilter === 'gift_card_purchase'
                    ? 'bg-[#FAF5EB] border-[#E8D7B0] text-[#8C6D23] font-bold shadow-2xs'
                    : 'bg-[#FAF8F5] border-[#E6E1D8] text-[#5C6260] hover:text-[#2B2E31]'
                }`}
              >
                <Gift className="h-3 w-3 text-[#C8A253]" />
                <span>Gift Cards:</span>
                <strong className="text-[#8C6D23]">GH₵{(metrics.breakdown.giftCards || 0).toLocaleString()}</strong>
              </button>

              <button
                type="button"
                onClick={() => setStreamFilter('video_purchase')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border transition-all cursor-pointer ${
                  streamFilter === 'video_purchase'
                    ? 'bg-[#EBF7EE] border-[#BCE8C5] text-[#207D38] font-bold shadow-2xs'
                    : 'bg-[#FAF8F5] border-[#E6E1D8] text-[#5C6260] hover:text-[#2B2E31]'
                }`}
              >
                <Video className="h-3 w-3 text-[#207D38]" />
                <span>Video Vault:</span>
                <strong className="text-[#207D38]">GH₵{(metrics.breakdown.videoUnlocks || 0).toLocaleString()}</strong>
              </button>

              {streamFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setStreamFilter('ALL')}
                  className="text-xs font-semibold text-[#A44A4A] hover:underline cursor-pointer pl-1"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MULTI-DIMENSIONAL SEARCH & FILTER CONTROLS
         ========================================================================= */}
      <div className="rounded-3xl border border-[#E6E1D8] bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Universal Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5C6260]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, phone, email, booking ref (SWL-...), or Paystack ref..."
              className="w-full rounded-2xl border border-[#E6E1D8] bg-[#FAF8F5] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#2B2E31] placeholder-[#5C6260]/60 outline-none focus:border-[#C8A253] focus:bg-white transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Stream Type Filter */}
            <select
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
              className="rounded-2xl border border-[#E6E1D8] bg-[#FAF8F5] px-3.5 py-2.5 text-xs font-bold text-[#2B2E31] outline-none focus:border-[#C8A253] cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Revenue Streams</option>
              <option value="class_booking">🧘 Class Bookings</option>
              <option value="pass_purchase">✨ Monthly Flow Passes</option>
              <option value="gift_card_purchase">🎁 Wellness Gift Vouchers</option>
              <option value="video_purchase">🎬 Video Library Unlocks</option>
            </select>

            {/* Payment Method Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="rounded-2xl border border-[#E6E1D8] bg-[#FAF8F5] px-3.5 py-2.5 text-xs font-bold text-[#2B2E31] outline-none focus:border-[#C8A253] cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Payment Methods</option>
              <option value="momo">📱 Mobile Money (MTN / Telecel / AT)</option>
              <option value="card">💳 Paystack Debit Card</option>
              <option value="pass">🎟️ Pass / Voucher Credit</option>
              <option value="desk">🏛️ Studio Desk Walk-In</option>
            </select>

            {/* Time Filter */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="rounded-2xl border border-[#E6E1D8] bg-[#FAF8F5] px-3.5 py-2.5 text-xs font-bold text-[#2B2E31] outline-none focus:border-[#C8A253] cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
              <option value="month">This Month</option>
            </select>
          </div>

        </div>

        {/* Active Filter Summary Bar */}
        <div className="flex items-center justify-between text-xs text-[#5C6260] pt-1 border-t border-[#E6E1D8]/60">
          <p>
            Showing <strong className="text-[#2B2E31]">{filteredTransactions.length}</strong> of{' '}
            <strong className="text-[#2B2E31]">{transactions.length}</strong> total transactions
            {filteredTransactions.length !== transactions.length && (
              <span className="ml-1 text-[#8C6D23] font-semibold">
                (Filtered Gross: GH₵{filteredTotalGHS.toLocaleString('en-US', { minimumFractionDigits: 2 })})
              </span>
            )}
          </p>

          {(searchQuery || streamFilter !== 'ALL' || paymentFilter !== 'ALL' || timeFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStreamFilter('ALL');
                setPaymentFilter('ALL');
                setTimeFilter('ALL');
              }}
              className="text-xs font-semibold text-[#A44A4A] hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          MASTER TRANSACTIONS TABLE
         ========================================================================= */}
      <div className="rounded-3xl border border-[#E6E1D8] bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="mx-auto h-8 w-8 text-[#C8A253] animate-spin" />
            <p className="text-xs font-semibold text-[#5C6260]">Loading master financial ledger...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <DollarSign className="mx-auto h-10 w-10 text-[#C8A253]/50" />
            <h4 className="font-serif text-lg font-bold text-[#2B2E31]">No transactions match your search</h4>
            <p className="text-xs text-[#5C6260] max-w-sm mx-auto">
              {searchQuery || streamFilter !== 'ALL' || paymentFilter !== 'ALL' || timeFilter !== 'ALL'
                ? 'Try clearing or modifying your search filters above.'
                : 'When students book classes, buy Monthly Passes, or unlock on-demand videos, they will appear in this ledger.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-wider text-[#5C6260] border-b border-[#E6E1D8]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Timestamp & Date</th>
                  <th className="py-3.5 px-4">Stream & Service</th>
                  <th className="py-3.5 px-4">Customer Identity</th>
                  <th className="py-3.5 px-4">Gross Inflow</th>
                  <th className="py-3.5 px-4">Payment Method & Gateway</th>
                  <th className="py-3.5 px-4">Paystack / Booking Ref</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1D8]">
                {filteredTransactions.map((tx) => {
                  const ts = formatExactDateTime(tx.timestamp);
                  const isCopiedPaystack = copiedRef === tx.paystackRef;
                  const isCopiedBooking = copiedRef === tx.bookingRef;
                  const isPassOrVoucher = (tx.paymentMethod || '').toLowerCase().includes('pass') || (tx.paymentMethod || '').toLowerCase().includes('voucher');
                  const isDesk = (tx.paymentGateway || '').toLowerCase().includes('desk') || (tx.paymentMethod || '').toLowerCase().includes('desk');

                  return (
                    <tr key={tx.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      {/* Exact Date & Time */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex flex-col text-xs" title={`Exact transaction time: ${ts.fullStr}`}>
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
                      </td>

                      {/* Stream & Service Purchased */}
                      <td className="py-4 px-4">
                        <div className="space-y-1 max-w-xs xl:max-w-sm">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`inline-block text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${
                              tx.streamType === 'class_booking'
                                ? 'bg-[#E5ECE2] text-[#232D21] border-[#7A8B71]/40'
                                : tx.streamType === 'pass_purchase'
                                ? 'bg-[#FAF5EB] text-[#8C6D23] border-[#E8D7B0]'
                                : tx.streamType === 'gift_card_purchase'
                                ? 'bg-[#FAF5EB] text-[#8C6D23] border-[#E8D7B0]'
                                : 'bg-[#EBF7EE] text-[#207D38] border-[#BCE8C5]'
                            }`}>
                              {tx.streamLabel || tx.streamType}
                            </span>
                          </div>
                          <p className="font-serif font-bold text-sm text-[#2B2E31] truncate">
                            {tx.itemTitle}
                          </p>
                          {tx.slotLabel || tx.classDate ? (
                            <p className="text-[10px] text-[#5C6260]">
                              {tx.classDate ? `${tx.classDate} • ` : ''}{tx.slotLabel || tx.classTime || ''}
                            </p>
                          ) : null}
                        </div>
                      </td>

                      {/* Customer Identity */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="font-medium text-[#2B2E31] text-xs sm:text-sm">
                            {tx.customerName || 'Yogi Attendee'}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-[#5C6260]">
                            {tx.customerPhone && (
                              <a
                                href={`tel:${tx.customerPhone}`}
                                className="hover:text-[#232D21] flex items-center gap-0.5"
                              >
                                <Phone className="h-2.5 w-2.5 text-[#5A6952]" />
                                <span>{tx.customerPhone}</span>
                              </a>
                            )}
                            {tx.customerEmail && (
                              <span className="truncate max-w-[140px] text-[10px]">
                                {tx.customerEmail}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Gross Amount */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-serif font-bold text-sm sm:text-base text-[#2B2E31] block">
                            GH₵{(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          {tx.discountAmount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#8C6D23] bg-[#FAF5EB] border border-[#E8D7B0] px-1 py-0.2 rounded">
                              Promo -GH₵{tx.discountAmount}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payment Method & Gateway */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-[#2B2E31] flex items-center gap-1.5">
                            {tx.paymentMethod && (tx.paymentMethod.includes('MTN') || tx.paymentMethod.includes('Telecel') || tx.paymentMethod.includes('AT') || tx.paymentMethod.includes('MoMo')) ? (
                              <MobileMoneyLogo network={tx.paymentMethod} variant="image" size="xs" className="h-4 w-auto rounded-xs shadow-2xs shrink-0" />
                            ) : isPassOrVoucher ? (
                              <Sparkles className="h-3.5 w-3.5 text-[#C8A253] shrink-0" />
                            ) : isDesk ? (
                              <CreditCard className="h-3.5 w-3.5 text-[#5A6952] shrink-0" />
                            ) : (
                              <PaystackIcon className="h-3 w-3 text-[#0288D1] shrink-0" />
                            )}
                            <span className="truncate max-w-[160px]">{tx.paymentMethod || 'Paystack MoMo'}</span>
                          </div>

                          <span className="text-[10px] text-[#5C6260] block font-mono">
                            Gateway: {tx.paymentGateway || 'Paystack'}
                          </span>
                        </div>
                      </td>

                      {/* References (Paystack & Booking) */}
                      <td className="py-4 px-4">
                        <div className="space-y-1 font-mono text-[10px]">
                          {/* Paystack Ref */}
                          {tx.paystackRef ? (
                            <div className="flex items-center gap-1">
                              <span className="bg-[#E6F8FD] text-[#0288D1] border border-[#B6EEFC] px-1.5 py-0.2 rounded font-semibold truncate max-w-[120px]" title={tx.paystackRef}>
                                {tx.paystackRef}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyRef(tx.paystackRef, 'Paystack Ref')}
                                className="text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                                title="Copy Paystack Reference"
                              >
                                {isCopiedPaystack ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                              </button>
                            </div>
                          ) : null}

                          {/* Booking Ref */}
                          {tx.bookingRef && tx.bookingRef !== tx.paystackRef ? (
                            <div className="flex items-center gap-1">
                              <span className="bg-stone-100 text-[#2B2E31] border border-stone-200 px-1.5 py-0.2 rounded font-semibold truncate max-w-[120px]" title={tx.bookingRef}>
                                {tx.bookingRef}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyRef(tx.bookingRef, 'Booking Ref')}
                                className="text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                                title="Copy Booking Ref"
                              >
                                {isCopiedBooking ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 whitespace-nowrap">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>{tx.paymentStatus || 'Paid'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <button
                          type="button"
                          onClick={() => setInspectedTx(tx)}
                          className="inline-flex items-center gap-1 rounded-xl border border-[#E6E1D8] bg-white hover:bg-[#FAF8F5] px-2.5 py-1 text-xs font-semibold text-[#5C6260] hover:text-[#2B2E31] transition-colors cursor-pointer shadow-2xs"
                          title="View Full Transaction Audit"
                        >
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          TRANSACTION RECEIPT & AUDIT MODAL
         ========================================================================= */}
      {inspectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#E6E1D8] shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E6E1D8] pb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[#E5ECE2] text-[#5A6952] flex items-center justify-center">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#2B2E31]">
                    Transaction Receipt & Audit
                  </h3>
                  <p className="text-[11px] text-[#5C6260]">
                    Verified Studio Inflow
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectedTx(null)}
                className="rounded-full p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Receipt Summary Card */}
            <div className="rounded-2xl bg-[#FAF8F5] border border-[#E6E1D8] p-4 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#5C6260] tracking-wider block">
                Total Amount Paid
              </span>
              <div className="font-serif text-3xl font-bold text-[#2B2E31]">
                GH₵{(inspectedTx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800 mt-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                Payment Cleared ({inspectedTx.paymentGateway || 'Paystack'})
              </span>
            </div>

            {/* Itemized Audit Fields */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#E6E1D8]/60">
                <span className="text-[#5C6260]">Service / Product:</span>
                <span className="font-semibold text-[#2B2E31] text-right">{inspectedTx.itemTitle}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#E6E1D8]/60">
                <span className="text-[#5C6260]">Category Stream:</span>
                <span className="font-semibold text-[#5A6952]">{inspectedTx.streamLabel}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#E6E1D8]/60">
                <span className="text-[#5C6260]">Customer:</span>
                <span className="font-semibold text-[#2B2E31]">{inspectedTx.customerName}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#E6E1D8]/60">
                <span className="text-[#5C6260]">Phone:</span>
                <span className="font-mono text-[#2B2E31]">{inspectedTx.customerPhone || 'N/A'}</span>
              </div>

              {inspectedTx.customerEmail && (
                <div className="flex items-center justify-between py-1 border-b border-[#E6E1D8]/60">
                  <span className="text-[#5C6260]">Email:</span>
                  <span className="text-[#2B2E31]">{inspectedTx.customerEmail}</span>
                </div>
              )}

              <div className="flex items-center justify-between py-1 border-b border-[#E6E1D8]/60">
                <span className="text-[#5C6260]">Payment Method:</span>
                <span className="font-semibold text-[#2B2E31]">{inspectedTx.paymentMethod}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#E6E1D8]/60">
                <span className="text-[#5C6260]">Exact Timestamp:</span>
                <span className="font-mono text-[#2B2E31]">
                  {formatExactDateTime(inspectedTx.timestamp).fullStr}
                </span>
              </div>

              {inspectedTx.paystackRef && (
                <div className="flex items-center justify-between py-1 border-b border-[#E6E1D8]/60">
                  <span className="text-[#5C6260]">Paystack Ref:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[#0288D1]">{inspectedTx.paystackRef}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyRef(inspectedTx.paystackRef, 'Paystack Ref')}
                      className="text-stone-400 hover:text-stone-600 p-0.5"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              {inspectedTx.bookingRef && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#5C6260]">Booking Ref:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[#5A6952] font-bold">{inspectedTx.bookingRef}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyRef(inspectedTx.bookingRef, 'Booking Ref')}
                      className="text-stone-400 hover:text-stone-600 p-0.5"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E1D8]">
              <button
                type="button"
                onClick={() => setInspectedTx(null)}
                className="w-full rounded-2xl bg-[#232D21] py-2.5 text-xs font-bold text-[#F7E7C4] hover:bg-[#2F3C2C] transition-all shadow-md cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
