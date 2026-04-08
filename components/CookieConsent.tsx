'use client';

import { useState, useEffect } from 'react';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if the user already consented
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    // Save standard cookie preference inside browser cookies as requested
    document.cookie = "cookieConsent=true; path=/; max-age=31536000";
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-charcoal text-white p-4 sm:p-6 z-[100] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl border-t border-white/10 animate-fade-in-up">
      <div className="text-sm text-gray-300 font-medium max-w-4xl leading-relaxed">
        We use cookies to enhance your browsing experience, provide secure logins, and analyze our traffic. 
        By clicking "Accept All", you consent to our use of cookies according to our Privacy Policy.
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button 
          onClick={handleAccept} 
          className="bg-green text-white px-8 py-3 rounded-tiny-sm text-sm font-bold shadow-lg hover:bg-green-dark transition-all hover:scale-105"
        >
          Accept All
        </button>
      </div>
    </div>
  );
}
