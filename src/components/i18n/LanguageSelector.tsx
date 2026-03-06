'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

const locales = ['en', 'ja', 'fr'] as const;
type Locale = typeof locales[number];

export default function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: Locale) => {
    startTransition(() => {
      const segments = pathname.split('/');
      const firstSegmentIsLocale = locales.includes(segments[1] as Locale);

      if (firstSegmentIsLocale) {
        segments[1] = newLocale;
      } else {
        if (pathname === '/') {
          segments.splice(1, 0, newLocale);
        } else {
           segments.splice(1, 0, newLocale);
        }
      }
      const newPath = segments.join('/');
      router.push(newPath);
    });
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Use pointer events for better mobile support
    document.addEventListener('pointerdown', handleClickOutside as EventListener);
    // Fallback for older browsers
    document.addEventListener('mousedown', handleClickOutside as EventListener);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside as EventListener);
      document.removeEventListener('mousedown', handleClickOutside as EventListener);
    };
  }, []);

  const getLanguageName = (locale: string) => {
    switch (locale) {
      case 'en':
        return 'English';
      case 'ja':
        return '日本語';
      case 'fr':
        return 'Français';
      default:
        return locale;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-md bg-foreground/10 hover:bg-foreground/20 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t('language')}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" 
          />
        </svg>
        <span className={`hidden sm:inline ${isPending ? 'opacity-50' : ''}`}>
          {getLanguageName(currentLocale)}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg" 
          className={`hidden sm:inline h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background border border-border z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {locales.map((locale) => ( // Use the defined locales array
              <button
                key={locale}
                onClick={() => handleLanguageChange(locale)}
                disabled={isPending} // Disable while transitioning
                className={`block w-full text-left px-4 py-2 text-sm ${
                  currentLocale === locale
                    ? 'bg-foreground/20 font-semibold'
                    : 'hover:bg-foreground/10'
                } ${isPending ? 'cursor-not-allowed opacity-70' : ''}`}
                role="menuitem"
              >
                {getLanguageName(locale)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
