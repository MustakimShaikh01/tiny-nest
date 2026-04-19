'use client';

import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';

export default function PushNotificationBanner() {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    // Only show if not yet decided
    if (Notification.permission === 'default') {
      const dismissed = sessionStorage.getItem('notif_banner_dismissed');
      if (!dismissed) {
        setTimeout(() => setShow(true), 3000); // Show after 3s
      }
    }
    setPermission(Notification.permission);
  }, []);

  const handleAllow = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    setShow(false);

    if (result === 'granted') {
      // Register service worker if available
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js');
          console.log('SW registered:', reg.scope);
        } catch (err) {
          console.log('SW registration skipped:', err);
        }
      }
      // Show welcome notification
      new Notification('TinyNest Notifications Enabled! 🏠', {
        body: "You'll now get alerts for new listings and messages.",
        icon: '/favicon.ico',
      });
    }
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem('notif_banner_dismissed', '1');
  };

  if (!show || permission !== 'default') return null;

  return (
    <div
      id="push-notification-banner"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9998] w-[calc(100%-2rem)] max-w-lg animate-slide-up"
    >
      <div className="bg-charcoal text-white rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-green rounded-xl flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight">Stay Updated</p>
          <p className="text-white/60 text-xs mt-0.5 leading-snug">
            For the latest listings and updates, we'd like to show you notifications.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleAllow}
            className="px-4 py-2 bg-green text-white text-xs font-bold rounded-lg hover:bg-green-dark transition-colors"
          >
            Allow
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 text-white/40 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
