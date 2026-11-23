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
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 group flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#7A8B71] text-white shadow-xl hover:bg-[#5A6952] active:scale-95 transition-all duration-300 border border-white/20 hover:border-[#C8A253]/50 hover:shadow-[0_14px_30px_-6px_rgba(122,139,113,0.4)] cursor-pointer"
    >
      <ArrowUp className="h-4 w-4 sm:h-4.5 sm:w-4.5 stroke-[2.25] transition-transform duration-200 group-hover:-translate-y-0.5" />
    </button>
  );
}