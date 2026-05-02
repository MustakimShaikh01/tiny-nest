'use client';

import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';

const PUBLIC_VAPID_KEY = 'BEOYm3_q2Q_pS60yYfG-_G0Z-k-XG-_G0Z-k-XG-_G0Z-k-XG-_G0Z-k-XG-_G0Z-k-XG-_G0Z-k-XG-_G0'; // Placeholder

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationBanner() {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermission('unsupported');
      return;
    }
    if (Notification.permission === 'default') {
      const dismissed = sessionStorage.getItem('notif_banner_dismissed');
      if (!dismissed) {
        setTimeout(() => setShow(true), 10000); // 10s delay to be less intrusive
      }
    }
    setPermission(Notification.permission);

    // Notification Polling
    let lastChecked = Date.now();
    const pollNotifications = async () => {
      if (Notification.permission !== 'granted') return;
      try {
        const res = await fetch('/api/notifications/recent');
        const data = await res.json();
        if (data.notifications && data.notifications.length > 0) {
           const newNotifs = data.notifications.filter((n: any) => new Date(n.createdAt).getTime() > lastChecked);
           newNotifs.forEach((n: any) => {
              new Notification(n.title, {
                body: n.body,
                icon: '/favicon.ico',
                data: { url: n.url }
              });
           });
           if (newNotifs.length > 0) lastChecked = Date.now();
        }
      } catch (err) {}
    };

    const id = setInterval(pollNotifications, 60000); // Check every minute
    return () => clearInterval(id);
  }, []);

  const handleAllow = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setShow(false);

      if (result === 'granted') {
        const reg = await navigator.serviceWorker.ready;
        
        // Subscribe to push
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
        });

        // Save to DB
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });

        console.log('Push subscription saved.');
      }
    } catch (err) {
      console.error('Push error:', err);
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
      <div className="bg-charcoal text-white rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-green"></div>
        <div className="w-10 h-10 bg-green/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-green animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight text-white">Enable Alerts</p>
          <p className="text-white/60 text-[11px] mt-0.5 leading-snug">
            Get notified about new tiny homes and exclusive offers instantly.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleAllow}
            className="px-4 py-2 bg-green text-white text-xs font-bold rounded-lg hover:shadow-green-sm transition-all"
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
