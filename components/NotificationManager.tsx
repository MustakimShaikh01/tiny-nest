'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, X } from 'lucide-react';

const PUBLIC_VAPID_KEY = 'BEOYm3_q2Q_pS60yYfG-_G0Z-k-XG-_G0Z-k-XG-_G0Z-k-XG-_G0Z-k-XG-_G0Z-k-XG-_G0Z-k-XG-_G0'; // Placeholder, user will need to replace or I can generate

export default function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        // Show custom prompt after 5 seconds
        const timer = setTimeout(() => setShowPrompt(true), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const subscribe = async () => {
    try {
      const resp = await Notification.requestPermission();
      setPermission(resp);
      setShowPrompt(false);

      if (resp === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
        });

        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
      }
    } catch (err) {
      console.error('Failed to subscribe to push notifications:', err);
    }
  };

  if (!showPrompt || permission !== 'default') return null;

  return (
    <div className="fixed bottom-6 left-6 z-[100] animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-sm flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-green"></div>
        <button 
          onClick={() => setShowPrompt(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-pale rounded-xl flex items-center justify-center text-green flex-shrink-0">
            <Bell className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-charcoal font-bold text-sm">Stay Updated!</h3>
            <p className="text-gray-500 text-xs font-medium leading-relaxed">
              Enable notifications to get alerts when new tiny homes are listed or community posts are shared.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={subscribe}
            className="flex-1 py-2.5 bg-green text-white text-xs font-bold rounded-lg hover:shadow-green-sm transition-all"
          >
            Allow Notifications
          </button>
          <button 
            onClick={() => setShowPrompt(false)}
            className="px-4 py-2.5 bg-gray-50 text-gray-500 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

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
