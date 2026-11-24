import { useState, useRef } from 'react';
import { X, Plus, Image as ImageIcon, Upload, Link as LinkIcon, Check, AlertCircle, Loader2 } from 'lucide-react';
import { INSTRUCTORS_LIST, DEFAULT_INSTRUCTOR_AVATAR } from '../data/mockData';
import { api } from '../services/api';

export const STUDIO_IMAGE_PRESETS = [
  {
    id: 'mass',
    name: 'Group Sanctuary Flow',
    url: '/images/mass_yoga_class.jpg',
    category: 'Yoga Classes'
  },
  {
    id: 'champagne',
    name: 'Yoga & Champagne',
    url: '/images/yoga_champagne.jpg',
    category: 'Special Experiences'
  },
  {
    id: 'couples',
    name: 'Couples & Partner Yoga',
    url: '/images/couples_yoga.jpg',
    category: 'Special Experiences'
  },
  {
    id: 'private',
    name: 'Private 1-on-1 Session',
    url: '/images/private_yoga_class.jpg',
    category: 'Private Bookings'
  },
  {
    id: 'masterclass',
    name: 'Flexibility Masterclass',
    url: '/images/flexibility_masterclass.jpg',
    category: 'Masterclass'
  },
  {
    id: 'thai',
    name: 'Thai Somatic Stretches',
    url: '/images/thai_yoga_stretches.jpg',
    category: 'Therapeutic'
  },
  {
    id: 'flow_club',
    name: 'Flow Club Editorial',
    url: '/images/flow_club_pose.jpg',
    category: 'Yoga Classes'
  }
];

export const CATEGORY_DEFAULT_IMAGES = {
  'Yoga Classes': '/images/mass_yoga_class.jpg',
  'Private Bookings': '/images/private_yoga_class.jpg',
  'Masterclass': '/images/flexibility_masterclass.jpg',
  'Therapeutic': '/images/thai_yoga_stretches.jpg',
  'Special Experiences': '/images/yoga_champagne.jpg'
};

export default function AddClassModal({ isOpen, onClose, onAddClass }) {
  const [formData, setFormData] = useState({
    title: '',
    instructorName: INSTRUCTORS_LIST[0].name,
    date: 'Monday, Nov 23, 2026',
    time: '08:00 AM - 09:00 AM',
    duration: '60 min',
    price: 160,
    maxCapacity: 12,
    room: 'Studio Sanctuary',
    category: 'Yoga Classes',
    style: 'Vinyasa Flow',
    level: 'All Levels Welcome',
    description: '',
    intensity: 'Moderate',
    image: '/images/mass_yoga_class.jpg',
    imagePosition: 'object-center'
  });

  const [imageMode, setImageMode] = useState('preset'); // 'preset' | 'upload' | 'url'
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Auto-suggest category photo if current image is a preset default
      if (name === 'category' && imageMode === 'preset') {
        const defaultImg = CATEGORY_DEFAULT_IMAGES[value];
        if (defaultImg) next.image = defaultImg;
      }
      return next;
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Please select a valid image (JPEG, PNG, WebP).' }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image size must be under 10MB.' }));
      return;
    }

    setIsUploading(true);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.image;
      return copy;
    });

    try {
      const uploadedUrl = await api.uploadClassImage(file);
      setFormData((prev) => ({ ...prev, image: uploadedUrl }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, image: err.message || 'Image upload failed.' }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyCustomUrl = () => {
    const trimmed = customUrlInput.trim();
    if (!trimmed) {
      setErrors((prev) => ({ ...prev, image: 'Please enter a valid image URL' }));
      return;
    }
    setFormData((prev) => ({ ...prev, image: trimmed }));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.image;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.date.trim()) errs.date = 'Date text is required';
    if (!formData.time.trim()) errs.time = 'Time text is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (formData.price <= 0) errs.price = 'Price must be greater than 0';
    if (formData.maxCapacity <= 0) errs.maxCapacity = 'Capacity must be at least 1';
    if (!formData.image) errs.image = 'Class image is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const selectedInstructor = INSTRUCTORS_LIST.find(
        (inst) => inst.name === formData.instructorName
      ) || {
        name: formData.instructorName,
        role: 'Certified Yoga Instructor'
      };

      await onAddClass({
        title: formData.title.trim(),
        instructor: {
          name: selectedInstructor.name,
          role: selectedInstructor.role,
          avatar: DEFAULT_INSTRUCTOR_AVATAR
        },
        date: formData.date.trim(),
        time: formData.time.trim(),
        duration: formData.duration.trim(),
        price: Number(formData.price),
        maxCapacity: Number(formData.maxCapacity),
        room: formData.room,
        category: formData.category,
        level: formData.level,
        intensity: formData.intensity,
        description: formData.description.trim(),
        isPassEligible: formData.category === 'Yoga Classes',
        image: formData.image,
        imagePosition: formData.imagePosition || 'object-center',
        tags: [formData.category, formData.style || 'Vinyasa Flow', formData.level, formData.intensity]
      });

      onClose();
    } catch (err) {
      setErrors({ form: err.message || 'Failed to save class to database. Please check your admin login.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2B2E31]/75 backdrop-blur-sm p-3.5 sm:p-6 overscroll-contain animate-in fade-in duration-200">
      <div className="flex min-h-full items-center justify-center py-4 sm:py-6">
        <div className="relative w-full max-w-2xl rounded-3xl bg-[#FAF8F5] p-5 sm:p-8 shadow-2xl border border-[#E6E1D8] my-auto">
        
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E6E1D8]">
            <div>
              <span className="text-xs font-semibold text-[#7A8B71] uppercase tracking-wider">
                Instructor Studio Manager
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#2B2E31]">
                Create New Yoga Class
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full p-2 text-[#5C6260] hover:bg-[#EAE4DC] hover:text-[#2B2E31] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Error Banner */}
          {errors.form && (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 font-medium">{errors.form}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            
            {/* Class Title */}
            <div>
              <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                Class Title *
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Candlelight Sound Healing & Yin"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2.5 text-sm text-[#2B2E31] outline-none focus:border-[#7A8B71] focus:ring-2 focus:ring-[#7A8B71]/20"
              />
              {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
            </div>

            {/* CLASS EXPERIENCE IMAGE SELECTOR & UPLOADER */}
            <div className="rounded-2xl border border-[#E6E1D8] bg-white/70 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-[#2B2E31] flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-[#7A8B71]" />
                    Class Experience Image *
                  </label>
                  <p className="text-[11px] text-[#5C6260]">
                    Select a studio photo preset, upload from your device, or paste an image URL.
                  </p>
                </div>

                {/* Mode Selector Pills */}
                <div className="inline-flex rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] p-0.5 text-[11px] font-medium">
                  <button
                    type="button"
                    onClick={() => setImageMode('preset')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      imageMode === 'preset'
                        ? 'bg-[#232D21] text-[#F7F4EF] font-semibold shadow-xs'
                        : 'text-[#5C6260] hover:text-[#2B2E31]'
                    }`}
                  >
                    Studio Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      imageMode === 'upload'
                        ? 'bg-[#232D21] text-[#F7F4EF] font-semibold shadow-xs'
                        : 'text-[#5C6260] hover:text-[#2B2E31]'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      imageMode === 'url'
                        ? 'bg-[#232D21] text-[#F7F4EF] font-semibold shadow-xs'
                        : 'text-[#5C6260] hover:text-[#2B2E31]'
                    }`}
                  >
                    Custom URL
                  </button>
                </div>
              </div>

              {/* Mode 1: Studio Gallery Presets */}
              {imageMode === 'preset' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                    {STUDIO_IMAGE_PRESETS.map((preset) => {
                      const isSelected = formData.image === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, image: preset.url }))}
                          className={`group relative text-left rounded-xl overflow-hidden border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#C8A253] ring-2 ring-[#C8A253]/35 shadow-sm'
                              : 'border-[#E6E1D8] hover:border-[#7A8B71]'
                          }`}
                        >
                          <div className="h-16 w-full bg-[#232D21]/10 overflow-hidden relative">
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-[#C8A253] text-[#232D21] flex items-center justify-center shadow-xs">
                                <Check className="h-3 w-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <div className="p-1.5 bg-white">
                            <p className="text-[10px] font-semibold text-[#2B2E31] truncate leading-tight">
                              {preset.name}
                            </p>
                            <span className="text-[9px] text-[#7A8B71]">
                              {preset.category}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mode 2: File Upload from Device */}
              {imageMode === 'upload' && (
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#E6E1D8] hover:border-[#7A8B71] rounded-2xl bg-[#FAF8F5] transition-colors cursor-pointer group"
                  >
                    {isUploading ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#7A8B71]">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Processing & uploading photo...</span>
                      </div>
                    ) : (
                      <>
                        <div className="h-9 w-9 rounded-full bg-white shadow-xs border border-[#E6E1D8] flex items-center justify-center text-[#7A8B71] group-hover:scale-110 transition-transform">
                          <Upload className="h-4 w-4" />
                        </div>
                        <p className="text-xs font-semibold text-[#2B2E31] mt-2">
                          Click to select a photo from your computer or phone
                        </p>
                        <p className="text-[10px] text-[#5C6260]">
                          Supports JPG, PNG, WebP up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Mode 3: Custom URL */}
              {imageMode === 'url' && (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5C6260]" />
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or /images/..."
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      className="w-full rounded-2xl border border-[#E6E1D8] bg-white pl-8 pr-3 py-2 text-xs text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="rounded-2xl bg-[#232D21] text-white px-3.5 py-2 text-xs font-semibold hover:bg-[#344031] transition-colors cursor-pointer shrink-0"
                  >
                    Apply URL
                  </button>
                </div>
              )}

              {/* Live Preview & Focal Point Controls */}
              {formData.image && (
                <div className="pt-2 border-t border-[#E6E1D8]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-24 rounded-xl overflow-hidden border border-[#E6E1D8] bg-[#232D21]/10 shrink-0 relative">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className={`h-full w-full object-cover ${formData.imagePosition || 'object-center'}`}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8B71]">
                        Active Card Cover
                      </span>
                      <p className="text-xs font-medium text-[#2B2E31] truncate max-w-[200px] sm:max-w-[260px]">
                        {formData.image}
                      </p>
                    </div>
                  </div>

                  {/* Focal point alignment */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <span className="text-[10px] font-medium text-[#5C6260]">Focus:</span>
                    {['object-top', 'object-center', 'object-bottom'].map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, imagePosition: pos }))}
                        className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                          formData.imagePosition === pos
                            ? 'bg-[#7A8B71] text-white font-bold'
                            : 'bg-[#FAF8F5] text-[#5C6260] hover:text-[#2B2E31] border border-[#E6E1D8]'
                        }`}
                      >
                        {pos.replace('object-', '')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {errors.image && <p className="text-xs text-rose-500">{errors.image}</p>}
            </div>

            {/* Instructor & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                  Instructor *
                </label>
                <select
                  name="instructorName"
                  value={formData.instructorName}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2.5 text-sm text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                >
                  {INSTRUCTORS_LIST.map((inst) => (
                    <option key={inst.name} value={inst.name}>
                      {inst.name} ({inst.role.split('&')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                  Studio Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2.5 text-sm text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                >
                  <option value="Yoga Classes">Yoga Classes (Group Flow)</option>
                  <option value="Private Bookings">Private Bookings (1-on-1 / Couples)</option>
                  <option value="Masterclass">Flexibility Masterclass</option>
                  <option value="Therapeutic">Therapeutic & Somatic Stretch</option>
                  <option value="Special Experiences">Special Experiences</option>
                </select>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                  Date Display *
                </label>
                <input
                  type="text"
                  name="date"
                  placeholder="e.g. Monday, Nov 23, 2026"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2.5 text-sm text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                />
                {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                  Time & Duration *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="time"
                    placeholder="08:00 AM - 09:00 AM"
                    value={formData.time}
                    onChange={handleChange}
                    className="rounded-2xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                  />
                  <input
                    type="text"
                    name="duration"
                    placeholder="60 min"
                    value={formData.duration}
                    onChange={handleChange}
                    className="rounded-2xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                  />
                </div>
                {errors.time && <p className="text-xs text-rose-500 mt-1">{errors.time}</p>}
              </div>
            </div>

            {/* Price, Capacity, Room */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                  Price (GH₵) *
                </label>
                <input
                  type="number"
                  name="price"
                  min="10"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2 text-sm text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                />
                {errors.price && <p className="text-xs text-rose-500 mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                  Max Spots *
                </label>
                <input
                  type="number"
                  name="maxCapacity"
                  min="1"
                  max="100"
                  value={formData.maxCapacity}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2 text-sm text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                />
                {errors.maxCapacity && <p className="text-xs text-rose-500 mt-1">{errors.maxCapacity}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                  Studio Room
                </label>
                <select
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-2 py-2 text-xs text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                >
                  <option value="Sun Studio">Sun Studio</option>
                  <option value="Moon Sanctuary">Moon Sanctuary</option>
                  <option value="Earth Studio">Earth Studio</option>
                  <option value="Garden Terrace">Garden Terrace</option>
                  <option value="Studio Sanctuary">Studio Sanctuary</option>
                </select>
              </div>
            </div>

            {/* Level & Intensity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                  Level
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                >
                  <option value="All Levels">All Levels</option>
                  <option value="All Levels Welcome">All Levels Welcome</option>
                  <option value="Beginner Friendly">Beginner Friendly</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Intermediate / Advanced">Intermediate / Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                  Intensity
                </label>
                <select
                  name="intensity"
                  value={formData.intensity}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                >
                  <option value="Gentle">Gentle</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                Class Description *
              </label>
              <textarea
                name="description"
                rows={2}
                placeholder="Brief description of the practice, sequence, props, and benefits..."
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#E6E1D8] bg-white p-3 text-xs sm:text-sm text-[#2B2E31] outline-none focus:border-[#7A8B71]"
              />
              {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
            </div>

            {/* Action buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E6E1D8]">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-2xl border border-[#E6E1D8] bg-white px-4 py-2.5 text-xs font-semibold text-[#5C6260] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="flex items-center gap-2 rounded-2xl bg-[#A44A4A] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#8C3E3E] active:scale-95 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Publishing & Saving to Database...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Publish Class</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
