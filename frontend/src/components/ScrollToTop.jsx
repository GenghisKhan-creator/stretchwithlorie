import { useState, useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import gsap from 'gsap';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button after scrolling down 280px
      setIsVisible(window.scrollY > 280);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  useEffect(() => {
    if (!buttonRef.current) return;

    if (isVisible) {
      gsap.to(buttonRef.current, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'back.out(2)',
        pointerEvents: 'auto'
      });
    } else {
      gsap.to(buttonRef.current, {
        scale: 0.6,
        opacity: 0,
        y: 16,
        duration: 0.3,
        ease: 'power2.in',
        pointerEvents: 'none'
      });
    }
  }, [isVisible]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      title="Back to top"
      style={{ opacity: 0, transform: 'scale(0.6) translateY(16px)', pointerEvents: 'none' }}
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center justify-center gap-1.5 rounded-full bg-[#7A8B71] text-white p-2.5 sm:px-4 sm:py-2.5 shadow-2xl hover:bg-[#5A6952] active:scale-95 transition-colors border border-white/20 hover:shadow-[#7A8B71]/30 cursor-pointer"
    >
      <ArrowUp className="h-4 w-4 sm:h-3.5 sm:w-3.5 stroke-[2.5]" />
      <span className="hidden sm:inline text-xs font-bold tracking-wider uppercase">
        Back to Top
      </span>
    </button>
  );
}