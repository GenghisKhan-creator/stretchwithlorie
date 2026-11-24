import { useState, useEffect } from 'react';
import {
  Sparkles,
  Gift,
  Save,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  AlertCircle,
  Loader2,
  Star
} from 'lucide-react';
import { api } from '../services/api';
import { DEFAULT_WELLNESS_CATALOG } from '../data/wellnessCatalog';

const PLAN_STYLE_THEMES = [
  {
    id: 'sage',
    label: 'Sage Botanical',
    themeColor: '#7A8B71',
    cardGradient: 'from-[#223020] via-[#31452E] to-[#192318]',
    borderAccent: 'border-[#96AD8B]/60',
    badgeStyle: 'bg-[#E5ECE2] text-[#232D21]'
  },
  {
    id: 'gold',
    label: 'Champagne Gold',
    themeColor: '#C8A253',
    cardGradient: 'from-[#1C251B] via-[#2B3829] to-[#131A12]',
    borderAccent: 'border-[#C8A253]/75',
    badgeStyle: 'bg-gradient-to-r from-[#E6C981] to-[#C8A253] text-[#1C231A]'
  },
  {
    id: 'terracotta',
    label: 'Terracotta VIP',
    themeColor: '#A44A4A',
    cardGradient: 'from-[#2D1D1E] via-[#232D21] to-[#141A13]',
    borderAccent: 'border-[#E2B86B]/85',
    badgeStyle: 'bg-gradient-to-r from-[#A44A4A] via-[#B85757] to-[#C8A253] text-white'
  }
];

export default function WellnessCatalogEditor({ showToast }) {
  const [plans, setPlans] = useState(DEFAULT_WELLNESS_CATALOG.subscriptionPlans);
  const [giftPresets, setGiftPresets] = useState(DEFAULT_WELLNESS_CATALOG.giftPresets);
  const [minCustomGiftAmount, setMinCustomGiftAmount] = useState(DEFAULT_WELLNESS_CATALOG.minCustomGiftAmount);
  const [customPicksInput, setCustomPicksInput] = useState(DEFAULT_WELLNESS_CATALOG.customAmountPicks.join(', '));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    api.getWellnessCatalog()
      .then((catalog) => {
        if (!mounted || !catalog) return;
        setPlans(catalog.subscriptionPlans || DEFAULT_WELLNESS_CATALOG.subscriptionPlans);
        setGiftPresets(catalog.giftPresets || DEFAULT_WELLNESS_CATALOG.giftPresets);
        setMinCustomGiftAmount(catalog.minCustomGiftAmount || 100);
        setCustomPicksInput((catalog.customAmountPicks || [250, 500, 1000, 1500, 2000]).join(', '));
        setIsLoading(false);
      })
      .catch(() => {
        if (mounted) setIsLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const handlePlanChange = (index, field, value) => {
    setPlans((prev) =>
      prev.map((plan, i) => {
        if (field === 'isPopular' && value === true) {
          return { ...plan, isPopular: i === index };
        }
        if (i !== index) return plan;
        return { ...plan, [field]: value };
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleApplyPlanTheme = (index, themeId) => {
    const theme = PLAN_STYLE_THEMES.find((t) => t.id === themeId);
    if (!theme) return;
    setPlans((prev) =>
      prev.map((plan, i) =>
        i === index
          ? {
              ...plan,
              themeColor: theme.themeColor,
              cardGradient: theme.cardGradient,
              borderAccent: theme.borderAccent,
              badgeStyle: theme.badgeStyle
            }
          : plan
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleAddPlan = () => {
    const nextNum = plans.length + 1;
    const theme = PLAN_STYLE_THEMES[plans.length % PLAN_STYLE_THEMES.length];
    setPlans((prev) => [
      ...prev,
      {
        id: `plan-custom-${Date.now()}`,
        name: `New Sanctuary Tier ${nextNum}`,
        subtitle: 'Mindful Monthly Flow',
        badge: 'Studio Pass',
        tierCode: `FLOW-0${nextNum}`,
        isPopular: false,
        classesPerMonth: 4,
        price: 600,
        savings: 'Save GH₵ 80',
        description: 'Monthly studio classes with complimentary Manduka mat and herbal tea ritual.',
        themeColor: theme.themeColor,
        cardGradient: theme.cardGradient,
        borderAccent: theme.borderAccent,
        badgeStyle: theme.badgeStyle,
        cardPerks: ['4 Studio Flows / Mo', 'Manduka Pro Mat', 'Herbal Tea Ritual'],
        features: [
          '4 Studio Classes per month',
          'Complimentary mat & organic herbal tea ritual',
          'Flexible reschedule up to 24h prior'
        ]
      }
    ]);
    setHasUnsavedChanges(true);
  };

  const handleDeletePlan = (index) => {
    if (plans.length <= 1) {
      showToast?.('warning', 'At least one membership tier must remain active.');
      return;
    }
    setPlans((prev) => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const handlePresetChange = (index, field, value) => {
    setGiftPresets((prev) =>
      prev.map((preset, i) => (i === index ? { ...preset, [field]: value } : preset))
    );
    setHasUnsavedChanges(true);
  };

  const handleAddPreset = () => {
    setGiftPresets((prev) => [
      ...prev,
      {
        amount: 500,
        label: 'Wellness Treat',
        desc: 'Flexible Sanctuary Credit',
        icon: '✨'
      }
    ]);
    setHasUnsavedChanges(true);
  };

  const handleDeletePreset = (index) => {
    if (giftPresets.length <= 1) {
      showToast?.('warning', 'At least one gift preset must remain active.');
      return;
    }
    setGiftPresets((prev) => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const handleResetDefaults = () => {
    setPlans(DEFAULT_WELLNESS_CATALOG.subscriptionPlans);
    setGiftPresets(DEFAULT_WELLNESS_CATALOG.giftPresets);
    setMinCustomGiftAmount(DEFAULT_WELLNESS_CATALOG.minCustomGiftAmount);
    setCustomPicksInput(DEFAULT_WELLNESS_CATALOG.customAmountPicks.join(', '));
    setHasUnsavedChanges(true);
    showToast?.('info', 'Defaults loaded. Click "Save & Publish Changes" to apply.');
  };

  const handleSaveCatalog = async () => {
    setErrorMsg('');
    setIsSaving(true);
    try {
      const parsedPicks = customPicksInput
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n) && n >= 10);

      const payload = {
        subscriptionPlans: plans.map((p) => ({
          ...p,
          price: Number(p.price) || 100,
          classesPerMonth: parseInt(p.classesPerMonth, 10) || 1
        })),
        giftPresets: giftPresets.map((g) => ({
          ...g,
          amount: Number(g.amount) || 100
        })),
        customAmountPicks: parsedPicks.length > 0 ? parsedPicks : [250, 500, 1000, 1500, 2000],
        minCustomGiftAmount: Math.max(10, Number(minCustomGiftAmount) || 100)
      };

      const saved = await api.updateWellnessCatalog(payload);
      setPlans(saved.subscriptionPlans);
      setGiftPresets(saved.giftPresets);
      setMinCustomGiftAmount(saved.minCustomGiftAmount);
      setCustomPicksInput((saved.customAmountPicks || []).join(', '));
      setHasUnsavedChanges(false);
      showToast?.('success', 'Wellness plans & gift card pricing saved and published live!');
    } catch (err) {
      const msg = err.message || 'Could not save wellness catalog.';
      setErrorMsg(msg);
      showToast?.('warning', msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-[#E6E1D8] bg-white p-10 text-center text-xs text-[#5C6260] flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-[#C8A253]" />
        <span>Loading wellness &amp; gift card pricing catalog...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Sticky Action Bar */}
      <div className="rounded-3xl border border-[#E6E1D8] bg-[#FDFCFA] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7A8B71]">
            <span className="h-px w-4 bg-[#C8A253]" />
            <span>Live Pricing &amp; Offerings Manager</span>
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2B2E31] mt-0.5">
            Edit Wellness Cards &amp; Gift Voucher Prices
          </h3>
          <p className="text-xs text-[#5C6260]">
            Changes saved here immediately update the public Studio Membership &amp; Mindful Gifting modal and 3D cards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E6E1D8] bg-white px-3.5 py-2 text-xs font-semibold text-[#5C6260] hover:text-[#2B2E31] hover:border-[#C8A253]/60 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSaveCatalog}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full bg-[#232D21] hover:bg-[#192118] text-[#F7F4EF] border border-[#C8A253]/60 hover:border-[#C8A253] px-5 py-2 text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C8A253]" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 text-[#C8A253]" />
                <span>{hasUnsavedChanges ? 'Save & Publish Changes*' : 'Save & Publish Changes'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* ================================================================= */}
      {/* SECTION 1: WELLNESS MEMBERSHIP PASSES (3D KEYCARD TIERS) */}
      {/* ================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#C8A253]" />
            <h4 className="font-serif text-base sm:text-lg font-bold text-[#2B2E31]">
              1. Monthly Flow Pass Tiers ({plans.length})
            </h4>
          </div>

          <button
            type="button"
            onClick={handleAddPlan}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#EEE9E1] hover:bg-[#E5DFD3] text-[#232D21] border border-[#E6E1D8] px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-[#7A8B71]" />
            <span>Add Plan Tier</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {plans.map((plan, idx) => (
            <div
              key={plan.id}
              className="rounded-2xl border border-[#E6E1D8] bg-white p-4 sm:p-5 space-y-3.5 shadow-2xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Card Top Strip */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E6E1D8]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#EEE9E1] text-[#232D21]">
                      Tier {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePlanChange(idx, 'isPopular', !plan.isPopular)}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer border ${
                        plan.isPopular
                          ? 'bg-[#232D21] text-[#F7E7C4] border-[#C8A253]'
                          : 'bg-[#FAF8F5] text-[#5C6260] border-[#E6E1D8] hover:border-[#C8A253]'
                      }`}
                      title="Mark as featured / most popular tier"
                    >
                      <Star className={`h-2.5 w-2.5 ${plan.isPopular ? 'fill-[#C8A253] text-[#C8A253]' : ''}`} />
                      <span>{plan.isPopular ? 'Featured' : 'Set Featured'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeletePlan(idx)}
                    className="rounded-lg p-1.5 text-[#8A8277] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete tier"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Name & Subtitle */}
                <div className="grid grid-cols-1 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5C6260] mb-1">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      value={plan.name}
                      onChange={(e) => handlePlanChange(idx, 'name', e.target.value)}
                      className="w-full rounded-xl border border-[#E6E1D8] bg-[#FDFCFA] focus:bg-white px-3 py-1.5 text-xs font-semibold text-[#2B2E31] outline-none focus:border-[#C8A253]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5C6260] mb-1">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={plan.subtitle}
                        onChange={(e) => handlePlanChange(idx, 'subtitle', e.target.value)}
                        className="w-full rounded-xl border border-[#E6E1D8] bg-[#FDFCFA] focus:bg-white px-2.5 py-1.5 text-xs text-[#2B2E31] outline-none focus:border-[#C8A253]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5C6260] mb-1">
                        Badge Label
                      </label>
                      <input
                        type="text"
                        value={plan.badge}
                        onChange={(e) => handlePlanChange(idx, 'badge', e.target.value)}
                        className="w-full rounded-xl border border-[#E6E1D8] bg-[#FDFCFA] focus:bg-white px-2.5 py-1.5 text-xs text-[#2B2E31] outline-none focus:border-[#C8A253]"
                      />
                    </div>
                  </div>
                </div>

                {/* Price, Sessions & Savings */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5C6260] mb-1">
                      Price (GH₵)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={plan.price}
                      onChange={(e) => handlePlanChange(idx, 'price', e.target.value)}
                      className="w-full rounded-xl border border-[#C8A253]/60 bg-[#FAF6EE]/60 focus:bg-white px-2.5 py-1.5 text-xs font-bold text-[#232D21] outline-none focus:border-[#C8A253]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5C6260] mb-1">
                      Classes / Mo
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={plan.classesPerMonth}
                      onChange={(e) => handlePlanChange(idx, 'classesPerMonth', e.target.value)}
                      className="w-full rounded-xl border border-[#E6E1D8] bg-[#FDFCFA] focus:bg-white px-2.5 py-1.5 text-xs font-semibold text-[#2B2E31] outline-none focus:border-[#C8A253]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5C6260] mb-1">
                      Savings Tag
                    </label>
                    <input
                      type="text"
                      value={plan.savings}
                      onChange={(e) => handlePlanChange(idx, 'savings', e.target.value)}
                      placeholder="Save GH₵ 100"
                      className="w-full rounded-xl border border-[#E6E1D8] bg-[#FDFCFA] focus:bg-white px-2.5 py-1.5 text-xs text-[#2B2E31] outline-none focus:border-[#C8A253]"
                    />
                  </div>
                </div>

                {/* 3D Card Finish Theme */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5C6260] mb-1">
                    3D Keycard Color Theme
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PLAN_STYLE_THEMES.map((theme) => {
                      const active = plan.cardGradient === theme.cardGradient;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => handleApplyPlanTheme(idx, theme.id)}
                          className={`flex items-center justify-center gap-1 rounded-lg py-1 px-1.5 text-[10px] font-medium border transition-all cursor-pointer ${
                            active
                              ? 'bg-[#232D21] text-[#F7E7C4] border-[#C8A253]'
                              : 'bg-[#FAF8F5] text-[#5C6260] border-[#E6E1D8] hover:border-[#C8A253]/60'
                          }`}
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0 border border-white/50"
                            style={{ backgroundColor: theme.themeColor }}
                          />
                          <span className="truncate">{theme.label.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5C6260] mb-1">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    value={plan.description}
                    onChange={(e) => handlePlanChange(idx, 'description', e.target.value)}
                    className="w-full rounded-xl border border-[#E6E1D8] bg-[#FDFCFA] focus:bg-white p-2.5 text-xs text-[#2B2E31] outline-none focus:border-[#C8A253]"
                  />
                </div>

                {/* Card Perks (comma-separated) */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5C6260] mb-1">
                    3D Card Perk Pills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={(plan.cardPerks || []).join(', ')}
                    onChange={(e) =>
                      handlePlanChange(
                        idx,
                        'cardPerks',
                        e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    className="w-full rounded-xl border border-[#E6E1D8] bg-[#FDFCFA] focus:bg-white px-2.5 py-1.5 text-xs text-[#2B2E31] outline-none focus:border-[#C8A253]"
                  />
                </div>

                {/* Features List (one per line) */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5C6260] mb-1">
                    Included Features (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={(plan.features || []).join('\n')}
                    onChange={(e) =>
                      handlePlanChange(
                        idx,
                        'features',
                        e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    className="w-full rounded-xl border border-[#E6E1D8] bg-[#FDFCFA] focus:bg-white p-2.5 text-[11px] text-[#2B2E31] outline-none focus:border-[#C8A253] leading-relaxed"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================= */}
      {/* SECTION 2: MINDFUL GIFT CARD PRESETS & CUSTOM RULES */}
      {/* ================================================================= */}
      <div className="rounded-3xl border border-[#E6E1D8] bg-white p-4 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E6E1D8]">
          <div>
            <h4 className="font-serif text-base sm:text-lg font-bold text-[#2B2E31] flex items-center gap-2">
              <Gift className="h-4 w-4 text-[#A44A4A]" />
              <span>2. Mindful Gift Card Presets &amp; Custom Amount Rules</span>
            </h4>
            <p className="text-xs text-[#5C6260]">
              Set preset gift voucher prices, labels, descriptions, and minimum custom gift amount.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddPreset}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-[#EEE9E1] hover:bg-[#E5DFD3] text-[#232D21] border border-[#E6E1D8] px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-[#7A8B71]" />
            <span>Add Gift Preset</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {giftPresets.map((preset, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#E6E1D8] bg-[#FDFCFA] p-3.5 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8B71]">
                  Gift Option #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeletePreset(idx)}
                  className="rounded-lg p-1 text-[#8A8277] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove gift preset"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-[#5C6260] mb-0.5">
                    Price (GH₵)
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={preset.amount}
                    onChange={(e) => handlePresetChange(idx, 'amount', e.target.value)}
                    className="w-full rounded-xl border border-[#C8A253]/60 bg-white px-2.5 py-1.5 text-xs font-bold text-[#232D21] outline-none focus:border-[#C8A253]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#5C6260] mb-0.5">
                    Icon
                  </label>
                  <input
                    type="text"
                    value={preset.icon}
                    onChange={(e) => handlePresetChange(idx, 'icon', e.target.value)}
                    className="w-full rounded-xl border border-[#E6E1D8] bg-white px-2 py-1.5 text-xs text-center outline-none focus:border-[#C8A253]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#5C6260] mb-0.5">
                  Preset Title
                </label>
                <input
                  type="text"
                  value={preset.label}
                  onChange={(e) => handlePresetChange(idx, 'label', e.target.value)}
                  className="w-full rounded-xl border border-[#E6E1D8] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#2B2E31] outline-none focus:border-[#C8A253]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#5C6260] mb-0.5">
                  Short Description
                </label>
                <input
                  type="text"
                  value={preset.desc}
                  onChange={(e) => handlePresetChange(idx, 'desc', e.target.value)}
                  className="w-full rounded-xl border border-[#E6E1D8] bg-white px-2.5 py-1.5 text-xs text-[#5C6260] outline-none focus:border-[#C8A253]"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Custom Voucher Rules */}
        <div className="pt-3 border-t border-[#E6E1D8] grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
              Minimum Custom Gift Amount (GH₵)
            </label>
            <input
              type="number"
              min="10"
              value={minCustomGiftAmount}
              onChange={(e) => {
                setMinCustomGiftAmount(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="w-full rounded-xl border border-[#E6E1D8] bg-[#FDFCFA] focus:bg-white px-3 py-2 text-xs font-bold text-[#232D21] outline-none focus:border-[#C8A253]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
              Custom Quick-Pick Amounts (GH₵, comma-separated)
            </label>
            <input
              type="text"
              value={customPicksInput}
              onChange={(e) => {
                setCustomPicksInput(e.target.value);
                setHasUnsavedChanges(true);
              }}
              placeholder="250, 500, 1000, 1500, 2000"
              className="w-full rounded-xl border border-[#E6E1D8] bg-[#FDFCFA] focus:bg-white px-3 py-2 text-xs font-semibold text-[#232D21] outline-none focus:border-[#C8A253]"
            />
          </div>
        </div>

        {/* Bottom Save Reminder */}
        <div className="pt-3 border-t border-[#E6E1D8] flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#5C6260] flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[#7A8B71]" />
            Updates sync in real time to all open customer sessions.
          </span>

          <button
            type="button"
            onClick={handleSaveCatalog}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full bg-[#232D21] hover:bg-[#192118] text-[#F7F4EF] border border-[#C8A253]/60 hover:border-[#C8A253] px-5 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C8A253]" /> : <Save className="h-3.5 w-3.5 text-[#C8A253]" />}
            <span>{isSaving ? 'Saving...' : 'Save & Publish Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
