import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Lock,
  Unlock,
  Plus,
  Video,
  Sparkles,
  X,
  Upload,
  Clock,
  Heart,
  CreditCard,
  RotateCcw,
  Volume2,
  VolumeX,
  User,
  Film,
  AlertCircle,
  Download
} from 'lucide-react';
import MobileMoneyLogo from './MobileMoneyLogo';
import { PaystackIcon } from './RegistrationForm';
import { api } from '../services/api';
import flexibilityImg from '../assets/flexibility_masterclass.jpg';
import thaiStretchImg from '../assets/thai_yoga_stretches.jpg';
import privateYogaImg from '../assets/private_yoga_class.jpg';
import couplesYogaImg from '../assets/couples_yoga.jpg';

const STORAGE_KEY_VIDEOS = 'stretchwithlorie_full_videos_v2';
const STORAGE_KEY_UNLOCKED = 'stretchwithlorie_unlocked_full_videos_v2';

const MINIMUM_VIDEO_PRICE_GHS = 30;
const FREE_PREVIEW_DURATION_SECS = 30;

// Helper to format seconds into MM:SS
function formatTimeMMSS(totalSeconds) {
  const sec = Math.max(0, Math.floor(totalSeconds || 0));
  const mins = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${mins}:${String(rem).padStart(2, '0')}`;
}

// INITIAL CURATED FULL-LENGTH VIDEOS (WITH 30-SECOND FREE SITE PREVIEW)
const INITIAL_VIDEOS = [
  {
    id: 'vid-full-spine',
    title: 'Full-Body Morning Spine & Neck Decompression Flow',
    creatorName: 'Lorie',
    creatorRole: 'Founder & Lead Yoga Specialist',
    category: 'Spine & Posture',
    previewSeconds: 30,
    fullDurationSeconds: 1440, // 24:00 full video
    fullDurationLabel: '24 mins',
    minPrice: 30,
    thumbnail: flexibilityImg,
    videoUrl: '',
    description: 'Watch the first 30 seconds free! Unlock the complete 24-minute guided cervical, thoracic, and lower-back decompression class.',
    cues: [
      '0:00 - 0:30 (Free Preview) • Grounding breath & cervical spine decompression warm-up',
      '0:30 - 12:00 (Full Video) • Deep thoracic cat-cow waves, scapula release & ribcage expansion',
      '12:00 - 24:00 (Full Video) • Lower-back psoas melt, supine twists & guided Savasana integration'
    ],
    purchasesCount: 42
  },
  {
    id: 'vid-full-hips',
    title: 'Deep Hip Flexor, Psoas & Split Mobility Masterclass',
    creatorName: 'Lorie',
    creatorRole: 'Founder & Lead Yoga Specialist',
    category: 'Hip Mobility',
    previewSeconds: 30,
    fullDurationSeconds: 1920, // 32:00 full video
    fullDurationLabel: '32 mins',
    minPrice: 30,
    thumbnail: thaiStretchImg,
    videoUrl: '',
    description: 'Try the 30-second preview on the site. Unlock the full 32-minute deep hip opening and hamstring flexibility session.',
    cues: [
      '0:00 - 0:30 (Free Preview) • Kneeling hip flexor alignment & posterior pelvic tilt setup',
      '0:30 - 18:00 (Full Video) • Dynamic lizard lunge progressions, frog pose & active psoas lengthening',
      '18:00 - 32:00 (Full Video) • Supported front-split prep, pigeon pose release & pelvic floor calm'
    ],
    purchasesCount: 38
  },
  {
    id: 'vid-full-desk',
    title: 'Evening Shoulder, Upper Back & Tension Headache Relief',
    creatorName: 'Lorie',
    creatorRole: 'Founder & Lead Yoga Specialist',
    category: 'Desk & Shoulders',
    previewSeconds: 30,
    fullDurationSeconds: 1080, // 18:00 full video
    fullDurationLabel: '18 mins',
    minPrice: 30,
    thumbnail: privateYogaImg,
    videoUrl: '',
    description: 'Preview 30 seconds free. Purchase to access the complete 18-minute upper-body melt designed to erase desk tension.',
    cues: [
      '0:00 - 0:30 (Free Preview) • Eagle arms shoulder-blade spread & vagus nerve breath',
      '0:30 - 10:00 (Full Video) • Chest wall opening, puppy pose heart melt & wrist flexor therapy',
      '10:00 - 18:00 (Full Video) • Neck fascia release & restorative supported fish pose'
    ],
    purchasesCount: 27
  },
  {
    id: 'vid-full-sleep',
    title: 'Bedtime Nervous System Reset & Restorative Yin Stretch',
    creatorName: 'Lorie',
    creatorRole: 'Founder & Lead Yoga Specialist',
    category: 'Breath & Calm',
    previewSeconds: 30,
    fullDurationSeconds: 1680, // 28:00 full video
    fullDurationLabel: '28 mins',
    minPrice: 30,
    thumbnail: couplesYogaImg,
    videoUrl: '',
    description: 'Watch the 30-second preview free, then unlock the full 28-minute bedtime yin stretch and 4-7-8 breathwork ritual.',
    cues: [
      '0:00 - 0:30 (Free Preview) • Sacral rock, knees-to-chest & 4-7-8 breath rhythm intro',
      '0:30 - 16:00 (Full Video) • Long-hold butterfly fold, supported bridge & spinal unwinding',
      '16:00 - 28:00 (Full Video) • Legs-up-the-wall lymphatic drain & deep sleep Yoga Nidra'
    ],
    purchasesCount: 54
  }
];

const QUICK_PRICE_TIERS = [
  { amount: 30, label: 'Minimum Price', badge: 'Base Unlock' },
  { amount: 50, label: '+GH₵ 20 Boost', badge: 'Supporter' },
  { amount: 75, label: '+GH₵ 45 Tip', badge: 'Community Patron' },
  { amount: 100, label: '+GH₵ 70 Blessing', badge: 'Sanctuary Champion' }
];

export default function ShortVideosSection({ onVideoPurchased, showToast, isAdmin = false }) {
  // Load persisted videos
  const [videos, setVideos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VIDEOS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_VIDEOS;
  });

  // Load persisted unlocked video IDs
  const [unlockedMap, setUnlockedMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_UNLOCKED);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [purchaseTargetVideo, setPurchaseTargetVideo] = useState(null);
  const [activePlayerVideo, setActivePlayerVideo] = useState(null);

  // Player state (30s Free Preview vs Full Video when Unlocked)
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPreviewLockedAt30s, setIsPreviewLockedAt30s] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoElementRef = useRef(null);

  // Purchase Modal Form State (Min GH₵ 30, Pay What You Want)
  const [payAmount, setPayAmount] = useState(MINIMUM_VIDEO_PRICE_GHS);
  const [customPayInput, setCustomPayInput] = useState('30');
  const [isCustomPay, setIsCustomPay] = useState(false);
  const [buyerForm, setBuyerForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    paymentChannel: 'momo',
    momoNetwork: 'MTN',
    momoNumber: ''
  });
  const [purchaseErrors, setPurchaseErrors] = useState({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState(0);

  // Post Video Modal Form State
  const [postForm, setPostForm] = useState({
    title: '',
    creatorName: 'Lorie',
    creatorRole: 'Founder & Lead Yoga Specialist',
    category: 'Spine & Posture',
    fullDurationMinutes: 20,
    minPrice: 30,
    description: '',
    videoDataUrl: '',
    videoFileName: '',
    detectedFullDurationSeconds: 1200,
    coverPreview: flexibilityImg
  });
  const [postErrors, setPostErrors] = useState({});
  const [isCheckingVideo, setIsCheckingVideo] = useState(false);

  // Hydrate videos from Express + PostgreSQL backend if available
  useEffect(() => {
    api.getVideos().then((backendVideos) => {
      if (backendVideos && Array.isArray(backendVideos) && backendVideos.length > 0) {
        setVideos(backendVideos);
      }
    });
  }, []);

  // Save videos to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VIDEOS, JSON.stringify(videos));
    } catch {
      // ignore quota errors
    }
  }, [videos]);

  // Save unlocked map to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_UNLOCKED, JSON.stringify(unlockedMap));
    } catch {
      // ignore
    }
  }, [unlockedMap]);

  // Check if active player video is unlocked
  const isActiveVideoUnlocked = activePlayerVideo ? Boolean(unlockedMap[activePlayerVideo.id]) : false;
  const maxAllowedSeconds = activePlayerVideo
    ? isActiveVideoUnlocked
      ? (activePlayerVideo.fullDurationSeconds || 1200)
      : FREE_PREVIEW_DURATION_SECS
    : FREE_PREVIEW_DURATION_SECS;

  // Player Timer Loop:
  // - If NOT unlocked: plays free 30-second preview (0:00 -> 0:30s), then locks & prompts payment for full video!
  // - If UNLOCKED: plays the entire full-length video without the 30s cutoff!
  useEffect(() => {
    if (!activePlayerVideo || !isPlaying || activePlayerVideo.videoUrl) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        if (!isActiveVideoUnlocked && prev + 1 >= FREE_PREVIEW_DURATION_SECS) {
          setIsPlaying(false);
          setIsPreviewLockedAt30s(true);
          return FREE_PREVIEW_DURATION_SECS;
        }
        if (isActiveVideoUnlocked && prev + 1 >= maxAllowedSeconds) {
          setIsPlaying(false);
          return maxAllowedSeconds;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activePlayerVideo, isPlaying, isActiveVideoUnlocked, maxAllowedSeconds]);

  // Start watching either the 30-Second Free Preview or the Unlocked Full Video
  const handleOpenVideoPlayer = (video) => {
    setActivePlayerVideo(video);
    setElapsedSeconds(0);
    setIsPreviewLockedAt30s(false);
    setIsPlaying(true);
  };

  // Open Purchase Modal for a video
  const handleOpenPurchaseModal = (video) => {
    const startAmt = Math.max(MINIMUM_VIDEO_PRICE_GHS, Number(video.minPrice) || MINIMUM_VIDEO_PRICE_GHS);
    setPurchaseTargetVideo(video);
    setPayAmount(startAmt);
    setCustomPayInput(String(startAmt));
    setIsCustomPay(false);
    setPurchaseErrors({});
  };

  // Effective payment amount
  const effectivePayAmount = isCustomPay ? (parseFloat(customPayInput) || 0) : payAmount;

  // Validate & Process Full Video Purchase
  const handleCompletePurchase = () => {
    if (!purchaseTargetVideo) return;
    const errs = {};

    const minAllowed = Math.max(MINIMUM_VIDEO_PRICE_GHS, Number(purchaseTargetVideo.minPrice) || MINIMUM_VIDEO_PRICE_GHS);
    if (!effectivePayAmount || effectivePayAmount < MINIMUM_VIDEO_PRICE_GHS) {
      errs.amount = `Minimum price for a video is GH₵ ${MINIMUM_VIDEO_PRICE_GHS}. You can choose to pay GH₵ ${MINIMUM_VIDEO_PRICE_GHS} or more.`;
    } else if (effectivePayAmount < minAllowed) {
      errs.amount = `Minimum price for this video is GH₵ ${minAllowed}.`;
    }

    if (!buyerForm.fullName.trim()) {
      errs.fullName = 'Please enter your name.';
    }
    if (!buyerForm.phone.trim()) {
      errs.phone = 'WhatsApp or phone number is required.';
    }

    setPurchaseErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsProcessingPayment(true);
    setPaymentStep(1);
    setTimeout(() => setPaymentStep(2), 650);
    setTimeout(() => setPaymentStep(3), 1300);

    setTimeout(() => {
      const receiptCode = `FULLVID-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const purchaseRecord = {
        videoId: purchaseTargetVideo.id,
        videoTitle: purchaseTargetVideo.title,
        creatorName: purchaseTargetVideo.creatorName,
        fullDurationLabel: purchaseTargetVideo.fullDurationLabel,
        amountPaid: effectivePayAmount,
        extraSupport: Math.max(0, effectivePayAmount - MINIMUM_VIDEO_PRICE_GHS),
        buyerName: buyerForm.fullName,
        buyerPhone: buyerForm.phone,
        buyerEmail: buyerForm.email,
        receiptCode,
        unlockedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        paymentMethod: buyerForm.paymentChannel === 'momo' ? `${buyerForm.momoNetwork} MoMo` : 'Card'
      };

      // Unlock full video
      setUnlockedMap((prev) => ({
        ...prev,
        [purchaseTargetVideo.id]: purchaseRecord
      }));

      // Persist unlock & purchase in PostgreSQL backend
      api.purchaseVideo(purchaseTargetVideo.id, {
        buyerName: buyerForm.fullName,
        buyerPhone: buyerForm.phone,
        amount: effectivePayAmount,
        momoNetwork: buyerForm.momoNetwork
      });

      setVideos((prev) =>
        prev.map((v) =>
          v.id === purchaseTargetVideo.id
            ? { ...v, purchasesCount: (v.purchasesCount || 0) + 1 }
            : v
        )
      );

      setIsProcessingPayment(false);
      setPaymentStep(0);
      const unlockedVid = purchaseTargetVideo;
      setPurchaseTargetVideo(null);

      // Immediately open/continue the Full Video Player with 30s lock removed!
      setActivePlayerVideo(unlockedVid);
      setIsPreviewLockedAt30s(false);
      setIsPlaying(true);
      if (videoElementRef.current) {
        videoElementRef.current.play();
      }

      if (showToast) {
        showToast('success', `Full video (${unlockedVid.fullDurationLabel}) unlocked for GH₵ ${effectivePayAmount}!`);
      }
      if (onVideoPurchased) {
        onVideoPurchased(purchaseRecord);
      }
    }, 1900);
  };

  // Handle Full Video File Upload (Site automatically provides 30-second free preview)
  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCheckingVideo(true);
    setPostErrors((prev) => ({ ...prev, videoFile: undefined }));

    const objectUrl = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';

    tempVideo.onloadedmetadata = () => {
      const durationSec = Math.max(45, Math.round(tempVideo.duration || 1200));
      const durationMins = Math.max(1, Math.round(durationSec / 60));
      setIsCheckingVideo(false);

      setPostForm((prev) => ({
        ...prev,
        videoDataUrl: objectUrl,
        videoFileName: file.name,
        detectedFullDurationSeconds: durationSec,
        fullDurationMinutes: durationMins
      }));
    };

    tempVideo.onerror = () => {
      setIsCheckingVideo(false);
      setPostForm((prev) => ({
        ...prev,
        videoDataUrl: objectUrl,
        videoFileName: file.name
      }));
    };

    tempVideo.src = objectUrl;
  };

  // Handle Posting a New Video (30s Free Preview on Site + Full Video Unlocked After Payment)
  const handlePostNewVideo = (e) => {
    e.preventDefault();
    const errs = {};

    if (!postForm.title.trim()) errs.title = 'Please enter a title for the video.';
    if (!postForm.creatorName.trim()) errs.creatorName = 'Please enter the creator/instructor name.';
    if (!postForm.description.trim()) errs.description = 'Add a short description of what the full video covers.';

    const parsedMinPrice = Number(postForm.minPrice);
    if (!parsedMinPrice || parsedMinPrice < MINIMUM_VIDEO_PRICE_GHS) {
      errs.minPrice = `Minimum price must be at least GH₵ ${MINIMUM_VIDEO_PRICE_GHS}. Buyers can choose to pay more.`;
    }

    setPostErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const fullMins = Math.max(1, Number(postForm.fullDurationMinutes) || 20);
    const fullSecs = postForm.videoFileName
      ? postForm.detectedFullDurationSeconds
      : fullMins * 60;

    const newVideo = {
      id: `vid-full-${Date.now()}`,
      title: postForm.title.trim(),
      creatorName: postForm.creatorName.trim(),
      creatorRole: postForm.creatorRole || 'Founder & Lead Yoga Specialist',
      category: postForm.category,
      previewSeconds: FREE_PREVIEW_DURATION_SECS,
      fullDurationSeconds: fullSecs,
      fullDurationLabel: `${fullMins} mins`,
      minPrice: Math.max(MINIMUM_VIDEO_PRICE_GHS, parsedMinPrice),
      thumbnail: postForm.coverPreview || flexibilityImg,
      videoUrl: postForm.videoDataUrl || '',
      description: postForm.description.trim(),
      cues: [
        '0:00 - 0:30 (Free Site Preview) • Breath centering, posture setup & initial stretch preview',
        `0:30 - ${Math.round(fullMins / 2)}:00 (Full Video) • Complete guided mobility sequence & deep fascia release`,
        `${Math.round(fullMins / 2)}:00 - ${fullMins}:00 (Full Video) • Peak flexibility holds, spinal integration & Savasana`
      ],
      purchasesCount: 0
    };

    setVideos((prev) => [newVideo, ...prev]);

    // Persist new video post to PostgreSQL
    api.createVideo({
      title: newVideo.title,
      creatorName: newVideo.creatorName,
      fullDurationMinutes: fullMins,
      minPrice: newVideo.minPrice,
      category: newVideo.category,
      description: newVideo.description
    });
    setIsPostModalOpen(false);
    setPostForm({
      title: '',
      creatorName: 'Lorie',
      creatorRole: 'Founder & Lead Yoga Specialist',
      category: 'Spine & Posture',
      fullDurationMinutes: 20,
      minPrice: 30,
      description: '',
      videoDataUrl: '',
      videoFileName: '',
      detectedFullDurationSeconds: 1200,
      coverPreview: flexibilityImg
    });

    if (showToast) {
      showToast(
        'success',
        `Posted "${newVideo.title}"! Visitors get a 30s preview on the site and unlock the full ${newVideo.fullDurationLabel} video from GH₵ ${newVideo.minPrice}+.`
      );
    }
  };

  const filteredVideos = videos.filter((v) => {
    if (categoryFilter === 'ALL') return true;
    return v.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  return (
    <section
      id="short-videos-vault"
      className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-gradient-to-br from-[#1E261D] via-[#263124] to-[#1A2119] py-8 sm:py-12 lg:py-14 px-4 sm:px-8 lg:px-12 xl:px-16 text-white border-y border-[#C8A253]/35 shadow-xl overflow-hidden"
    >
      {/* Subtle Gold Ambient Glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#C8A253]/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-[#7A8B71]/20 blur-3xl" />

      {/* SECTION HEADER */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/15">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#F7F4EF]">
          Guided Stretch & Yoga Videos
        </h2>

        {/* POST VIDEO BUTTON ONLY RENDERED FOR ADMIN */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsPostModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C8A253] to-[#B68F40] hover:from-[#d4af61] hover:to-[#C8A253] text-[#1C231A] px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02] cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Post Video</span>
          </button>
        )}
      </div>

      {/* CATEGORY FILTER PILLS */}
      <div className="relative z-10 mt-5 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {['ALL', 'Spine & Posture', 'Hip Mobility', 'Desk & Shoulders', 'Breath & Calm'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              categoryFilter === cat
                ? 'bg-[#FAF8F5] text-[#232D21] shadow-sm font-bold'
                : 'bg-white/10 text-[#E6E1D8]/80 hover:bg-white/20 hover:text-white'
            }`}
          >
            {cat === 'ALL' ? 'All' : cat}
          </button>
        ))}
      </div>

      {/* VIDEO MARKETPLACE GRID */}
      <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredVideos.map((video) => {
          const unlockedRecord = unlockedMap[video.id];
          const isUnlocked = Boolean(unlockedRecord);
          const minPrice = Math.max(MINIMUM_VIDEO_PRICE_GHS, Number(video.minPrice) || MINIMUM_VIDEO_PRICE_GHS);

          return (
            <div
              key={video.id}
              className="group relative h-[390px] sm:h-[420px] rounded-3xl overflow-hidden border border-white/15 hover:border-[#C8A253]/60 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between p-4 sm:p-5 text-white"
            >
              {/* VIDEO POSTER IMAGE COVERING THE ENTIRE CARD */}
              <img
                src={video.thumbnail}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* CLEAN CINEMATIC GRADIENT */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/30 pointer-events-none" />

              {/* TOP HEADER: DURATION & CATEGORY */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[11px] font-mono font-medium text-white shadow-xs">
                  <Clock className="h-3 w-3 text-[#C8A253]" />
                  {video.fullDurationLabel}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[10px] font-medium text-[#F7E7C4]">
                    {video.category}
                  </span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${video.title}"?`)) {
                          setVideos((prev) => prev.filter((v) => v.id !== video.id));
                          if (showToast) showToast('info', 'Video removed by admin.');
                        }
                      }}
                      className="rounded-full bg-red-900/80 hover:bg-red-700 text-white p-1 text-[10px] transition-colors cursor-pointer"
                      title="Delete video (Admin)"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* CENTER PLAY BUTTON */}
              <div className="relative z-10 my-auto flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleOpenVideoPlayer(video)}
                  className="flex items-center justify-center cursor-pointer group/play focus:outline-hidden"
                  title={isUnlocked ? `Watch Full Video (${video.fullDurationLabel})` : 'Watch 30s Preview'}
                >
                  <div
                    className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full shadow-2xl transition-all duration-300 group-hover/play:scale-110 ${
                      isUnlocked
                        ? 'bg-[#7A8B71] text-white ring-4 ring-white/30 hover:bg-[#687860]'
                        : 'bg-gradient-to-tr from-[#C8A253] to-[#F7E7C4] text-[#1C231A] ring-4 ring-black/40 hover:brightness-110'
                    }`}
                  >
                    <Play className="h-6 w-6 sm:h-7 sm:w-7 fill-current ml-0.5" />
                  </div>
                </button>
              </div>

              {/* BOTTOM CARD: CREATOR, TITLE, PRICE & ACTION */}
              <div className="relative z-10 space-y-2">
                <div>
                  <span className="text-[11px] text-[#E6E1D8]/80 font-medium">By {video.creatorName}</span>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#FAF8F5] line-clamp-2 leading-snug drop-shadow-xs group-hover:text-[#F7E7C4] transition-colors">
                    {video.title}
                  </h3>
                </div>

                <div className="pt-2 border-t border-white/15 flex items-center justify-between gap-2">
                  <span className="font-serif text-base sm:text-lg font-bold text-[#F7E7C4]">
                    GH₵ {minPrice}
                  </span>

                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => handleOpenVideoPlayer(video)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#7A8B71] hover:bg-[#687860] text-white px-3.5 py-1.5 text-xs font-bold shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Watch</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenPurchaseModal(video)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#A44A4A] to-[#8C3E3E] hover:from-[#b55252] hover:to-[#A44A4A] text-white px-3.5 py-1.5 text-xs font-bold shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                    >
                      <Unlock className="h-3.5 w-3.5" />
                      <span>Unlock</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: PURCHASE FULL VIDEO (MIN GH₵ 30, PAY WHAT YOU WANT) */}
      {/* ===================================================================== */}
      {purchaseTargetVideo && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setPurchaseTargetVideo(null);
          }}
          className="fixed inset-0 z-50 overflow-hidden bg-[#181B1C]/80 backdrop-blur-md p-2.5 sm:p-5 flex items-center justify-center"
        >
          <div className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[88vh] rounded-2xl sm:rounded-3xl bg-[#FAF8F5] text-[#2B2E31] border border-[#E6E1D8] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1E261D] via-[#2A3728] to-[#1C231A] p-3.5 sm:p-5 text-white border-b border-[#C8A253]/35 flex items-start justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <img
                  src={purchaseTargetVideo.thumbnail}
                  alt={purchaseTargetVideo.title}
                  className="h-11 w-11 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl object-cover border border-[#C8A253]/50 shrink-0"
                />
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#C8A253]/25 border border-[#C8A253]/50 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#F7E7C4]">
                    Unlock Full Video ({purchaseTargetVideo.fullDurationLabel})
                  </span>
                  <h3 className="font-serif text-sm sm:text-base lg:text-lg font-bold text-[#F7F4EF] mt-0.5 leading-snug line-clamp-1">
                    {purchaseTargetVideo.title}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#E6E1D8]/80 truncate">
                    By {purchaseTargetVideo.creatorName} • Full HD Session & Download Access
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPurchaseTargetVideo(null)}
                className="rounded-full bg-white/10 hover:bg-white/20 p-1.5 text-white/80 hover:text-white cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-4 flex-1 overflow-y-auto overscroll-contain">
              {/* PAY WHAT YOU WANT (MINIMUM GH₵ 30) */}
              <div className="rounded-xl sm:rounded-2xl bg-white border border-[#E6E1D8] p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#232D21] flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-[#A44A4A] shrink-0" />
                    <span>Choose Your Price (Min GH₵ {MINIMUM_VIDEO_PRICE_GHS})</span>
                  </label>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#7A8B71] shrink-0">
                    Pay more to support
                  </span>
                </div>

                {/* Quick Price Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {QUICK_PRICE_TIERS.map((tier) => {
                    const isSelected = !isCustomPay && payAmount === tier.amount;
                    return (
                      <button
                        key={tier.amount}
                        type="button"
                        onClick={() => {
                          setPayAmount(tier.amount);
                          setCustomPayInput(String(tier.amount));
                          setIsCustomPay(false);
                          setPurchaseErrors((prev) => ({ ...prev, amount: undefined }));
                        }}
                        className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#232D21] text-[#F7E7C4] border-[#C8A253] shadow-sm'
                            : 'bg-[#FAF8F5] text-[#2B2E31] border-[#E6E1D8] hover:border-[#7A8B71]'
                        }`}
                      >
                        <span className="font-serif text-sm sm:text-base font-bold block">
                          GH₵ {tier.amount}
                        </span>
                        <span className={`text-[9px] sm:text-[10px] block ${isSelected ? 'text-[#C8A253]' : 'text-[#5C6260]'}`}>
                          {tier.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount Input (>= 30 Cedis) */}
                <div className="pt-0.5">
                  <label className="block text-[10px] sm:text-[11px] font-semibold text-[#5C6260] mb-1">
                    Or enter any custom amount you wish to pay (Minimum GH₵ {MINIMUM_VIDEO_PRICE_GHS}):
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-[#232D21]">
                      GH₵
                    </span>
                    <input
                      type="number"
                      min={MINIMUM_VIDEO_PRICE_GHS}
                      step="5"
                      value={isCustomPay ? customPayInput : payAmount}
                      onFocus={() => setIsCustomPay(true)}
                      onChange={(e) => {
                        setIsCustomPay(true);
                        setCustomPayInput(e.target.value);
                        setPurchaseErrors((prev) => ({ ...prev, amount: undefined }));
                      }}
                      placeholder="30 or more (e.g. 50)"
                      className={`flex-1 rounded-xl border px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold outline-none transition-colors ${
                        purchaseErrors.amount ? 'border-[#A44A4A] bg-[#FFF5F5]' : 'border-[#E6E1D8] focus:border-[#7A8B71]'
                      }`}
                    />
                  </div>

                  {purchaseErrors.amount && (
                    <p className="text-[10px] sm:text-[11px] font-semibold text-[#A44A4A] mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                      <span>{purchaseErrors.amount}</span>
                    </p>
                  )}

                  {effectivePayAmount > MINIMUM_VIDEO_PRICE_GHS && (
                    <p className="text-[10px] sm:text-[11px] font-semibold text-[#5A6952] mt-1 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#C8A253]" />
                      <span>
                        Includes +GH₵ {effectivePayAmount - MINIMUM_VIDEO_PRICE_GHS} extra appreciation for {purchaseTargetVideo.creatorName}!
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* BUYER DETAILS & MOMO CHECKOUT */}
              <div className="rounded-xl sm:rounded-2xl bg-white border border-[#E6E1D8] p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#5C6260] flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-[#7A8B71]" />
                    Paystack Payment to Unlock Full Video
                  </span>
                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#5A6952]">
                    <PaystackIcon className="h-3 w-3" />
                    <span>Paystack Ghana</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-[#2B2E31] mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={buyerForm.fullName}
                      onChange={(e) => setBuyerForm({ ...buyerForm, fullName: e.target.value })}
                      placeholder="e.g. Efua Darko"
                      className="w-full rounded-xl border border-[#E6E1D8] px-3 py-1.5 sm:py-2 text-xs outline-none focus:border-[#7A8B71]"
                    />
                    {purchaseErrors.fullName && (
                      <p className="text-[10px] text-[#A44A4A] mt-0.5">{purchaseErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-[#2B2E31] mb-1">
                      WhatsApp / MoMo Phone *
                    </label>
                    <input
                      type="tel"
                      value={buyerForm.phone}
                      onChange={(e) =>
                        setBuyerForm({
                          ...buyerForm,
                          phone: e.target.value,
                          momoNumber: buyerForm.momoNumber || e.target.value
                        })
                      }
                      placeholder="024 123 4567"
                      className="w-full rounded-xl border border-[#E6E1D8] px-3 py-1.5 sm:py-2 text-xs outline-none focus:border-[#7A8B71]"
                    />
                    {purchaseErrors.phone && (
                      <p className="text-[10px] text-[#A44A4A] mt-0.5">{purchaseErrors.phone}</p>
                    )}
                  </div>
                </div>

                {/* MoMo Networks */}
                <div className="grid grid-cols-3 gap-2 pt-0.5">
                  {[
                    { id: 'MTN', name: 'MTN MoMo' },
                    { id: 'Telecel', name: 'Telecel Cash' },
                    { id: 'AirtelTigo', name: 'AT Money' }
                  ].map((net) => (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => setBuyerForm({ ...buyerForm, momoNetwork: net.id })}
                      className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer ${
                        buyerForm.momoNetwork === net.id
                          ? 'bg-[#FAF8F5] border-[#7A8B71] ring-1 ring-[#7A8B71]'
                          : 'border-[#E6E1D8] bg-white'
                      }`}
                    >
                      <div className="h-5 sm:h-6 flex items-center justify-center mb-0.5 sm:mb-1">
                        <MobileMoneyLogo network={net.id} variant="image" size="sm" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-semibold text-[#2B2E31] leading-tight">{net.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#FAF8F5] border-t border-[#E6E1D8] p-3 sm:p-4 flex items-center justify-between gap-2.5 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setPurchaseTargetVideo(null)}
                disabled={isProcessingPayment}
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-[#E6E1D8] text-xs font-semibold text-[#5C6260] hover:bg-white cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCompletePurchase}
                disabled={isProcessingPayment}
                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-[#A44A4A] hover:bg-[#8C3E3E] text-white py-2 sm:py-2.5 px-3 sm:px-5 text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-75"
              >
                {isProcessingPayment ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>
                      {paymentStep === 1 && 'Connecting Paystack...'}
                      {paymentStep === 2 && `Authorizing GH₵ ${effectivePayAmount}...`}
                      {paymentStep === 3 && `Unlocking Full ${purchaseTargetVideo.fullDurationLabel} Video...`}
                    </span>
                  </>
                ) : (
                  <>
                    <Unlock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>Pay GH₵ {effectivePayAmount || MINIMUM_VIDEO_PRICE_GHS} • Get Full Video</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: POST A FULL VIDEO (SITE AUTO-SHOWS 30s PREVIEW) */}
      {/* ===================================================================== */}
      {isPostModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPostModalOpen(false);
          }}
          className="fixed inset-0 z-50 overflow-hidden bg-[#181B1C]/80 backdrop-blur-md p-2.5 sm:p-5 flex items-center justify-center"
        >
          <div className="relative w-full max-w-xl max-h-[92dvh] sm:max-h-[88vh] rounded-2xl sm:rounded-3xl bg-[#FAF8F5] text-[#2B2E31] border border-[#E6E1D8] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1E261D] via-[#2A3728] to-[#1C231A] p-3.5 sm:p-5 text-white border-b border-[#C8A253]/35 flex items-start justify-between gap-3 shrink-0">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C8A253]/20 border border-[#C8A253]/50 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#F7E7C4]">
                  <Video className="h-3 w-3 text-[#C8A253]" />
                  30s Free Preview on Site • Full Video After Payment
                </span>
                <h3 className="font-serif text-base sm:text-xl font-bold text-[#F7F4EF] mt-1">
                  Post a Full Guided Stretch Video
                </h3>
                <p className="text-[11px] sm:text-xs text-[#E6E1D8]/80 mt-0.5">
                  Visitors watch the first 30 seconds free on the site, and unlock the full video after paying (Min GH₵ 30).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPostModalOpen(false)}
                className="rounded-full bg-white/10 hover:bg-white/20 p-1.5 text-white/80 hover:text-white cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handlePostNewVideo} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-4 flex-1 overflow-y-auto overscroll-contain">
              {/* UPLOAD FULL VIDEO FILE */}
              <div className="rounded-2xl border-2 border-dashed border-[#C8A253]/60 bg-white p-4 text-center space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FAF6EE] text-[#C8A253]">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="text-xs font-bold text-[#2B2E31]">
                  {postForm.videoFileName
                    ? `Uploaded: ${postForm.videoFileName} (Full Length: ${postForm.fullDurationMinutes} mins)`
                    : 'Upload Full-Length Video File (MP4, MOV, WebM)'}
                </div>
                <p className="text-[11px] text-[#5C6260]">
                  The site automatically plays a <strong>30-second preview (0:00 – 0:30s)</strong> and locks the full video until payment.
                </p>

                <label className="inline-flex items-center gap-1.5 rounded-xl bg-[#232D21] hover:bg-[#2F3C2C] text-[#F7E7C4] px-4 py-2 text-xs font-semibold cursor-pointer transition-colors">
                  <Film className="h-3.5 w-3.5 text-[#C8A253]" />
                  <span>{isCheckingVideo ? 'Reading Video...' : 'Select Full Video File'}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    onChange={handleVideoFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* VIDEO TITLE, DURATION & PRICING (MIN 30 CEDIS) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                    Full Video Title *
                  </label>
                  <input
                    type="text"
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    placeholder="e.g. Full 25-Min Deep Hip & Lower Back Release Flow"
                    className="w-full rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#7A8B71]"
                  />
                  {postErrors.title && (
                    <p className="text-[11px] text-[#A44A4A] mt-0.5">{postErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                    Instructor / Creator Name *
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-[#7A8B71]" />
                    <input
                      type="text"
                      value={postForm.creatorName}
                      onChange={(e) => setPostForm({ ...postForm, creatorName: e.target.value })}
                      placeholder="e.g. Lorie"
                      className="w-full rounded-xl border border-[#E6E1D8] bg-white pl-8 pr-3 py-2 text-xs outline-none focus:border-[#7A8B71]"
                    />
                  </div>
                  {postErrors.creatorName && (
                    <p className="text-[11px] text-[#A44A4A] mt-0.5">{postErrors.creatorName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                    Minimum Unlock Price (GH₵ — Min 30) *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-xl bg-white border border-[#E6E1D8] px-2.5 py-2 text-xs font-bold text-[#232D21]">
                      GH₵
                    </span>
                    <input
                      type="number"
                      min={MINIMUM_VIDEO_PRICE_GHS}
                      step="5"
                      value={postForm.minPrice}
                      onChange={(e) => setPostForm({ ...postForm, minPrice: e.target.value })}
                      className="w-full rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#7A8B71]"
                    />
                  </div>
                  <span className="text-[10px] text-[#7A8B71] block mt-0.5">
                    Min GH₵ 30 • Buyers can choose to pay more
                  </span>
                  {postErrors.minPrice && (
                    <p className="text-[11px] text-[#A44A4A] mt-0.5">{postErrors.minPrice}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                    Full Video Length (Minutes)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="180"
                    value={postForm.fullDurationMinutes}
                    onChange={(e) => setPostForm({ ...postForm, fullDurationMinutes: e.target.value })}
                    className="w-full rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-[#7A8B71]"
                  />
                  <span className="text-[10px] text-[#5C6260] block mt-0.5">
                    First 30 secs shown free on site
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                    Stretch Focus Category
                  </label>
                  <select
                    value={postForm.category}
                    onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                    className="w-full rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs outline-none focus:border-[#7A8B71]"
                  >
                    <option value="Spine & Posture">Spine & Posture</option>
                    <option value="Hip Mobility">Hip Mobility</option>
                    <option value="Desk & Shoulders">Desk & Shoulders</option>
                    <option value="Breath & Calm">Breath & Calm</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                    Cover Thumbnail Style
                  </label>
                  <div className="flex items-center gap-2">
                    {[flexibilityImg, thaiStretchImg, privateYogaImg, couplesYogaImg].map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPostForm({ ...postForm, coverPreview: img })}
                        className={`h-10 w-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          postForm.coverPreview === img ? 'border-[#A44A4A] scale-105' : 'border-transparent opacity-70'
                        }`}
                      >
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                    What does the full video include? *
                  </label>
                  <textarea
                    rows={2}
                    value={postForm.description}
                    onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                    placeholder="Describe the full session benefits that unlock after the 30-second preview..."
                    className="w-full rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs outline-none focus:border-[#7A8B71]"
                  />
                  {postErrors.description && (
                    <p className="text-[11px] text-[#A44A4A] mt-0.5">{postErrors.description}</p>
                  )}
                </div>
              </div>

              </div>

              {/* Pinned Footer */}
              <div className="bg-[#FAF8F5] border-t border-[#E6E1D8] p-3 sm:p-4 flex items-center justify-end gap-2.5 sm:gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-[#E6E1D8] text-xs font-semibold text-[#5C6260] hover:bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[#232D21] hover:bg-[#2F3C2C] text-[#F7E7C4] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-[#C8A253]" />
                  <span>Publish (30s Preview + Full Unlock Min GH₵ {Math.max(30, Number(postForm.minPrice) || 30)})</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: VIDEO PLAYER (30-SEC FREE PREVIEW -> PAYWALL OR FULL VIDEO) */}
      {/* ===================================================================== */}
      {activePlayerVideo && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsPlaying(false);
              setActivePlayerVideo(null);
            }
          }}
          className="fixed inset-0 z-50 overflow-hidden bg-[#121712]/90 backdrop-blur-md p-2.5 sm:p-5 flex items-center justify-center"
        >
          <div className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[88vh] rounded-2xl sm:rounded-3xl bg-[#1C231A] text-white border border-[#C8A253]/40 shadow-2xl flex flex-col overflow-hidden">
            {/* Minimalist Top Bar */}
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
                    isActiveVideoUnlocked
                      ? 'bg-[#7A8B71] text-white'
                      : 'bg-[#C8A253] text-[#1C231A]'
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  {isActiveVideoUnlocked ? 'Full Video' : '30s Preview'}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#F7E7C4] truncate">
                  {activePlayerVideo.title}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setActivePlayerVideo(null);
                }}
                className="rounded-full bg-white/10 hover:bg-white/20 p-1.5 text-white/80 hover:text-white cursor-pointer shrink-0 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* VIDEO STAGE (CLEAN & UNOBSTRUCTED) */}
            <div className="relative h-72 sm:h-80 w-full bg-black overflow-hidden flex items-center justify-center">
              {activePlayerVideo.videoUrl ? (
                <video
                  ref={videoElementRef}
                  src={activePlayerVideo.videoUrl}
                  poster={activePlayerVideo.thumbnail}
                  autoPlay
                  muted={isMuted}
                  playsInline
                  onTimeUpdate={(e) => {
                    const cur = Math.floor(e.currentTarget.currentTime);
                    if (!isActiveVideoUnlocked && e.currentTarget.currentTime >= FREE_PREVIEW_DURATION_SECS) {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = FREE_PREVIEW_DURATION_SECS;
                      setElapsedSeconds(FREE_PREVIEW_DURATION_SECS);
                      setIsPlaying(false);
                      setIsPreviewLockedAt30s(true);
                    } else {
                      setElapsedSeconds(cur);
                    }
                  }}
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={activePlayerVideo.thumbnail}
                  alt={activePlayerVideo.title}
                  className={`h-full w-full object-cover transition-transform duration-1000 ${
                    isPlaying ? 'scale-105 brightness-95' : 'scale-100 brightness-85'
                  }`}
                />
              )}

              {/* Minimal Dark Overlay for Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              {/* Clean Corner Timer Pill (Only while playing / active) */}
              {(!isPreviewLockedAt30s || isActiveVideoUnlocked) && (
                <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-mono font-medium text-[#F7E7C4] shadow-sm">
                  <Clock className="h-3 w-3 text-[#C8A253]" />
                  <span>
                    {isActiveVideoUnlocked
                      ? `${formatTimeMMSS(elapsedSeconds)} / ${activePlayerVideo.fullDurationLabel}`
                      : `0:${String(elapsedSeconds).padStart(2, '0')} / 0:30`}
                  </span>
                </div>
              )}

              {/* PAYWALL LOCK OVERLAY (CLEAN & CONCISE WHEN 30s ENDS) */}
              {!isActiveVideoUnlocked && isPreviewLockedAt30s && (
                <div className="absolute inset-0 z-20 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3 animate-in fade-in duration-200">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#A44A4A] text-white shadow-xl ring-4 ring-[#A44A4A]/25">
                    <Lock className="h-5 w-5" />
                  </div>

                  <div className="space-y-1 max-w-xs">
                    <h4 className="font-serif text-lg font-bold text-[#F7F4EF]">
                      Preview Ended
                    </h4>
                    <p className="text-xs text-[#E6E1D8]/80 leading-relaxed">
                      Unlock the complete {activePlayerVideo.fullDurationLabel} class from GH₵ {Math.max(MINIMUM_VIDEO_PRICE_GHS, activePlayerVideo.minPrice || 30)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const vid = activePlayerVideo;
                        setActivePlayerVideo(null);
                        handleOpenPurchaseModal(vid);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#A44A4A] to-[#8C3E3E] hover:from-[#b55252] hover:to-[#A44A4A] text-white px-4 py-2 text-xs font-bold shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                    >
                      <Unlock className="h-3.5 w-3.5" />
                      <span>Unlock Full Video</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setElapsedSeconds(0);
                        setIsPreviewLockedAt30s(false);
                        setIsPlaying(true);
                        if (videoElementRef.current) {
                          videoElementRef.current.currentTime = 0;
                          videoElementRef.current.play();
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-xl bg-white/15 hover:bg-white/25 text-white px-3 py-2 text-xs font-semibold cursor-pointer transition-colors"
                      title="Replay 30s Preview"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Replay</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Progress Bar at bottom of video stage */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div
                  className="h-full bg-gradient-to-r from-[#7A8B71] to-[#C8A253] transition-all duration-300"
                  style={{ width: `${Math.min(100, (elapsedSeconds / maxAllowedSeconds) * 100)}%` }}
                />
              </div>
            </div>

            {/* MINIMALIST CONTROLS BAR */}
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!isActiveVideoUnlocked && elapsedSeconds >= FREE_PREVIEW_DURATION_SECS) {
                      setElapsedSeconds(0);
                      setIsPreviewLockedAt30s(false);
                      setIsPlaying(true);
                      if (videoElementRef.current) {
                        videoElementRef.current.currentTime = 0;
                        videoElementRef.current.play();
                      }
                    } else {
                      const next = !isPlaying;
                      setIsPlaying(next);
                      if (videoElementRef.current) {
                        if (next) videoElementRef.current.play();
                        else videoElementRef.current.pause();
                      }
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8A253] hover:bg-[#d4af61] text-[#1C231A] px-3.5 py-2 text-xs font-bold transition-all cursor-pointer"
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMuted((m) => !m)}
                  className="rounded-xl bg-white/10 hover:bg-white/20 p-2 text-white/90 hover:text-white cursor-pointer transition-colors"
                  title="Toggle audio"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>

                <span className="text-xs font-mono text-[#E6E1D8]/80 hidden sm:inline">
                  {isActiveVideoUnlocked
                    ? `${formatTimeMMSS(elapsedSeconds)} / ${activePlayerVideo.fullDurationLabel}`
                    : `0:${String(elapsedSeconds).padStart(2, '0')} / 0:30`}
                </span>
              </div>

              {isActiveVideoUnlocked ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activePlayerVideo.videoUrl) {
                      const a = document.createElement('a');
                      a.href = activePlayerVideo.videoUrl;
                      a.download = `${activePlayerVideo.title.replace(/\s+/g, '_')}_Full_Video.mp4`;
                      a.click();
                    } else if (showToast) {
                      showToast('success', `Full HD video download started!`);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#7A8B71] hover:bg-[#687860] text-white px-3.5 py-2 text-xs font-bold cursor-pointer transition-all shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const vid = activePlayerVideo;
                    setActivePlayerVideo(null);
                    handleOpenPurchaseModal(vid);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#A44A4A] to-[#8C3E3E] hover:from-[#b55252] hover:to-[#A44A4A] text-white px-3.5 py-2 text-xs font-bold cursor-pointer transition-all shadow-sm"
                >
                  <Unlock className="h-3.5 w-3.5" />
                  <span>Unlock Full • GH₵ {Math.max(30, activePlayerVideo.minPrice || 30)}+</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
