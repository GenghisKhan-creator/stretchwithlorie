import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button after scrolling down 280px
      if (window.scrollY > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      title="Back to top"
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center justify-center gap-1.5 rounded-full bg-[#7A8B71] text-white p-2.5 sm:px-4 sm:py-2.5 shadow-2xl hover:bg-[#5A6952] active:scale-95 transition-all duration-300 border border-white/20 hover:shadow-[#7A8B71]/30 hover:-translate-y-0.5 animate-in fade-in zoom-in-90"
    >
      <ArrowUp className="h-4 w-4 sm:h-3.5 sm:w-3.5 stroke-[2.5]" />
      <span className="hidden sm:inline text-xs font-bold tracking-wider uppercase">
        Back to Top
      </span>
    </button>
  );
}