import { useState, useEffect, useMemo } from 'react';
import {
  Gift,
  Search,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Clock,
  Sparkles,
  UserCheck,
  Plus,
  Ban,
  X,
  Calendar,
  ChevronDown,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { studioSocket } from '../services/websocket';

// Helper to format exact date and time for pass purchases and redemptions
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

export default function GiftCardsManager({ showToast }) {
  const [giftCards, setGiftCards] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Desk Lookup State
  const [lookupCode, setLookupCode] = useState('');
  const [lookedUpCard, setLookedUpCard] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // Walk-In Booking Modal State
  const [walkInModalCard, setWalkInModalCard] = useState(null);
  const [walkInClassId, setWalkInClassId] = useState('');
  const [walkInSlotId, setWalkInSlotId] = useState('');
  const [walkInNotes, setWalkInNotes] = useState('Desk walk-in registration');
  const [walkInMarkCheckedIn, setWalkInMarkCheckedIn] = useState(true);
  const [isSubmittingWalkIn, setIsSubmittingWalkIn] = useState(false);

  // Courtesy Adjustment Modal State
  const [adjustModalCard, setAdjustModalCard] = useState(null);
  const [adjustDelta, setAdjustDelta] = useState(1);
  const [adjustReason, setAdjustReason] = useState('Courtesy studio make-up session');
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

  // Void Modal State
  const [voidModalCard, setVoidModalCard] = useState(null);
  const [voidReason, setVoidReason] = useState('Cancelled by studio administrator');
  const [isSubmittingVoid, setIsSubmittingVoid] = useState(false);

  // Fetch gift cards and classes
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cardsData, classesData] = await Promise.all([
        api.getAllGiftCards(),
        api.getClasses()
      ]);
      setGiftCards(cardsData || []);
      setClasses(classesData || []);
    } catch (err) {
      console.error('Error fetching gift cards/classes:', err);
      showToast?.('error', 'Could not load studio pass records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([api.getAllGiftCards(), api.getClasses()])
      .then(([cardsData, classesData]) => {
        if (isMounted) {
          setGiftCards(cardsData || []);
          setClasses(classesData || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Error fetching gift cards/classes:', err);
          setIsLoading(false);
        }
      });

    // Real-time listener for newly issued gift cards & passes
    const unsubNew = studioSocket.subscribe('NEW_GIFT_CARD', (newCard) => {
      if (!newCard) return;
      const normalized = {
        id: newCard.id,
        code: newCard.code,
        cardType: newCard.card_type || newCard.cardType || 'gift',
        planId: newCard.plan_id || newCard.planId,
        planName: newCard.plan_name || newCard.planName,
        totalClasses: Number(newCard.total_classes || newCard.totalClasses || 4),
        classesRemaining: Number(newCard.classes_remaining || newCard.classesRemaining || 4),
        classesUsed: Number(newCard.classes_used || newCard.classesUsed || 0),
        recipientName: newCard.recipient_name || newCard.recipientName,
        recipientPhone: newCard.recipient_phone || newCard.recipientPhone,
        recipientEmail: newCard.recipient_email || newCard.recipientEmail,
        buyerName: newCard.buyer_name || newCard.buyerName,
        buyerPhone: newCard.buyer_phone || newCard.buyerPhone,
        buyerEmail: newCard.buyer_email || newCard.buyerEmail,
        amount: Number(newCard.amount),
        balance: Number(newCard.balance !== undefined ? newCard.balance : newCard.amount),
        personalNote: newCard.personal_note || newCard.personalNote,
        status: newCard.status || 'active',
        paystackRef: newCard.paystack_ref || newCard.paystackRef,
        createdAt: newCard.created_at || newCard.createdAt || new Date().toISOString()
      };
      setGiftCards((prev) => [normalized, ...prev.filter((c) => c.id !== normalized.id)]);
      showToast?.('info', `🎁 New pass/voucher issued: ${normalized.code} for ${normalized.recipientName}!`);
    });

    // Real-time listener for pass redemptions, walk-in bookings & adjustments
    const unsubRedeemed = studioSocket.subscribe('GIFT_CARD_REDEEMED', (updated) => {
      if (!updated) return;
      setGiftCards((prev) =>
        prev.map((c) => {
          const match =
            c.code?.toUpperCase() === (updated.code || '').toUpperCase() ||
            c.id === updated.id;
          if (match) {
            return {
              ...c,
              status: updated.status || c.status,
              classesRemaining:
                updated.classesRemaining !== undefined
                  ? Number(updated.classesRemaining)
                  : (updated.classes_remaining !== undefined ? Number(updated.classes_remaining) : c.classesRemaining),
              classesUsed:
                updated.classesUsed !== undefined
                  ? Number(updated.classesUsed)
                  : (updated.classes_used !== undefined ? Number(updated.classes_used) : c.classesUsed),
              balance:
                updated.balance !== undefined
                  ? Number(updated.balance)
                  : c.balance,
              personalNote: updated.personalNote || updated.personal_note || c.personalNote
            };
          }
          return c;
        })
      );

      // Also update looked-up card if it matches
      setLookedUpCard((prev) => {
        if (!prev) return null;
        const match =
          prev.code?.toUpperCase() === (updated.code || '').toUpperCase() ||
          prev.id === updated.id;
        if (match) {
          return {
            ...prev,
            status: updated.status || prev.status,
            classesRemaining:
              updated.classesRemaining !== undefined
                ? Number(updated.classesRemaining)
                : (updated.classes_remaining !== undefined ? Number(updated.classes_remaining) : prev.classesRemaining),
            classesUsed:
              updated.classesUsed !== undefined
                ? Number(updated.classesUsed)
                : (updated.classes_used !== undefined ? Number(updated.classes_used) : prev.classesUsed),
            balance:
              updated.balance !== undefined
                ? Number(updated.balance)
                : prev.balance,
            personalNote: updated.personalNote || updated.personal_note || prev.personalNote
          };
        }
        return prev;
      });
    });

    // Real-time listener for class changes (spots left)
    const unsubClass = studioSocket.subscribe('CLASS_UPDATED', (updatedClass) => {
      if (!updatedClass) return;
      setClasses((prev) =>
        prev.map((c) => (c.id === updatedClass.id ? { ...c, ...updatedClass } : c))
      );
    });

    return () => {
      isMounted = false;
      unsubNew();
      unsubRedeemed();
      unsubClass();
    };
  }, [showToast]);

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
    showToast?.('info', `Copied voucher code ${code}`);
  };

  // Counter Desk Verification
  const handleVerifyCode = (e) => {
    e?.preventDefault();
    const clean = lookupCode.trim().toUpperCase();
    if (!clean) {
      showToast?.('error', 'Please enter a pass or voucher code.');
      return;
    }

    setIsVerifying(true);
    const found = giftCards.find((c) => c.code.toUpperCase() === clean);
    if (!found) {
      setLookedUpCard({ notFound: true, code: clean });
    } else {
      setLookedUpCard(found);
    }
    setIsVerifying(false);
  };

  // Open Walk-In Modal
  const openWalkInModal = (card) => {
    setWalkInModalCard(card);
    setLookedUpCard(null);

    // Option A: If subscription pass, prioritize group classes (cls-mass)
    if (card.cardType === 'subscription') {
      const eligible = classes.find(
        (c) => c.isPassEligible !== false && !c.isPrivateOneOnOne && c.category === 'Yoga Classes'
      ) || classes[0];
      setWalkInClassId(eligible ? eligible.id : '');
      const firstSlot = eligible?.scheduleSlots?.[0];
      setWalkInSlotId(firstSlot ? firstSlot.id : '');
    } else {
      // Cash voucher: can pick any class
      const first = classes[0];
      setWalkInClassId(first ? first.id : '');
      const firstSlot = first?.scheduleSlots?.[0];
      setWalkInSlotId(firstSlot ? firstSlot.id : '');
    }

    setWalkInNotes('Front desk walk-in check-in');
    setWalkInMarkCheckedIn(true);
  };

  // Execute Desk Walk-In Booking
  const handleConfirmWalkIn = async (e) => {
    e?.preventDefault();
    if (!walkInModalCard || !walkInClassId) {
      showToast?.('error', 'Please select an experience to check in.');
      return;
    }

    const selectedClass = classes.find((c) => c.id === walkInClassId);
    const selectedSlotObj = selectedClass?.scheduleSlots?.find((s) => s.id === walkInSlotId);
    const selectedSlotText = selectedSlotObj
      ? `${selectedSlotObj.day} ${selectedSlotObj.time}`
      : (selectedClass?.scheduleSlots?.[0] ? `${selectedClass.scheduleSlots[0].day} ${selectedClass.scheduleSlots[0].time}` : 'Walk-In Session');

    try {
      setIsSubmittingWalkIn(true);
      const res = await api.deskWalkInBooking(walkInModalCard.code, {
        classId: walkInClassId,
        slotId: walkInSlotId,
        selectedSlot: selectedSlotText,
        notes: walkInNotes
      });

      // Update local state with the returned card
      const updatedCard = res.data?.giftCard || res.card;
      if (updatedCard) {
        setGiftCards((prev) =>
          prev.map((c) => (c.id === updatedCard.id ? { ...c, ...updatedCard } : c))
        );
        if (lookedUpCard && lookedUpCard.id === updatedCard.id) {
          setLookedUpCard(updatedCard);
        }
      }

      const remainingMsg = updatedCard?.classesRemaining !== undefined
        ? ` (${updatedCard.classesRemaining} classes remaining)`
        : '';

      showToast?.('success', `✨ Checked in ${walkInModalCard.recipientName} for ${selectedClass?.title || 'class'}!${remainingMsg}`);
      setWalkInModalCard(null);
    } catch (err) {
      console.error('Walk-in booking error:', err);
      showToast?.('error', err.message || 'Failed to book walk-in student.');
    } finally {
      setIsSubmittingWalkIn(false);
    }
  };

  // Open Courtesy Adjustment Modal
  const openAdjustModal = (card) => {
    setAdjustModalCard(card);
    setAdjustDelta(1);
    setAdjustReason('Courtesy studio make-up session');
  };

  // Submit Courtesy Adjustment (+1 Class or balance credit)
  const handleConfirmAdjust = async (e) => {
    e?.preventDefault();
    if (!adjustModalCard) return;

    try {
      setIsSubmittingAdjust(true);
      const res = await api.adjustCard(adjustModalCard.id, {
        deltaClasses: adjustDelta,
        deltaBalance: adjustDelta * 50,
        reason: adjustReason
      });

      setGiftCards((prev) =>
        prev.map((c) => (c.id === res.id ? { ...c, ...res } : c))
      );

      showToast?.('success', `✨ Pass adjusted: ${adjustModalCard.recipientName} now has ${res.classesRemaining} classes left.`);
      setAdjustModalCard(null);
    } catch (err) {
      console.error('Adjustment error:', err);
      showToast?.('error', err.message || 'Failed to adjust pass.');
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  // Open Void Modal
  const openVoidModal = (card) => {
    setVoidModalCard(card);
    setVoidReason('Cancelled by studio administrator');
  };

  // Submit Void Pass
  const handleConfirmVoid = async (e) => {
    e?.preventDefault();
    if (!voidModalCard) return;

    try {
      setIsSubmittingVoid(true);
      const res = await api.voidCard(voidModalCard.id, voidReason);

      setGiftCards((prev) =>
        prev.map((c) => (c.id === res.id ? { ...c, ...res } : c))
      );

      showToast?.('info', `🚫 Pass ${voidModalCard.code} has been voided.`);
      setVoidModalCard(null);
    } catch (err) {
      console.error('Void error:', err);
      showToast?.('error', err.message || 'Failed to void pass.');
    } finally {
      setIsSubmittingVoid(false);
    }
  };

  // Filtered List
  const filteredCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return giftCards.filter((c) => {
      const matchesSearch =
        !q ||
        c.code?.toLowerCase().includes(q) ||
        c.recipientName?.toLowerCase().includes(q) ||
        c.buyerName?.toLowerCase().includes(q) ||
        c.planName?.toLowerCase().includes(q) ||
        c.recipientEmail?.toLowerCase().includes(q);

      let matchesStatus = true;
      if (statusFilter === 'active') {
        matchesStatus = c.status === 'active';
      } else if (statusFilter === 'exhausted') {
        matchesStatus = c.status === 'exhausted' || c.status === 'redeemed';
      } else if (statusFilter === 'voided') {
        matchesStatus = c.status === 'voided';
      } else if (statusFilter === 'subscription') {
        matchesStatus = c.cardType === 'subscription';
      } else if (statusFilter === 'gift') {
        matchesStatus = c.cardType === 'gift' || !c.cardType;
      }

      return matchesSearch && matchesStatus;
    });
  }, [giftCards, searchQuery, statusFilter]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const totalCount = giftCards.length;
    const activeCards = giftCards.filter((c) => c.status === 'active');
    const exhaustedCards = giftCards.filter((c) => c.status === 'exhausted' || c.status === 'redeemed');

    const totalLiability = activeCards.reduce((acc, c) => acc + (Number(c.balance !== undefined ? c.balance : c.amount) || 0), 0);
    const totalRevenueCollected = giftCards.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);

    const activePassCredits = activeCards
      .filter((c) => c.cardType === 'subscription')
      .reduce((acc, c) => acc + (Number(c.classesRemaining) || 0), 0);

    const totalClassesUsed = giftCards.reduce((acc, c) => acc + (Number(c.classesUsed) || 0), 0);

    return {
      totalCount,
      activeCount: activeCards.length,
      exhaustedCount: exhaustedCards.length,
      totalLiability,
      totalRevenueCollected,
      activePassCredits,
      totalClassesUsed
    };
  }, [giftCards]);

  // Current selected class in Walk-in modal
  const selectedWalkInClass = useMemo(() => {
    return classes.find((c) => c.id === walkInClassId);
  }, [classes, walkInClassId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E1D8] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF5EB] border border-[#E8D7B0] px-2.5 py-0.5 text-xs font-semibold text-[#8C6D23]">
            <Gift className="h-3.5 w-3.5 text-[#C8A253]" />
            <span>Studio Desk Concierge & Pass Management</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2E31] mt-1.5">
            Passes, Gift Cards & Walk-In Check-In
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6260]">
            Manage student memberships, verify gift cards, and check in walk-in clients directly to class rosters.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2 text-xs font-semibold text-[#5C6260] hover:bg-[#FAF8F5] transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Front Desk Concierge Quick Lookup Tool */}
      <div className="rounded-3xl border-2 border-[#C8A253]/30 bg-gradient-to-br from-[#FAF5EB] via-white to-[#F7F4EF] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#2B2E31] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#C8A253]" />
              <span>Front Desk Lookup & Walk-In Check-In</span>
            </h3>
            <p className="text-xs text-[#5C6260]">
              Look up a student's Monthly Flow Pass or Gift Voucher to verify remaining credits and book a walk-in.
            </p>
          </div>
        </div>

        {/* Input & Lookup Form */}
        <form onSubmit={handleVerifyCode} className="flex flex-col sm:flex-row gap-2.5 max-w-xl">
          <input
            type="text"
            value={lookupCode}
            onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
            placeholder="e.g. SWL-PASS-7B9C or SWL-GIFT-A81"
            className="flex-1 rounded-2xl border border-[#E6E1D8] bg-white px-4 py-2.5 text-xs sm:text-sm font-mono font-bold text-[#2B2E31] tracking-wider focus:border-[#C8A253] outline-none shadow-2xs uppercase"
          />
          <button
            type="submit"
            disabled={isVerifying}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#232D21] text-[#F7E7C4] px-5 py-2.5 text-xs font-bold hover:bg-[#2F3C2C] transition-all shadow-md cursor-pointer shrink-0"
          >
            <Search className="h-4 w-4 text-[#C8A253]" />
            <span>Look Up Pass</span>
          </button>
        </form>

        {/* Lookup Result Spotlight */}
        {lookedUpCard && (
          <div className="mt-4 pt-4 border-t border-[#E8D7B0]/60">
            {lookedUpCard.notFound ? (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs text-red-700 flex items-center gap-2.5">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                <div>
                  <span className="font-bold">Pass Not Found:</span> No record matches "
                  <span className="font-mono">{lookedUpCard.code}</span>". Please check the voucher code or Paystack reference.
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#C8A253]/40 bg-white p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-[#2B2E31] bg-[#FAF5EB] border border-[#E8D7B0] px-2.5 py-0.5 rounded-lg">
                        {lookedUpCard.code}
                      </span>
                      <span className={`inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${
                        lookedUpCard.cardType === 'subscription'
                          ? 'bg-[#E5ECE2] text-[#232D21] border-[#7A8B71]/40'
                          : 'bg-[#FAF5EB] text-[#8C6D23] border-[#E8D7B0]'
                      }`}>
                        {lookedUpCard.cardType === 'subscription' ? 'Monthly Flow Pass' : 'Gift Voucher'}
                      </span>
                      {lookedUpCard.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Active & Valid
                        </span>
                      ) : lookedUpCard.status === 'voided' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-bold text-red-800">
                          <Ban className="h-3 w-3 text-red-600" />
                          Voided
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 border border-stone-200 px-2 py-0.5 text-xs font-medium text-stone-600">
                          Fully Used / Exhausted
                        </span>
                      )}
                    </div>

                    <p className="font-serif text-lg font-bold text-[#2B2E31]">
                      {lookedUpCard.recipientName}
                    </p>

                    <div className="text-xs text-[#5C6260] space-y-0.5">
                      {lookedUpCard.cardType === 'subscription' ? (
                        <p className="font-semibold text-[#232D21]">
                          Session Balance:{' '}
                          <span className="text-[#C8A253] font-bold">
                            {lookedUpCard.classesRemaining} of {lookedUpCard.totalClasses || 4} classes remaining
                          </span>
                        </p>
                      ) : (
                        <p className="font-semibold text-[#232D21]">
                          Balance:{' '}
                          <span className="text-[#C8A253] font-bold">
                            GH₵{lookedUpCard.balance !== undefined ? lookedUpCard.balance : lookedUpCard.amount}
                          </span>
                        </p>
                      )}
                      <p>
                        <strong className="text-[#2B2E31]">Contact:</strong> {lookedUpCard.recipientPhone || 'No phone'} • {lookedUpCard.recipientEmail || 'No email'}
                      </p>
                      <p>
                        <strong className="text-[#2B2E31]">Buyer:</strong> {lookedUpCard.buyerName || lookedUpCard.recipientName}
                      </p>
                      {lookedUpCard.personalNote && (
                        <p className="italic text-[#8C6D23] mt-1 bg-[#FAF8F5] p-2 rounded-xl border border-[#E6E1D8]">
                          "{lookedUpCard.personalNote}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Counter Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                    {lookedUpCard.status === 'active' && (lookedUpCard.classesRemaining > 0 || lookedUpCard.balance > 0) ? (
                      <button
                        type="button"
                        onClick={() => openWalkInModal(lookedUpCard)}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-[#5A6952] hover:bg-[#475441] text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all cursor-pointer"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>Book Walk-In Check-In</span>
                      </button>
                    ) : null}

                    {lookedUpCard.status !== 'voided' && (
                      <button
                        type="button"
                        onClick={() => openAdjustModal(lookedUpCard)}
                        className="flex items-center justify-center gap-1.5 rounded-2xl border border-[#E8D7B0] bg-[#FAF5EB] hover:bg-[#F3EAD5] text-[#8C6D23] px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer"
                        title="Grant an extra make-up session"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>+1 Courtesy Class</span>
                      </button>
                    )}

                    {lookedUpCard.status === 'active' && (
                      <button
                        type="button"
                        onClick={() => openVoidModal(lookedUpCard)}
                        className="flex items-center justify-center gap-1.5 rounded-2xl border border-red-200 bg-white hover:bg-red-50 text-red-600 px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        <span>Void</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Exact Timestamps Audit Grid */}
                <div className="pt-3 border-t border-[#E8D7B0]/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Purchase Timestamp */}
                  <div className="rounded-xl bg-[#FAF8F5] p-3 border border-[#E6E1D8]">
                    <span className="text-[10px] uppercase font-bold text-[#5C6260] block tracking-wider">
                      Exact Purchase Time
                    </span>
                    {(() => {
                      const ts = formatExactDateTime(lookedUpCard.createdAt);
                      return (
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <Calendar className="h-3.5 w-3.5 text-[#5A6952] shrink-0" />
                          <span className="font-semibold text-[#2B2E31]">{ts.dateStr}</span>
                          <span className="text-[#5C6260] font-mono text-[11px]">at {ts.timeStr || 'Recent'}</span>
                        </div>
                      );
                    })()}
                    {lookedUpCard.paystackRef && (
                      <span className="font-mono text-[10px] text-[#5C6260] block mt-1">
                        Ref: {lookedUpCard.paystackRef}
                      </span>
                    )}
                  </div>

                  {/* Redemption Timestamp */}
                  <div className="rounded-xl bg-[#FAF8F5] p-3 border border-[#E6E1D8]">
                    <span className="text-[10px] uppercase font-bold text-[#5C6260] block tracking-wider">
                      Exact Redemption Time
                    </span>
                    {(() => {
                      const history = lookedUpCard.redemptionHistory || [];
                      if (lookedUpCard.redeemedAt || history.length > 0) {
                        const latestTs = formatExactDateTime(lookedUpCard.redeemedAt || history[history.length - 1]?.timestamp);
                        return (
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span className="font-semibold text-emerald-800">{latestTs.dateStr}</span>
                              <span className="text-[#5C6260] font-mono text-[11px]">at {latestTs.timeStr}</span>
                            </div>
                            {history.length > 0 && (
                              <span className="text-[10px] text-[#8C6D23] font-medium block">
                                {history.length} session{history.length > 1 ? 's' : ''} redeemed to date
                              </span>
                            )}
                          </div>
                        );
                      }
                      return (
                        <div className="mt-1 flex items-center gap-1.5 text-stone-500 italic text-[11px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-stone-300" />
                          <span>Not yet redeemed (Full credits intact)</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Itemized Session Redemption History Log */}
                {lookedUpCard.redemptionHistory && lookedUpCard.redemptionHistory.length > 0 && (
                  <div className="rounded-2xl bg-[#F7F4EF] border border-[#E6E1D8] p-3 text-xs space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#5A6952] tracking-wider block">
                      Session Redemption Activity Log ({lookedUpCard.redemptionHistory.length} Event{lookedUpCard.redemptionHistory.length > 1 ? 's' : ''})
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto divide-y divide-[#E6E1D8]/60 pr-1">
                      {lookedUpCard.redemptionHistory.map((item, idx) => {
                        const itemTs = formatExactDateTime(item.timestamp);
                        return (
                          <div key={idx} className="pt-1.5 first:pt-0 flex items-center justify-between gap-2 text-[11px]">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-mono text-[10px] font-bold text-[#8C6D23] bg-[#FAF5EB] px-1.5 py-0.2 rounded border border-[#E8D7B0]">
                                #{idx + 1}
                              </span>
                              <span className="font-semibold text-[#2B2E31] truncate">
                                {item.className || item.note || (item.action === 'desk_walk_in' ? 'Desk Walk-In Check-In' : 'Booking')}
                              </span>
                              {item.studentName && (
                                <span className="text-[#5C6260] truncate">({item.studentName})</span>
                              )}
                            </div>
                            <div className="text-right shrink-0 font-mono text-[10px] text-[#5C6260]">
                              {itemTs.dateStr} • {itemTs.timeStr}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Financial & Studio Attendance Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-3xl border border-[#E6E1D8] bg-white p-4 sm:p-5 shadow-2xs">
          <span className="text-xs font-semibold text-[#5C6260]">Total Passes & Cards</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2E31]">
              {stats.totalCount}
            </span>
            <span className="text-[11px] text-[#5C6260]">issued</span>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-5 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-900">Active Pass Credits</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-emerald-900">
              {stats.activePassCredits}
            </span>
            <span className="text-[11px] font-bold text-emerald-700">
              sessions left
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-[#E8D7B0] bg-[#FAF5EB]/50 p-4 sm:p-5 shadow-2xs">
          <span className="text-xs font-semibold text-[#8C6D23]">Sessions Attended</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2E31]">
              {stats.totalClassesUsed}
            </span>
            <span className="text-[11px] text-[#8C6D23]">
              classes taken
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-[#E6E1D8] bg-white p-4 sm:p-5 shadow-2xs">
          <span className="text-xs font-semibold text-[#5C6260]">Total Revenue</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2E31]">
              GH₵{stats.totalRevenueCollected.toLocaleString()}
            </span>
            <span className="text-[11px] text-[#5C6260]">collected</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5C6260]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code, passholder name, email..."
            className="w-full rounded-2xl border border-[#E6E1D8] bg-white pl-10 pr-4 py-2.5 text-xs text-[#2B2E31] focus:border-[#7A8B71] outline-none shadow-2xs"
          />
        </div>

        {/* Status & Type Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'ALL', label: 'All Records' },
            { id: 'subscription', label: 'Monthly Passes' },
            { id: 'gift', label: 'Gift Vouchers' },
            { id: 'active', label: 'Active' },
            { id: 'exhausted', label: 'Fully Used' },
            { id: 'voided', label: 'Voided' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatusFilter(item.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === item.id
                  ? 'bg-[#7A8B71] text-white shadow-2xs'
                  : 'bg-white text-[#5C6260] border border-[#E6E1D8] hover:bg-[#FAF8F5]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Issued Passes Table */}
      <div className="rounded-3xl border border-[#E6E1D8] bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-[#5C6260]">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#7A8B71] border-t-transparent" />
            <p className="mt-3 text-xs font-semibold">Loading studio pass records...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="p-12 text-center text-[#5C6260]">
            <Gift className="mx-auto h-8 w-8 text-[#C8A253]/60 mb-2" />
            <h4 className="font-serif text-base font-bold text-[#2B2E31]">No passes or gift cards found</h4>
            <p className="text-xs text-[#5C6260] mt-1">
              {searchQuery ? 'Try modifying your search or filter.' : 'When students buy Monthly Passes or Gift Vouchers on the site, they will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-wider text-[#5C6260] border-b border-[#E6E1D8]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Pass Code & Type</th>
                  <th className="py-3.5 px-4">Passholder</th>
                  <th className="py-3.5 px-4">Buyer / Notes</th>
                  <th className="py-3.5 px-4">Credit Balance</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Purchased</th>
                  <th className="py-3.5 px-4">Redeemed</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Desk Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1D8]">
                {filteredCards.map((card) => {
                  const isCopied = copiedCode === card.code;
                  const isActive = card.status === 'active';
                  const hasCredits = card.cardType === 'subscription' ? card.classesRemaining > 0 : card.balance > 0;

                  return (
                    <tr key={card.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      {/* Pass Code & Type */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-[#2B2E31] bg-[#FAF5EB] border border-[#E8D7B0] px-2 py-0.5 rounded-lg">
                              {card.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(card.code)}
                              className="rounded-md p-1 text-[#5C6260] hover:text-[#2B2E31] hover:bg-[#E5ECE2] transition-colors cursor-pointer"
                              title="Copy Code"
                            >
                              {isCopied ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                          <span className={`inline-block text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.2 rounded border ${
                            card.cardType === 'subscription'
                              ? 'bg-[#E5ECE2] text-[#232D21] border-[#7A8B71]/40'
                              : 'bg-[#FAF5EB] text-[#8C6D23] border-[#E8D7B0]'
                          }`}>
                            {card.cardType === 'subscription' ? 'Monthly Pass' : 'Gift Voucher'}
                          </span>
                        </div>
                      </td>

                      {/* Passholder / Recipient */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="font-serif font-bold text-sm text-[#2B2E31]">
                            {card.recipientName}
                          </p>
                          {card.planName && (
                            <p className="text-[10px] font-semibold text-[#5A6952]">{card.planName}</p>
                          )}
                          <p className="text-[11px] text-[#5C6260]">{card.recipientPhone || card.recipientEmail || 'Passholder'}</p>
                        </div>
                      </td>

                      {/* Buyer / Notes */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5 max-w-[180px]">
                          <p className="font-medium text-[#2B2E31] truncate">
                            {card.buyerName === card.recipientName ? 'Self-purchased' : card.buyerName}
                          </p>
                          {card.personalNote && (
                            <p className="text-[10px] text-[#8C6D23] truncate italic" title={card.personalNote}>
                              "{card.personalNote}"
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Remaining Sessions / Balance */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {card.cardType === 'subscription' ? (
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                  card.classesRemaining > 0
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-stone-100 text-stone-600 border border-stone-200'
                                }`}>
                                  {card.classesRemaining > 0
                                    ? `${card.classesRemaining} of ${card.totalClasses || 4} left`
                                    : 'All classes used'}
                                </span>
                              </div>
                              {/* Session Dots */}
                              <div className="flex items-center gap-1 mt-1">
                                {Array.from({ length: card.totalClasses || 4 }).map((_, i) => (
                                  <span
                                    key={i}
                                    className={`h-2 w-2 rounded-full ${
                                      i < (card.classesRemaining || 0)
                                        ? 'bg-[#5A6952]'
                                        : 'bg-[#E6E1D8]'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className="font-serif font-bold text-sm text-[#2B2E31] block">
                                GH₵{card.balance !== undefined ? card.balance : card.amount}
                              </span>
                              <span className="text-[10px] text-[#5C6260]">
                                of GH₵{card.amount} initial value
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Lifecycle Status */}
                      <td className="py-4 px-4">
                        {card.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Active
                          </span>
                        ) : card.status === 'exhausted' || card.status === 'redeemed' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                            Fully Attended
                          </span>
                        ) : card.status === 'voided' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-bold text-red-800">
                            <Ban className="h-3 w-3 text-red-600" />
                            Voided
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 border border-stone-200 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                            {card.status}
                          </span>
                        )}
                      </td>

                      {/* Purchased Timestamp */}
                      <td className="py-4 px-4">
                        {(() => {
                          const ts = formatExactDateTime(card.createdAt);
                          return (
                            <div className="flex flex-col text-xs max-w-[130px]" title={`Exact purchase time: ${ts.fullStr}`}>
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

                      {/* Redeemed Timestamp & History */}
                      <td className="py-4 px-4">
                        {(() => {
                          const historyCount = card.redemptionHistory?.length || 0;
                          if (card.redeemedAt || historyCount > 0) {
                            const ts = formatExactDateTime(card.redeemedAt || card.redemptionHistory?.[historyCount - 1]?.timestamp);
                            return (
                              <div className="flex flex-col text-xs max-w-[130px]" title={`Latest redemption: ${ts.fullStr}${historyCount > 1 ? ` (${historyCount} sessions used)` : ''}`}>
                                <span className="font-semibold text-emerald-800 flex items-center gap-1.5 whitespace-nowrap">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                                  <span>{ts.dateStr}</span>
                                </span>
                                {ts.timeStr ? (
                                  <span className="text-[11px] text-[#5C6260] font-mono flex items-center gap-1 mt-0.5 whitespace-nowrap">
                                    <Clock className="h-2.5 w-2.5 text-[#5A6952] shrink-0" />
                                    <span>{ts.timeStr}</span>
                                  </span>
                                ) : null}
                                {historyCount > 1 && (
                                  <span className="text-[9px] font-bold text-[#8C6D23] bg-[#FAF5EB] border border-[#E8D7B0] px-1.5 py-0.2 rounded-md mt-0.5 w-fit">
                                    {historyCount} sessions used
                                  </span>
                                )}
                              </div>
                            );
                          }
                          return (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#5C6260] italic whitespace-nowrap">
                              <span className="h-1.5 w-1.5 rounded-full bg-stone-300" />
                              Not yet redeemed
                            </span>
                          );
                        })()}
                      </td>

                      {/* Desk Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {isActive && hasCredits && (
                            <button
                              type="button"
                              onClick={() => openWalkInModal(card)}
                              className="inline-flex items-center gap-1 rounded-xl bg-[#5A6952] hover:bg-[#475441] text-white px-3 py-1.5 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                              title="Book student walk-in"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              <span>Book Walk-In</span>
                            </button>
                          )}

                          {card.status !== 'voided' && (
                            <button
                              type="button"
                              onClick={() => openAdjustModal(card)}
                              className="inline-flex items-center gap-1 rounded-xl border border-[#E8D7B0] bg-[#FAF5EB] hover:bg-[#F3EAD5] text-[#8C6D23] px-2.5 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                              title="Add +1 Courtesy Class"
                            >
                              <Plus className="h-3 w-3" />
                              <span>+1 Class</span>
                            </button>
                          )}

                          {isActive && (
                            <button
                              type="button"
                              onClick={() => openVoidModal(card)}
                              className="inline-flex items-center rounded-xl p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Void Pass"
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
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
          WALK-IN BOOKING & CHECK-IN MODAL
         ========================================================================= */}
      {walkInModalCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[#E6E1D8] shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E6E1D8] pb-4">
              <div>
                <div className="inline-flex items-center gap-1 rounded-full bg-[#E5ECE2] px-2.5 py-0.5 text-[11px] font-bold text-[#232D21]">
                  <Sparkles className="h-3 w-3 text-[#5A6952]" />
                  <span>Front Desk Check-In</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#2B2E31] mt-1">
                  Book Walk-In with Pass
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setWalkInModalCard(null)}
                className="rounded-full p-2 text-[#5C6260] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Passholder Summary Box */}
            <div className="rounded-2xl border border-[#C8A253]/40 bg-[#FAF5EB]/60 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-serif font-bold text-base text-[#2B2E31]">
                    {walkInModalCard.recipientName}
                  </p>
                  <p className="text-xs text-[#5C6260]">
                    {walkInModalCard.recipientPhone || walkInModalCard.recipientEmail || 'Passholder'}
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-[#2B2E31] bg-white border border-[#E8D7B0] px-2.5 py-1 rounded-lg">
                  {walkInModalCard.code}
                </span>
              </div>

              <div className="pt-2 border-t border-[#E8D7B0]/60 flex items-center justify-between text-xs">
                <span className="text-[#5C6260]">Pass Type:</span>
                <span className="font-bold text-[#232D21]">
                  {walkInModalCard.cardType === 'subscription' ? 'Monthly Flow Pass (Option A)' : 'Wellness Gift Voucher'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5C6260]">Remaining Before Check-In:</span>
                <span className="font-bold text-emerald-800">
                  {walkInModalCard.cardType === 'subscription'
                    ? `${walkInModalCard.classesRemaining} of ${walkInModalCard.totalClasses || 4} classes left`
                    : `GH₵ ${walkInModalCard.balance !== undefined ? walkInModalCard.balance : walkInModalCard.amount}`}
                </span>
              </div>
            </div>

            {/* Experience & Slot Selector Form */}
            <form onSubmit={handleConfirmWalkIn} className="space-y-4">
              {/* Class Selection */}
              <div>
                <label className="block text-xs font-bold text-[#2B2E31] uppercase tracking-wider mb-1.5">
                  Select Studio Experience
                </label>
                <div className="relative">
                  <select
                    value={walkInClassId}
                    onChange={(e) => {
                      setWalkInClassId(e.target.value);
                      const target = classes.find((c) => c.id === e.target.value);
                      if (target?.scheduleSlots?.[0]) {
                        setWalkInSlotId(target.scheduleSlots[0].id);
                      }
                    }}
                    className="w-full appearance-none rounded-2xl border border-[#E6E1D8] bg-white px-4 py-3 text-xs sm:text-sm font-semibold text-[#2B2E31] focus:border-[#5A6952] outline-none shadow-2xs pr-10"
                  >
                    {classes.map((cls) => {
                      const isEligible = walkInModalCard.cardType !== 'subscription' || (
                        cls.isPassEligible !== false && !cls.isPrivateOneOnOne && cls.category === 'Yoga Classes'
                      );

                      return (
                        <option
                          key={cls.id}
                          value={cls.id}
                          disabled={!isEligible}
                        >
                          {cls.title} {isEligible ? '✦ Flow Pass Included' : '(Premium - Pass Ineligible)'}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5C6260] pointer-events-none" />
                </div>
                {walkInModalCard.cardType === 'subscription' && (
                  <p className="mt-1 text-[11px] text-[#5A6952]">
                    ✦ Monthly Flow Pass covers Studio Group Yoga Classes (Option A).
                  </p>
                )}
              </div>

              {/* Schedule Slot Selection */}
              {selectedWalkInClass?.scheduleSlots && selectedWalkInClass.scheduleSlots.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-[#2B2E31] uppercase tracking-wider mb-1.5">
                    Select Class Slot
                  </label>
                  <div className="relative">
                    <select
                      value={walkInSlotId}
                      onChange={(e) => setWalkInSlotId(e.target.value)}
                      className="w-full appearance-none rounded-2xl border border-[#E6E1D8] bg-white px-4 py-3 text-xs sm:text-sm font-semibold text-[#2B2E31] focus:border-[#5A6952] outline-none shadow-2xs pr-10"
                    >
                      {selectedWalkInClass.scheduleSlots.map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {slot.day} {slot.time} • {slot.focus || selectedWalkInClass.title} ({slot.spotsLeft !== undefined ? `${slot.spotsLeft} spots left` : 'Open'})
                        </option>
                      ))}
                    </select>
                    <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5C6260] pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Instant Check-In Attendance Checkbox */}
              <div className="rounded-2xl border border-[#E6E1D8] bg-[#FAF8F5] p-3.5 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="walkInMarkCheckedIn"
                  checked={walkInMarkCheckedIn}
                  onChange={(e) => setWalkInMarkCheckedIn(e.target.checked)}
                  className="h-4 w-4 accent-[#5A6952] rounded cursor-pointer"
                />
                <label htmlFor="walkInMarkCheckedIn" className="text-xs text-[#2B2E31] font-semibold cursor-pointer select-none">
                  Mark as Checked-In right now (Student is present on the studio mat)
                </label>
              </div>

              {/* Front Desk Notes */}
              <div>
                <label className="block text-xs font-bold text-[#2B2E31] uppercase tracking-wider mb-1.5">
                  Desk Concierge Notes (Optional)
                </label>
                <input
                  type="text"
                  value={walkInNotes}
                  onChange={(e) => setWalkInNotes(e.target.value)}
                  placeholder="e.g. Front desk walk-in, assigned mat 3"
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-4 py-2.5 text-xs text-[#2B2E31] focus:border-[#5A6952] outline-none shadow-2xs"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E6E1D8]">
                <button
                  type="button"
                  onClick={() => setWalkInModalCard(null)}
                  className="rounded-2xl border border-[#E6E1D8] bg-white px-4 py-2.5 text-xs font-bold text-[#5C6260] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWalkIn}
                  className="flex items-center gap-2 rounded-2xl bg-[#232D21] hover:bg-[#2F3C2C] text-[#F7E7C4] px-5 py-2.5 text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <UserCheck className="h-4 w-4 text-[#C8A253]" />
                  <span>{isSubmittingWalkIn ? 'Checking In...' : 'Confirm Walk-In & Deduct 1 Credit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          COURTESY ADJUSTMENT MODAL (+1 Class)
         ========================================================================= */}
      {adjustModalCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#E6E1D8] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E1D8] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2B2E31]">
                  Grant Courtesy Class Credit
                </h3>
                <p className="text-xs text-[#5C6260]">
                  For student make-ups, medical reschedules, or studio extensions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdjustModalCard(null)}
                className="rounded-full p-1.5 text-[#5C6260] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-2xl border border-[#E8D7B0] bg-[#FAF5EB] p-3 text-xs space-y-1">
              <p className="font-bold text-[#2B2E31]">
                {adjustModalCard.recipientName} ({adjustModalCard.code})
              </p>
              <p className="text-[#8C6D23]">
                Current remaining: {adjustModalCard.classesRemaining || 0} classes
              </p>
            </div>

            <form onSubmit={handleConfirmAdjust} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#2B2E31] mb-1">
                  Classes to Add
                </label>
                <select
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs font-bold text-[#2B2E31]"
                >
                  <option value={1}>+1 Courtesy Class Session</option>
                  <option value={2}>+2 Courtesy Class Sessions</option>
                  <option value={4}>+4 Full Pass Renewal Credit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2E31] mb-1">
                  Audit Reason (Logged for Records)
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Doctor's note make-up session"
                  className="w-full rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs text-[#2B2E31]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E1D8]">
                <button
                  type="button"
                  onClick={() => setAdjustModalCard(null)}
                  className="rounded-xl border border-[#E6E1D8] px-3.5 py-2 text-xs font-semibold text-[#5C6260] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdjust}
                  className="flex items-center gap-1.5 rounded-xl bg-[#5A6952] hover:bg-[#475441] text-white px-4 py-2 text-xs font-bold shadow-2xs disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isSubmittingAdjust ? 'Updating...' : 'Confirm Courtesy Credit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          VOID / CANCEL MODAL
         ========================================================================= */}
      {voidModalCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white border border-red-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <ShieldAlert className="h-6 w-6 shrink-0" />
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2B2E31]">
                  Void Pass {voidModalCard.code}?
                </h3>
                <p className="text-xs text-[#5C6260]">
                  This cancels the pass and prevents any further class bookings.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 space-y-1">
              <p><strong>Passholder:</strong> {voidModalCard.recipientName}</p>
              <p><strong>Remaining Sessions:</strong> {voidModalCard.classesRemaining} classes</p>
            </div>

            <form onSubmit={handleConfirmVoid} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#2B2E31] mb-1">
                  Reason for Cancellation
                </label>
                <input
                  type="text"
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="e.g. Customer refund or chargeback"
                  className="w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-xs text-[#2B2E31]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E1D8]">
                <button
                  type="button"
                  onClick={() => setVoidModalCard(null)}
                  className="rounded-xl border border-[#E6E1D8] px-3.5 py-2 text-xs font-semibold text-[#5C6260] hover:bg-[#FAF8F5]"
                >
                  Keep Active
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVoid}
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold shadow-2xs disabled:opacity-50"
                >
                  <Ban className="h-3.5 w-3.5" />
                  <span>{isSubmittingVoid ? 'Voiding...' : 'Confirm Void'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
