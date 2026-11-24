import { useState, useRef } from 'react';
import { X, Check, AlertCircle, Image as ImageIcon, Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import { STUDIO_IMAGE_PRESETS, CATEGORY_DEFAULT_IMAGES } from './AddClassModal';
import { api } from '../services/api';

function getInitialFormData(yogaClass) {
  return {
    title: yogaClass?.title || '',
    category: yogaClass?.category || 'Yoga Classes',
    room: yogaClass?.room || 'Studio Sanctuary',
    price: yogaClass?.price !== undefined ? yogaClass.price : 150,
    maxCapacity: yogaClass?.maxCapacity || 15,
    duration: yogaClass?.duration || '60 min',
    level: yogaClass?.level || 'All Levels Welcome',
    intensity: yogaClass?.intensity || 'Moderate',
    date: yogaClass?.date || '',
    time: yogaClass?.time || '',
    description: yogaClass?.description || '',
    image: yogaClass?.image || CATEGORY_DEFAULT_IMAGES[yogaClass?.category] || '/images/mass_yoga_class.jpg',
    imagePosition: yogaClass?.imagePosition || 'object-center'
  };
}

export default function EditClassModal({ isOpen, yogaClass, onClose, onSaveClass }) {
  const [formData, setFormData] = useState(() => getInitialFormData(yogaClass));
  const [imageMode, setImageMode] = useState('preset'); // 'preset' | 'upload' | 'url'
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen || !yogaClass) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdjustCapacity = (delta) => {
    setFormData((prev) => ({
      ...prev,
      maxCapacity: Math.max(1, Number(prev.maxCapacity) + delta)
    }));
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
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (formData.price < 0) errs.price = 'Price cannot be negative';
    if (formData.maxCapacity < 1) errs.maxCapacity = 'Capacity must be at least 1';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      setIsSaving(true);
      await onSaveClass(yogaClass.id, {
        title: formData.title.trim(),
        category: formData.category,
        room: formData.room,
        price: Number(formData.price),
        maxCapacity: Number(formData.maxCapacity),
        duration: formData.duration,
        level: formData.level,
        intensity: formData.intensity,
        date: formData.date,
        time: formData.time,
        description: formData.description.trim(),
        image: formData.image,
        imagePosition: formData.imagePosition || 'object-center'
      });
      onClose();
    } catch (err) {
      setErrors({ form: err.message || 'Failed to update class.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2B2E31]/75 backdrop-blur-sm p-3.5 sm:p-6 overscroll-contain animate-in fade-in duration-200">
      <div className="flex min-h-full items-center justify-center py-4 sm:py-6">
        <div className="relative w-full max-w-xl rounded-3xl bg-[#FAF8F5] p-5 sm:p-8 shadow-2xl border border-[#E6E1D8] my-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E6E1D8]">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E5ECE2] border border-[#DCE4D9] px-2.5 py-0.5 text-[11px] font-bold text-[#5A6952]">
                <span>Class Settings & Capacity</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2B2E31] mt-1">
                Edit Yoga Session
              </h3>
              <p className="text-xs text-[#5C6260]">
                Update room limits, photography, schedules, pricing, and descriptions.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-full p-2 text-[#5C6260] bg-white hover:bg-[#EAE4DC] hover:text-[#2B2E31] border border-[#E6E1D8] transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
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
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
            {/* Title */}
            <div>
              <label className="block font-semibold text-[#2B2E31] mb-1">
                Class Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2.5 text-xs text-[#2B2E31] focus:border-[#7A8B71] outline-none shadow-2xs"
                placeholder="e.g. Mass Yoga Class (All Levels)"
              />
              {errors.title && <p className="text-red-600 text-[11px] mt-1">{errors.title}</p>}
            </div>

            {/* CLASS EXPERIENCE IMAGE SELECTOR */}
            <div className="rounded-2xl border border-[#E6E1D8] bg-white/70 p-3.5 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-[#2B2E31] flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-[#7A8B71]" />
                    Class Cover Image
                  </label>
                </div>
                <div className="inline-flex rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] p-0.5 text-[10px] font-medium">
                  <button
                    type="button"
                    onClick={() => setImageMode('preset')}
                    className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                      imageMode === 'preset'
                        ? 'bg-[#232D21] text-[#F7F4EF] font-semibold'
                        : 'text-[#5C6260] hover:text-[#2B2E31]'
                    }`}
                  >
                    Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                      imageMode === 'upload'
                        ? 'bg-[#232D21] text-[#F7F4EF] font-semibold'
                        : 'text-[#5C6260] hover:text-[#2B2E31]'
                    }`}
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                      imageMode === 'url'
                        ? 'bg-[#232D21] text-[#F7F4EF] font-semibold'
                        : 'text-[#5C6260] hover:text-[#2B2E31]'
                    }`}
                  >
                    URL
                  </button>
                </div>
              </div>

              {imageMode === 'preset' && (
                <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {STUDIO_IMAGE_PRESETS.map((preset) => {
                    const isSelected = formData.image === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, image: preset.url }))}
                        className={`group relative text-left rounded-lg overflow-hidden border transition-all cursor-pointer ${
                          isSelected ? 'border-[#C8A253] ring-2 ring-[#C8A253]/35' : 'border-[#E6E1D8]'
                        }`}
                      >
                        <div className="h-12 w-full bg-[#232D21]/10 overflow-hidden relative">
                          <img src={preset.url} alt="" className="h-full w-full object-cover" />
                          {isSelected && (
                            <div className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-[#C8A253] text-[#232D21] flex items-center justify-center">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <p className="text-[9px] font-semibold text-[#2B2E31] p-1 truncate bg-white">
                          {preset.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {imageMode === 'upload' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-[#E6E1D8] hover:border-[#7A8B71] rounded-xl bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    {isUploading ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#7A8B71]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Uploading photo...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 text-[#7A8B71]" />
                        <span className="text-[11px] font-semibold text-[#2B2E31] mt-1">
                          Click to upload new image (max 10MB)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {imageMode === 'url' && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://... or /images/..."
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="w-full rounded-xl border border-[#E6E1D8] bg-white px-2.5 py-1.5 text-xs text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="rounded-xl bg-[#232D21] text-white px-3 py-1.5 text-xs font-semibold hover:bg-[#344031] transition-colors cursor-pointer shrink-0"
                  >
                    Apply
                  </button>
                </div>
              )}

              {formData.image && (
                <div className="pt-2 border-t border-[#E6E1D8]/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-16 rounded-lg overflow-hidden border border-[#E6E1D8] bg-[#232D21]/10 shrink-0">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className={`h-full w-full object-cover ${formData.imagePosition || 'object-center'}`}
                      />
                    </div>
                    <span className="text-[10px] text-[#5C6260] truncate max-w-[150px]">
                      {formData.image}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-[#5C6260]">Focus:</span>
                    {['object-top', 'object-center', 'object-bottom'].map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, imagePosition: pos }))}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors cursor-pointer ${
                          formData.imagePosition === pos
                            ? 'bg-[#7A8B71] text-white font-bold'
                            : 'bg-[#FAF8F5] text-[#5C6260] border border-[#E6E1D8]'
                        }`}
                      >
                        {pos.replace('object-', '')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Category & Room */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-[#2B2E31] mb-1">Studio Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2.5 text-xs text-[#2B2E31] focus:border-[#7A8B71] outline-none shadow-2xs"
                >
                  <option value="Yoga Classes">Yoga Classes (Group Flow)</option>
                  <option value="Private Bookings">Private Bookings (1-on-1 / Couples)</option>
                  <option value="Masterclass">Flexibility Masterclass</option>
                  <option value="Therapeutic">Therapeutic & Somatic Stretch</option>
                  <option value="Special Experiences">Special Experiences</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#2B2E31] mb-1">Studio Room</label>
                <select
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2.5 text-xs text-[#2B2E31] focus:border-[#7A8B71] outline-none shadow-2xs"
                >
                  <option value="Sun Studio">Sun Studio</option>
                  <option value="Moon Sanctuary">Moon Sanctuary</option>
                  <option value="Earth Studio">Earth Studio</option>
                  <option value="Garden Terrace">Garden Terrace</option>
                  <option value="Studio Sanctuary">Studio Sanctuary</option>
                </select>
              </div>
            </div>

            {/* Price & Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-[#2B2E31] mb-1">
                  Price per Student (GH₵) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2 text-xs text-[#2B2E31] focus:border-[#7A8B71] outline-none shadow-2xs"
                />
                {errors.price && <p className="text-red-600 text-[11px] mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block font-semibold text-[#2B2E31] mb-1">
                  Max Room Capacity (Spots) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="maxCapacity"
                    min="1"
                    max="100"
                    value={formData.maxCapacity}
                    onChange={handleChange}
                    className="flex-1 rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2 text-xs text-[#2B2E31] focus:border-[#7A8B71] outline-none shadow-2xs"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAdjustCapacity(-1)}
                      className="h-8 w-8 rounded-xl border border-[#E6E1D8] bg-white hover:bg-[#FAF8F5] text-sm font-bold text-[#2B2E31] cursor-pointer"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustCapacity(1)}
                      className="h-8 w-8 rounded-xl border border-[#E6E1D8] bg-white hover:bg-[#FAF8F5] text-sm font-bold text-[#2B2E31] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
                {errors.maxCapacity && <p className="text-red-600 text-[11px] mt-1">{errors.maxCapacity}</p>}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-[#2B2E31] mb-1">Display Schedule Date</label>
                <input
                  type="text"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs text-[#2B2E31] focus:border-[#7A8B71] outline-none shadow-2xs"
                  placeholder="e.g. Daily / Recurring Mon &amp; Wed"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2B2E31] mb-1">Display Schedule Time</label>
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs text-[#2B2E31] focus:border-[#7A8B71] outline-none shadow-2xs"
                  placeholder="e.g. 7:00 AM - 8:00 AM"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-[#2B2E31] mb-1">
                Class Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2.5 text-xs text-[#2B2E31] focus:border-[#7A8B71] outline-none shadow-2xs leading-relaxed"
                placeholder="Describe the experience, breathing focus, and expected student benefits..."
              />
              {errors.description && <p className="text-red-600 text-[11px] mt-1">{errors.description}</p>}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E6E1D8]">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="rounded-2xl border border-[#E6E1D8] bg-white px-4 py-2.5 text-xs font-semibold text-[#5C6260] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="flex items-center gap-1.5 rounded-2xl bg-[#5A6952] hover:bg-[#475441] text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Save Updates</span>
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
