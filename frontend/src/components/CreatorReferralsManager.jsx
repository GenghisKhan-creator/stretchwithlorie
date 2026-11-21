import { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Tag,
  Users,
  TrendingUp,
  Award,
  Plus,
  Copy,
  Check,
  Link2,
  Trash2,
  PauseCircle,
  PlayCircle,
  Wand2,
  Percent,
  Phone,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../services/api';

export default function CreatorReferralsManager({ registrations = [], showToast }) {
  const [referrals, setReferrals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [expandedCodeId, setExpandedCodeId] = useState(null);

  const [form, setForm] = useState({
    creatorName: '',
    creatorHandle: '',
    creatorPhone: '',
    code: '',
    discountType: 'percentage', // 'percentage' | 'fixed'
    discountValue: 15,
    commissionPercent: 10,
    maxUses: '50',
    notes: ''
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let mounted = true;
    api.getReferrals().then((data) => {
      if (mounted) {
        setReferrals(Array.isArray(data) ? data : []);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [registrations.length]);

  const summary = useMemo(() => {
    const activeCount = referrals.filter((r) => r.isActive).length;
    const totalUses = referrals.reduce((sum, r) => sum + (Number(r.usesCount) || 0), 0);
    const cappedReferrals = referrals.filter((r) => r.maxUses !== null && Number(r.maxUses) > 0);
    const totalRemainingOnCapped = cappedReferrals.reduce(
      (sum, r) => sum + Math.max(0, Number(r.maxUses) - (Number(r.usesCount) || 0)),
      0
    );
    const unlimitedCount = referrals.length - cappedReferrals.length;
    const totalRevenue = referrals.reduce((sum, r) => sum + (Number(r.totalRevenueGenerated) || 0), 0);
    const totalCommission = referrals.reduce((sum, r) => sum + (Number(r.totalCommissionEarned) || 0), 0);
    return {
      activeCount,
      totalUses,
      totalRemainingOnCapped,
      unlimitedCount,
      totalRevenue,
      totalCommission
    };
  }, [referrals]);

  const handleAutoGenerateCode = () => {
    const base = (form.creatorName || form.creatorHandle || 'LORIE')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 6);
    const val = Math.round(Number(form.discountValue) || 15);
    const generated = `${base || 'YOGA'}${val}`;
    setForm((prev) => ({ ...prev, code: generated }));
    setFormError('');
  };

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    if (!form.creatorName.trim()) {
      setFormError('Please enter the content creator or campaign name.');
      return;
    }
    if (!form.code.trim()) {
      setFormError('Please enter or auto-generate a promo code.');
      return;
    }
    if (!form.discountValue || Number(form.discountValue) <= 0) {
      setFormError('Discount value must be greater than 0.');
      return;
    }

    setIsCreating(true);
    setFormError('');
    try {
      const created = await api.createReferral({
        ...form,
        code: form.code.trim().toUpperCase(),
        discountValue: Number(form.discountValue),
        commissionPercent: Number(form.commissionPercent) || 0,
        maxUses: form.maxUses ? Number(form.maxUses) : null
      });
      setReferrals((prev) => [created, ...prev]);
      setForm({
        creatorName: '',
        creatorHandle: '',
        creatorPhone: '',
        code: '',
        discountType: 'percentage',
        discountValue: 15,
        commissionPercent: 10,
        maxUses: '50',
        notes: ''
      });
      if (showToast) {
        showToast('success', `Referral code "${created.code}" created for ${created.creatorName}!`);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create referral code.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleStatus = async (refItem) => {
    const updated = await api.toggleReferralStatus(refItem.id);
    if (updated) {
      setReferrals((prev) => prev.map((r) => (r.id === refItem.id ? updated : r)));
      if (showToast) {
        showToast(
          'info',
          `Code "${refItem.code}" is now ${updated.isActive ? 'Active' : 'Paused'}.`
        );
      }
    }
  };

  const handleDelete = async (refItem) => {
    await api.deleteReferral(refItem.id);
    setReferrals((prev) => prev.filter((r) => r.id !== refItem.id));
    if (showToast) {
      showToast('info', `Deleted promo code "${refItem.code}".`);
    }
  };

  const handleCopyText = (text, idKey, label) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idKey);
    if (showToast) {
      showToast('success', `${label} copied to clipboard!`);
    }
    setTimeout(() => setCopiedId(null), 2200);
  };

  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  return (
    <div id="creator-referrals-manager" className="mt-12 pt-8 border-t border-[#E6E1D8] space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF5EB] border border-[#E8D7B0] px-3 py-0.5 text-xs font-bold text-[#8C6D23]">
            <Sparkles className="h-3.5 w-3.5 text-[#C8A253]" />
            <span>Creator Collaborations & Promo Engine</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2B2E31] mt-1">
            Influencer Referrals, Usage Quota & Discount Codes
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6260]">
            Track exactly how many people have used each creator code, how many redemptions are left, and revenue/commission per partner.
          </p>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-[#E6E1D8] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#5C6260] font-semibold">
            <span>People Used Codes</span>
            <Users className="h-4 w-4 text-[#C8A253]" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-[#2B2E31]">
            {summary.totalUses}{' '}
            <span className="text-xs font-sans font-normal text-[#5C6260]">people redeemed</span>
          </p>
        </div>

        <div className="rounded-2xl border border-[#E6E1D8] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#5C6260] font-semibold">
            <span>Code Uses Remaining</span>
            <Tag className="h-4 w-4 text-[#7A8B71]" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-[#5A6952]">
            {summary.totalRemainingOnCapped}{' '}
            <span className="text-xs font-sans font-normal text-[#5C6260]">
              left{summary.unlimitedCount > 0 ? ` (+${summary.unlimitedCount} ∞)` : ''}
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-[#E6E1D8] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#5C6260] font-semibold">
            <span>Creator-Driven Revenue</span>
            <TrendingUp className="h-4 w-4 text-[#5A6952]" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-[#5A6952]">
            GH₵{summary.totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E6E1D8] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#5C6260] font-semibold">
            <span>Creator Commissions</span>
            <Award className="h-4 w-4 text-[#A44A4A]" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-[#A44A4A]">
            GH₵{summary.totalCommission.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Main Grid: Generator Form (Left 5 cols) + Active Codes List (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Generator Card */}
        <form
          onSubmit={handleCreateReferral}
          className="lg:col-span-5 rounded-3xl border border-[#E6E1D8] bg-[#FAF8F5] p-5 sm:p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[#E6E1D8] pb-3">
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#2B2E31]">
                Generate New Code & Quota
              </h3>
              <p className="text-[11px] text-[#5C6260]">
                Set discount, commission split, and total redemption limit
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#232D21] text-[#C8A253]">
              <Plus className="h-4 w-4" />
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                Creator Name or Campaign Title *
              </label>
              <input
                type="text"
                value={form.creatorName}
                onChange={(e) => {
                  setForm({ ...form, creatorName: e.target.value });
                  setFormError('');
                }}
                placeholder="e.g. Ama Serwaa or Weekend Wellness Promo"
                className="w-full rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs sm:text-sm text-[#2B2E31] outline-none focus:border-[#7A8B71]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                  Social Handle (IG / TikTok)
                </label>
                <input
                  type="text"
                  value={form.creatorHandle}
                  onChange={(e) => setForm({ ...form, creatorHandle: e.target.value })}
                  placeholder="e.g. @amaserwaa"
                  className="w-full rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                  Creator MoMo / WhatsApp
                </label>
                <input
                  type="tel"
                  value={form.creatorPhone}
                  onChange={(e) => setForm({ ...form, creatorPhone: e.target.value })}
                  placeholder="024 123 4567"
                  className="w-full rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                />
              </div>
            </div>

            {/* Discount Type & Value */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                  Student Discount Type
                </label>
                <select
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  className="w-full rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs font-semibold text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                >
                  <option value="percentage">Percentage (% Off)</option>
                  <option value="fixed">Fixed Amount (GH₵ Off)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                  Discount Value ({form.discountType === 'percentage' ? '%' : 'GH₵'}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={form.discountType === 'percentage' ? '100' : '1000'}
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  className="w-full rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs font-bold text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                />
              </div>
            </div>

            {/* Commission & Max Uses */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                  Creator Commission (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.commissionPercent}
                    onChange={(e) => setForm({ ...form, commissionPercent: e.target.value })}
                    placeholder="10"
                    className="w-full rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 pr-7 text-xs font-semibold text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                  />
                  <Percent className="h-3.5 w-3.5 text-[#5C6260] absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                  Usage Limit (How Many People)
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                  placeholder="Leave blank for ∞"
                  className="w-full rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs font-semibold text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                />
              </div>
            </div>

            {/* Promo Code Input + Auto-Generator */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#2B2E31]">
                  Referral / Discount Code *
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateCode}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7A8B71] hover:text-[#5A6952] cursor-pointer"
                >
                  <Wand2 className="h-3 w-3" />
                  <span>Auto-Generate</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => {
                    setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s+/g, '') });
                    setFormError('');
                  }}
                  placeholder="e.g. AMA15 or GLOW20"
                  className="flex-1 rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#232D21] outline-none focus:border-[#7A8B71]"
                />
                <button
                  type="button"
                  onClick={handleAutoGenerateCode}
                  className="rounded-xl border border-[#E6E1D8] bg-white hover:bg-[#F1F4EF] px-3 py-2 text-xs font-semibold text-[#2B2E31] transition-colors cursor-pointer"
                >
                  Suggest
                </button>
              </div>
            </div>

            {formError && (
              <p className="text-xs font-semibold text-[#A44A4A] bg-[#FFF5F5] border border-[#A44A4A]/30 rounded-xl px-3 py-2">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={isCreating}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#232D21] hover:bg-[#2F3C2C] text-[#F7E7C4] py-3 px-4 text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-70"
            >
              <Sparkles className="h-4 w-4 text-[#C8A253]" />
              <span>{isCreating ? 'Generating Code...' : 'Create Referral Code & Link'}</span>
            </button>
          </div>
        </form>

        {/* Active Codes & Creator Links List */}
        <div className="lg:col-span-7 space-y-3.5">
          {isLoading ? (
            <div className="rounded-3xl border border-[#E6E1D8] bg-white p-8 text-center text-xs text-[#5C6260]">
              Loading creator codes...
            </div>
          ) : referrals.length === 0 ? (
            <div className="rounded-3xl border border-[#E6E1D8] bg-white p-8 text-center space-y-2">
              <Tag className="h-8 w-8 text-[#7A8B71] mx-auto" />
              <h4 className="font-serif text-base font-bold text-[#2B2E31]">
                No Creator Codes Yet
              </h4>
              <p className="text-xs text-[#5C6260]">
                Use the generator on the left to create your first influencer referral code or discount link.
              </p>
            </div>
          ) : (
            referrals.map((refItem) => {
              const referralUrl = `${siteOrigin}/?ref=${encodeURIComponent(refItem.code)}`;
              const isCodeCopied = copiedId === `code-${refItem.id}`;
              const isLinkCopied = copiedId === `link-${refItem.id}`;

              const usedCount = Number(refItem.usesCount || 0);
              const hasMaxLimit = refItem.maxUses !== null && Number(refItem.maxUses) > 0;
              const maxLimit = hasMaxLimit ? Number(refItem.maxUses) : null;
              const remainingLeft = hasMaxLimit ? Math.max(0, maxLimit - usedCount) : null;
              const usagePercent = hasMaxLimit ? Math.min(100, Math.round((usedCount / maxLimit) * 100)) : 0;

              // Match student registrations who redeemed this code
              const matchingBookings = registrations.filter(
                (reg) => reg.promoCode && reg.promoCode.toUpperCase() === refItem.code.toUpperCase()
              );
              const isExpanded = expandedCodeId === refItem.id;

              return (
                <div
                  key={refItem.id}
                  className={`rounded-3xl border p-4 sm:p-5 transition-all bg-white shadow-2xs space-y-3.5 ${
                    refItem.isActive ? 'border-[#E6E1D8]' : 'border-[#E6E1D8] opacity-65 bg-[#FAF8F5]'
                  }`}
                >
                  {/* Top Row: Code Pill, Creator Info & Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#F1ECE4]">
                    <div className="flex items-start sm:items-center gap-3">
                      {/* Code Pill */}
                      <button
                        type="button"
                        onClick={() => handleCopyText(refItem.code, `code-${refItem.id}`, `Code "${refItem.code}"`)}
                        className="group inline-flex items-center gap-1.5 rounded-2xl bg-[#232D21] text-[#F7E7C4] px-3.5 py-2 font-mono text-xs sm:text-sm font-bold tracking-wider border border-[#C8A253]/50 shadow-xs cursor-pointer hover:bg-[#2F3C2C]"
                        title="Click to copy code"
                      >
                        <span>{refItem.code}</span>
                        {isCodeCopied ? (
                          <Check className="h-3.5 w-3.5 text-[#7A8B71]" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-[#C8A253] opacity-80 group-hover:opacity-100" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-serif text-base font-bold text-[#2B2E31]">
                            {refItem.creatorName}
                          </h4>
                          {refItem.creatorHandle && (
                            <span className="text-xs font-semibold text-[#7A8B71]">
                              {refItem.creatorHandle}
                            </span>
                          )}
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              !refItem.isActive
                                ? 'bg-stone-200 text-stone-600'
                                : hasMaxLimit && remainingLeft === 0
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-[#E5ECE2] text-[#5A6952]'
                            }`}
                          >
                            {!refItem.isActive
                              ? 'Paused'
                              : hasMaxLimit && remainingLeft === 0
                                ? 'Limit Reached (0 Left)'
                                : 'Active'}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-2 flex-wrap text-[11px] text-[#5C6260]">
                          <span className="rounded-lg bg-[#FAF5EB] border border-[#E8D7B0] px-2 py-0.5 font-bold text-[#8C6D23]">
                            Student Discount:{' '}
                            {refItem.discountType === 'percentage'
                              ? `${refItem.discountValue}% OFF`
                              : `GH₵${refItem.discountValue} OFF`}
                          </span>
                          <span className="rounded-lg bg-[#F1F4EF] border border-[#DCE4D9] px-2 py-0.5 font-semibold text-[#5A6952]">
                            Creator Split: {refItem.commissionPercent}%
                          </span>
                          {refItem.creatorPhone && (
                            <span className="inline-flex items-center gap-1 text-[#5C6260]">
                              <Phone className="h-3 w-3 text-[#7A8B71]" />
                              {refItem.creatorPhone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Controls: Pause/Resume & Delete */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(refItem)}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#E6E1D8] bg-[#FAF8F5] hover:bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#2B2E31] transition-colors cursor-pointer"
                        title={refItem.isActive ? 'Pause code' : 'Activate code'}
                      >
                        {refItem.isActive ? (
                          <>
                            <PauseCircle className="h-3.5 w-3.5 text-amber-600" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-3.5 w-3.5 text-[#5A6952]" />
                            <span>Activate</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(refItem)}
                        className="rounded-xl border border-[#E6E1D8] bg-[#FAF8F5] hover:bg-[#FFF5F5] hover:border-[#A44A4A]/30 p-1.5 text-[#5C6260] hover:text-[#A44A4A] transition-colors cursor-pointer"
                        title="Delete code"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Middle Box: Explicit "How Many Used" & "How Many Left" Progress Strip */}
                  <div className="rounded-2xl bg-[#FAF8F5] border border-[#E6E1D8] p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 font-bold text-[#2B2E31]">
                          <Users className="h-3.5 w-3.5 text-[#7A8B71]" />
                          {usedCount} {usedCount === 1 ? 'person used' : 'people used'}
                        </span>
                        {hasMaxLimit && (
                          <span className="text-[11px] text-[#5C6260]">
                            (out of {maxLimit} limit)
                          </span>
                        )}
                      </div>

                      {/* Remaining / Left Pill */}
                      <div>
                        {hasMaxLimit ? (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              remainingLeft === 0
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : remainingLeft <= 5
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-[#E5ECE2] text-[#5A6952] border border-[#DCE4D9]'
                            }`}
                          >
                            {remainingLeft === 0
                              ? '0 uses left • Exhausted'
                              : `${remainingLeft} ${remainingLeft === 1 ? 'use' : 'uses'} left`}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#E5ECE2] border border-[#DCE4D9] px-2.5 py-0.5 text-[11px] font-bold text-[#5A6952]">
                            ∞ Unlimited uses left
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Visual Progress Bar when a Max Limit is set */}
                    {hasMaxLimit && (
                      <div className="w-full h-2 rounded-full bg-[#E6E1D8] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            remainingLeft === 0
                              ? 'bg-[#A44A4A]'
                              : remainingLeft <= 5
                                ? 'bg-[#C8A253]'
                                : 'bg-[#5A6952]'
                          }`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Bottom Row: Revenue, Commission & Copy Link */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4 text-xs flex-wrap">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#5C6260] block">
                          Used / Left
                        </span>
                        <span className="font-bold text-[#2B2E31]">
                          {usedCount} used • {hasMaxLimit ? `${remainingLeft} left` : '∞ left'}
                        </span>
                      </div>

                      <div className="h-6 w-px bg-[#E6E1D8]" />

                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#5C6260] block">
                          Revenue Generated
                        </span>
                        <span className="font-bold text-[#5A6952]">
                          GH₵{Number(refItem.totalRevenueGenerated || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="h-6 w-px bg-[#E6E1D8]" />

                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#5C6260] block">
                          Commission Owed
                        </span>
                        <span className="font-bold text-[#A44A4A]">
                          GH₵{Number(refItem.totalCommissionEarned || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions: View Redeemed Students + Copy Shareable Link */}
                    <div className="flex items-center gap-2">
                      {matchingBookings.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCodeId(isExpanded ? null : refItem.id)
                          }
                          className="inline-flex items-center gap-1 rounded-xl border border-[#E6E1D8] bg-[#FAF8F5] hover:bg-white px-2.5 py-1.5 text-xs font-semibold text-[#2B2E31] transition-colors cursor-pointer"
                        >
                          <span>Students ({matchingBookings.length})</span>
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText(
                            referralUrl,
                            `link-${refItem.id}`,
                            `Referral link for ${refItem.creatorName}`
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#F1F4EF] hover:bg-[#E5ECE2] border border-[#DCE4D9] px-3 py-1.5 text-xs font-bold text-[#232D21] transition-colors cursor-pointer"
                      >
                        {isLinkCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-[#5A6952]" />
                            <span>Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Link2 className="h-3.5 w-3.5 text-[#7A8B71]" />
                            <span>Copy Creator Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Drawer: Exact Students Who Redeemed This Code */}
                  {isExpanded && matchingBookings.length > 0 && (
                    <div className="pt-3 border-t border-[#E6E1D8] space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#5C6260]">
                        Students Who Used {refItem.code}:
                      </p>
                      <div className="space-y-1.5">
                        {matchingBookings.map((b) => (
                          <div
                            key={b.id}
                            className="flex items-center justify-between gap-2 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] px-3 py-2 text-xs"
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-[#2B2E31]">{b.studentName}</span>
                              <span className="text-[#5C6260]"> • {b.className}</span>
                            </div>
                            <div className="shrink-0 font-semibold text-[#5A6952]">
                              Paid GH₵{b.amount}
                              {b.discountAmount ? ` (-GH₵${b.discountAmount} saved)` : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
