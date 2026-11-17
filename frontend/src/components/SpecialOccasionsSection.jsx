import { useState } from 'react';
import { Sparkles, MessageCircle, Heart, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { SPECIAL_OCCASIONS } from '../data/mockData';

export default function SpecialOccasionsSection() {
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    phone: '',
    email: '',
    groupSize: '6-12 people',
    preferredDate: '',
    venue: 'Studio Sanctuary',
    notes: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleOpenCustomizer = (occasion) => {
    setSelectedOccasion(occasion);
    setIsModalOpen(true);
    setIsSubmitted(false);
  };

  const handleWhatsAppChat = () => {
    const occasionTitle = selectedOccasion ? selectedOccasion.title : 'Special Occasion';
    const text = encodeURIComponent(
      `Hello Lorie! I would love to customize a private yoga experience for a ${occasionTitle}.\n\n` +
      `• Group Size: ${inquiryForm.groupSize}\n` +
      `• Preferred Date: ${inquiryForm.preferredDate || 'Flexible'}\n` +
      `• Venue: ${inquiryForm.venue}\n` +
      (inquiryForm.name ? `• My Name: ${inquiryForm.name}\n` : '') +
      (inquiryForm.notes ? `• Special Notes: ${inquiryForm.notes}\n` : '') +
      `Looking forward to creating a beautiful memory with stretchwithlorie!`
    );
    window.open(`https://wa.me/233241234567?text=${text}`, '_blank');
  };

  const handleSubmitInquiry = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2B2E31] via-[#333936] to-[#2B2E31] p-6 sm:p-10 text-white shadow-xl">
      
      {/* Decorative ambient background */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#7A8B71]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-10 h-80 w-80 rounded-full bg-[#C8A253]/15 blur-3xl" />

      <div className="relative z-10 max-w-4xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1 text-xs font-semibold text-[#EDE8E1] mb-3">
          <Sparkles className="h-3.5 w-3.5 text-[#C8A253]" />
          Custom Private Events & Celebrations
        </span>

        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
          Special Occasion Bookings
        </h2>

        <p className="mt-3 text-sm sm:text-base text-[#EDE8E1]/90 leading-relaxed max-w-3xl">
          Planning something special? Whether it is a bridal celebration, anniversary, birthday, reunion or an intimate gathering, we can create a yoga experience around your occasion.
        </p>

        <p className="mt-2 text-xs sm:text-sm text-[#C8A253] font-medium">
          You don’t need to wait for a scheduled event to enjoy a yoga experience. Choose an occasion below to customize:
        </p>
      </div>

      {/* Occasions Interactive Grid */}
      <div className="relative z-10 mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {SPECIAL_OCCASIONS.map((occ) => (
          <button
            key={occ.id}
            type="button"
            onClick={() => handleOpenCustomizer(occ)}
            className="group flex flex-col justify-between rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#C8A253]/50 shadow-sm"
          >
            <div>
              <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">
                {occ.icon}
              </span>
              <h3 className="font-serif text-sm font-bold text-white group-hover:text-[#C8A253] transition-colors">
                {occ.title}
              </h3>
              <p className="mt-1 text-[11px] text-[#EDE8E1]/75 line-clamp-2 leading-relaxed">
                {occ.description}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-semibold text-[#C8A253]">
              <span>Customise</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>

      {/* Bottom CTA Bar */}
      <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#EDE8E1]">
          <Heart className="h-4 w-4 text-[#C8A253]" />
          <span>Let’s make your occasion beautiful, refreshing and memorable.</span>
        </div>

        <button
          type="button"
          onClick={() => handleOpenCustomizer(SPECIAL_OCCASIONS[0])}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#A44A4A] hover:bg-[#8C3E3E] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition-all active:scale-[0.99]"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Contact Us to Customise Your Experience</span>
        </button>
      </div>

      {/* Customizer Modal */}
      {isModalOpen && selectedOccasion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 text-[#2B2E31]">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#FAF8F5] p-6 sm:p-8 shadow-2xl border border-[#E6E1D8]">
            
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-[#5C6260] hover:bg-[#EAE4DC] hover:text-[#2B2E31] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {isSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E5ECE2] text-[#5A6952]">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#2B2E31]">
                  Inquiry Received!
                </h3>
                <p className="text-xs sm:text-sm text-[#5C6260] max-w-md mx-auto">
                  Thank you! Lorie will review your <strong>{selectedOccasion.title}</strong> inquiry and get in touch via WhatsApp within a few hours to curate your experience.
                </p>
                <div className="pt-3 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleWhatsAppChat}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] text-white py-3 px-4 text-xs font-bold shadow hover:bg-[#20BA5A] transition-all"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Open in WhatsApp Now for Faster Reply</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs text-[#5C6260] hover:underline py-1"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#E6E1D8]">
                  <span className="text-3xl">{selectedOccasion.icon}</span>
                  <div>
                    <span className="text-[11px] font-bold text-[#7A8B71] uppercase tracking-wider">
                      Customise Private Event
                    </span>
                    <h3 className="font-serif text-xl font-bold text-[#2B2E31]">
                      {selectedOccasion.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-[#5C6260]">
                  For private events, bookings can be customised according to your group size, occasion, and preferred arrangements.
                </p>

                {/* Group size & Venue */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                      Estimated Group Size
                    </label>
                    <select
                      value={inquiryForm.groupSize}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, groupSize: e.target.value })}
                      className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                    >
                      <option value="2-5 people">2 - 5 people</option>
                      <option value="6-12 people">6 - 12 people (Popular)</option>
                      <option value="13-20 people">13 - 20 people</option>
                      <option value="20+ people">20+ people (Large Event)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                      Preferred Venue
                    </label>
                    <select
                      value={inquiryForm.venue}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, venue: e.target.value })}
                      className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                    >
                      <option value="Studio Sanctuary">Studio Sanctuary</option>
                      <option value="Client Location in Accra">At My Location (Accra)</option>
                      <option value="Outdoor / Garden Venue">Outdoor / Garden Venue</option>
                    </select>
                  </div>
                </div>

                {/* Preferred Date */}
                <div>
                  <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                    Preferred Date & Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Next Saturday around 11:00 AM"
                    value={inquiryForm.preferredDate}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, preferredDate: e.target.value })}
                    className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3 py-2 text-base sm:text-xs text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                  />
                </div>

                {/* Contact Name & WhatsApp */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Akosua Mensah"
                      value={inquiryForm.name}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                      className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3 py-2 text-base sm:text-xs text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                      WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 024 123 4567"
                      value={inquiryForm.phone}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                      className="w-full rounded-2xl border border-[#E6E1D8] bg-white px-3 py-2 text-base sm:text-xs text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                    />
                  </div>
                </div>

                {/* Special Notes / Requests */}
                <div>
                  <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                    Special Requests or Add-ons
                  </label>
                  <textarea
                    rows={2}
                    placeholder="E.g. Champagne setup, herbal teas, custom music playlist, beginner modifications..."
                    value={inquiryForm.notes}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                    className="w-full rounded-2xl border border-[#E6E1D8] bg-white p-2.5 text-base sm:text-xs text-[#2B2E31] outline-none focus:border-[#7A8B71]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-[#A44A4A] py-3 text-xs font-bold text-white shadow-md hover:bg-[#8C3E3E] transition-all"
                  >
                    Submit Custom Booking Inquiry
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppChat}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl border border-[#25D366] bg-[#25D366]/10 text-[#1E7E34] py-2.5 text-xs font-bold hover:bg-[#25D366] hover:text-white transition-all"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Or Chat Directly with Lorie on WhatsApp</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
}