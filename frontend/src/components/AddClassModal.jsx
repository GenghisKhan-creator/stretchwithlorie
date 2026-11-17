import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { INSTRUCTORS_LIST } from '../data/mockData';

export default function AddClassModal({ isOpen, onClose, onAddClass }) {
  const [formData, setFormData] = useState({
    title: '',
    instructorName: INSTRUCTORS_LIST[0].name,
    date: 'Monday, Nov 23, 2026',
    time: '08:00 AM - 09:00 AM',
    duration: '60 min',
    price: 160,
    maxCapacity: 12,
    room: 'Sun Studio',
    category: 'Vinyasa',
    level: 'All Levels',
    description: '',
    intensity: 'Moderate'
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (formData.price <= 0) errs.price = 'Price must be greater than 0';
    if (formData.maxCapacity <= 0) errs.maxCapacity = 'Capacity must be at least 1';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const selectedInstructor = INSTRUCTORS_LIST.find(
      (inst) => inst.name === formData.instructorName
    ) || {
      name: formData.instructorName,
      role: 'Certified Yoga Instructor'
    };

    onAddClass({
      title: formData.title.trim(),
      instructor: {
        name: selectedInstructor.name,
        role: selectedInstructor.role,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80'
      },
      date: formData.date,
      time: formData.time,
      duration: formData.duration,
      price: Number(formData.price),
      maxCapacity: Number(formData.maxCapacity),
      room: formData.room,
      category: formData.category,
      level: formData.level,
      intensity: formData.intensity,
      description: formData.description.trim(),
      tags: [formData.category, formData.level, formData.intensity]
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#2B2E31]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#FAF8F5] p-6 sm:p-8 shadow-2xl border border-[#E6E1D8]">
        
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
            onClick={onClose}
            className="rounded-full p-2 text-[#5C6260] hover:bg-[#EAE4DC] hover:text-[#2B2E31] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

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
                Category & Style
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2.5 text-sm text-[#2B2E31] outline-none focus:border-[#7A8B71]"
              >
                <option value="Vinyasa">Vinyasa Flow</option>
                <option value="Restorative">Restorative & Sound</option>
                <option value="Yin">Yin & Somatic</option>
                <option value="Hatha">Hatha</option>
                <option value="Power">Power Yoga</option>
                <option value="Pranayama">Pranayama & Breathwork</option>
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
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                Max Spots *
              </label>
              <input
                type="number"
                name="maxCapacity"
                min="1"
                max="40"
                value={formData.maxCapacity}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2 text-sm text-[#2B2E31] outline-none focus:border-[#7A8B71]"
              />
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
              </select>
            </div>
          </div>

          {/* Level */}
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
              className="rounded-2xl border border-[#E6E1D8] bg-white px-4 py-2.5 text-xs font-semibold text-[#5C6260] hover:bg-[#FAF8F5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-2xl bg-[#A44A4A] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#8C3E3E] transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Publish Class</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
