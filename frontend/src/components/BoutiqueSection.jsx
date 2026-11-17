import { ShoppingBag, MessageCircle } from 'lucide-react';
import { BOUTIQUE_ITEMS } from '../data/mockData';

export default function BoutiqueSection() {
  const handleOrderWhatsApp = (item) => {
    const text = encodeURIComponent(
      `Hello Lorie! I'm interested in purchasing the "${item.name}" (GH₵ ${item.price}) from stretchwithlorie. Could you let me know about available colors and sizes?`
    );
    window.open(`https://wa.me/233241234567?text=${text}`, '_blank');
  };

  return (
    <section className="rounded-3xl border border-[#E0DFDB] bg-[#FAF8F5] p-6 sm:p-10 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#EAE6DF] pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5EBE1] border border-[#E8D7C8] px-3 py-1 text-xs font-semibold text-[#774929] mb-2">
            <ShoppingBag className="h-3.5 w-3.5" />
            Studio Boutique & Equipment
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#201410]">
            Items Available for Sale
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#88796B]">
            Premium home-practice mats, non-slip grip socks, supportive props, and studio wear.
          </p>
        </div>

        <a
          href="https://wa.me/233241234567?text=Hello%20Lorie!%20I%20would%20like%20to%20inquire%20about%20your%20studio%20merchandise%20and%20props."
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl border border-[#E0DFDB] bg-white px-4 py-2 text-xs font-semibold text-[#201410] hover:bg-[#F5EBE1] transition-all shrink-0"
        >
          <MessageCircle className="h-4 w-4 text-[#774929]" />
          <span>Inquire Full Catalog</span>
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BOUTIQUE_ITEMS.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-2xl border border-[#E0DFDB] bg-white p-5 hover:border-[#C9B6A5] hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="rounded-full bg-[#F5EBE1] border border-[#E8D7C8] px-2 py-0.5 text-[10px] font-bold text-[#774929]">
                  {item.badge}
                </span>
                <span className="text-base font-bold text-[#201410]">
                  GH₵ {item.price}
                </span>
              </div>

              <h3 className="font-serif text-base font-bold text-[#201410]">
                {item.name}
              </h3>
              <p className="text-[11px] font-medium text-[#774929] mt-0.5">
                {item.tagline}
              </p>
              <p className="text-xs text-[#88796B] mt-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-[#EAE6DF]">
              <button
                type="button"
                onClick={() => handleOrderWhatsApp(item)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#FAF8F5] border border-[#E0DFDB] py-2 text-xs font-semibold text-[#201410] hover:bg-[#774929] hover:text-white hover:border-[#774929] transition-all"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Order via WhatsApp</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}