import { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

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
    description: yogaClass?.description || ''
  };
}

export default function EditClassModal({ isOpen, yogaClass, onClose, onSaveClass }) {
  const [formData, setFormData] = useState(() => getInitialFormData(yogaClass));
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

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
        description: formData.description.trim()
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
                Update room limits, schedules, pricing, and descriptions in real time.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-[#5C6260] bg-white hover:bg-[#EAE4DC] hover:text-[#2B2E31] border border-[#E6E1D8] transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {errors.form && (
            <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs sm:text-sm">
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
                className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2.5 text-xs text-[#2B2E31] focus:border-[#7A8B71] focus:ring-1 focus:ring-[#7A8B71] outline-none shadow-2xs"
                placeholder="e.g. Mass Yoga Class"
              />
              {errors.title && <p className="text-red-600 text-[11px] mt-1">{errors.title}</p>}
            </div>

            {/* Category & Room */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#2B2E31] mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2.5 text-xs text-[#2B2E31] focus:border-[#7A8B71] outline-none shadow-2xs"
                >
                  <option value="Yoga Classes">Yoga Classes</option>
                  <option value="Private Bookings">Private Bookings</option>
                  <option value="Masterclass">Flexibility Masterclass</option>
                  <option value="Therapeutic">Therapeutic</option>
                  <option value="Special Experiences">Special Experiences</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#2B2E31] mb-1">Studio Room / Location</label>
                <input
                  type="text"
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2.5 text-xs text-[#2B2E31] focus:border-[#7A8B71] outline-none shadow-2xs"
                  placeholder="e.g. Studio Sanctuary"
                />
              </div>
            </div>

            {/* Price & Max Capacity (with quick booster buttons) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#2B2E31] mb-1">
                  Single Ticket Price (GH₵)
                </label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2.5 text-xs text-[#2B2E31] focus:border-[#7A8B71] outline-none shadow-2xs"
                />
                {errors.price && <p className="text-red-600 text-[11px] mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block font-semibold text-[#2B2E31] mb-1">
                  Max Capacity (Mats Available)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    name="maxCapacity"
                    min="1"
                    value={formData.maxCapacity}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2.5 text-xs text-[#2B2E31] focus:border-[#7A8B71] outline-none shadow-2xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => handleAdjustCapacity(2)}
                    className="shrink-0 rounded-xl bg-[#E5ECE2] border border-[#DCE4D9] px-2 py-2 text-[11px] font-bold text-[#5A6952] hover:bg-[#DCE4D9] transition-colors"
                    title="Add 2 more mats"
                  >
                    +2 Mats
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustCapacity(5)}
                    className="shrink-0 rounded-xl bg-[#FAF5EB] border border-[#E8D7B0] px-2 py-2 text-[11px] font-bold text-[#8C6D23] hover:bg-[#F3E9D2] transition-colors"
                    title="Add 5 more mats"
                  >
                    +5 Mats
                  </button>
                </div>
                {errors.maxCapacity && <p className="text-red-600 text-[11px] mt-1">{errors.maxCapacity}</p>}
              </div>
            </div>

            {/* Date, Time & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-[#2B2E31] mb-1">Days / Date</label>
                <input
                  type="text"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs text-[#2B2E31] focus:border-[#7A8B71] outline-none shadow-2xs"
                  placeholder="e.g. Wednesdays & Saturdays"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2B2E31] mb-1">Time Schedule</label>
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs text-[#2B2E31] focus:border-[#7A8B71] outline-none shadow-2xs"
                  placeholder="e.g. 7:00 AM - 8:00 AM"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2B2E31] mb-1">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs text-[#2B2E31] focus:border-[#7A8B71] outline-none shadow-2xs"
                  placeholder="e.g. 60 min"
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
                className="rounded-2xl border border-[#E6E1D8] bg-white px-4 py-2.5 text-xs font-semibold text-[#5C6260] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-2xl bg-[#5A6952] hover:bg-[#475441] text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Updates'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
