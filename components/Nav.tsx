'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, MessageSquare, Plus, User, LogOut, Bell, Menu, X, Heart, HelpCircle, List, ChevronDown, Shield } from 'lucide-react';

export default function Nav({ user }: { user: any }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Fetch unread count if user is logged in
    if (user) {
      const fetchCount = async () => {
        try {
          const res = await fetch('/api/messages');
          const data = await res.json();
          if (data.messages) {
             const count = data.messages.filter((m: any) => m.to === user.email && m.status === 'unread').length;
             setUnreadCount(count);
          }
        } catch (err) {}
      };

      fetchCount();
      const interval = setInterval(fetchCount, 15000); 

      // Listen for manual trigger from Messages page
      window.addEventListener('messagesUpdated', fetchCount);

      return () => {
        clearInterval(interval);
        window.removeEventListener('messagesUpdated', fetchCount);
        window.removeEventListener('scroll', handleScroll);
      };
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-tiny py-3' : 'bg-white border-b py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-green rounded-tiny flex items-center justify-center transition-transform group-hover:scale-105">
            <Home className="text-white w-5 h-5" />
          </div>
          <span className="font-serif text-2xl font-bold text-green tracking-tight">Tiny Living Market</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1.5 font-bold tracking-tight">
          <Link href="/list-home" className="px-4 py-2 rounded-tiny-sm text-[13px] text-gray-500 hover:text-green transition-colors uppercase">Sell</Link>
          <Link href="/listings" className="px-4 py-2 rounded-tiny-sm text-[13px] text-gray-500 hover:text-green transition-colors uppercase">Browse Homes</Link>
          <Link href={user ? "/community" : "/login?redirect=/community"} className="px-4 py-2 rounded-tiny-sm text-[13px] text-gray-500 hover:text-green transition-colors uppercase">Communities</Link>
          <Link href="/blogs" className="px-4 py-2 rounded-tiny-sm text-[13px] text-gray-500 hover:text-green transition-colors uppercase">Blog</Link>
          <Link href="/help#how-to-start" className="px-4 py-2 rounded-tiny-sm text-[13px] text-gray-500 hover:text-green transition-colors uppercase">How It Works</Link>
          <div className="relative group/more">
             <button className="px-4 py-2 rounded-tiny-sm text-[13px] text-gray-500 hover:text-green transition-colors uppercase flex items-center gap-1 ring-offset-2 focus:ring-2 focus:ring-green-pale">
               More <ChevronDown className="w-3 h-3" />
             </button>
             <div className="absolute top-full left-0 mt-1 w-48 bg-white glass-card rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all -translate-y-2 group-hover/more:translate-y-0 border border-gray-100 z-50">
                <Link href="/help" className="block px-4 py-2.5 text-[13px] text-gray-600 hover:bg-green-pale hover:text-green font-bold">Help Center</Link>
                <Link href="/privacy" className="block px-4 py-2.5 text-[13px] text-gray-600 hover:bg-green-pale hover:text-green font-bold">Privacy Policy</Link>
                <Link href="/terms" className="block px-4 py-2.5 text-[13px] text-gray-600 hover:bg-green-pale hover:text-green font-bold">Terms of Service</Link>
             </div>
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {/* Admin Badge — visible in nav for admin users */}
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              id="admin-nav-btn"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-charcoal text-white text-[12px] font-bold rounded-xl hover:bg-black transition-all shadow-lg uppercase tracking-widest"
            >
              <Shield className="w-3.5 h-3.5 text-green-400" /> Admin Panel
            </Link>
          )}
          {user && user.email ? (
            <div className="flex items-center gap-3">
              <Link href="/messages" className="flex p-2 text-gray-400 hover:text-green relative">
                 <MessageSquare className="w-5 h-5" />
                 {unreadCount > 0 && (
                   <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full font-black border-2 border-white shadow-sm">
                     {unreadCount}
                   </span>
                 )}
              </Link>
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 bg-gray-100/50 hover:bg-gray-100 px-3 py-1.5 rounded-full transition-all border border-transparent hover:border-gray-200"
                >
                  <div className="w-7 h-7 rounded-full bg-green text-white flex items-center justify-center text-xs font-bold uppercase">
                    {user.name[0]}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                {profileDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-5 py-4 border-b border-gray-100 mb-2">
                      <div className="text-sm font-bold text-charcoal">{user.name}</div>
                      <div className="text-xs text-gray-400 font-medium truncate">{user.email}</div>
                    </div>
                    {[
                      { href: '/profile', icon: User, label: 'My Profile' },
                      { href: '/my-listings', icon: List, label: 'My Listings' },
                      { href: '/favorites', icon: Heart, label: 'Favorites' },
                      ...(user.role === 'admin' ? [{ href: '/admin', icon: Shield, label: 'Admin Dashboard' }] : [])
                    ].map(item => (
                      <Link key={item.label} href={item.href} onClick={() => setProfileDropdown(false)} className="flex items-center gap-3 px-5 py-2.5 text-[13px] font-bold text-gray-500 hover:bg-green-pale hover:text-green transition-colors">
                        <item.icon className="w-4 h-4" /> {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button onClick={() => { setProfileDropdown(false); handleLogout(); }} className="flex items-center gap-3 w-full px-5 py-3 text-[13px] font-bold text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {!isAuthPage && pathname !== '/list-home' && (
                <>
                  <Link href="/login" className="px-5 py-2 text-[13px] font-bold text-gray-500 hover:text-green transition-colors">LOG IN</Link>
                  <Link href="/signup" className="hidden sm:inline-flex bg-green text-white px-6 py-2 rounded-full text-[13px] font-bold shadow-lg hover:shadow-green-sm transition-all active:scale-95">SIGN UP</Link>
                </>
              )}
            </div>
          )}
          <button className="md:hidden p-2 text-charcoal" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b absolute top-full w-full left-0 p-6 space-y-4 shadow-2xl animate-in slide-in-from-top duration-300">
          <Link href="/list-home" onClick={() => setMobileMenu(false)} className="block text-sm font-bold text-gray-500 hover:text-green uppercase">Sell</Link>
          <Link href="/listings" onClick={() => setMobileMenu(false)} className="block text-sm font-bold text-gray-500 hover:text-green uppercase">Browse Homes</Link>
          <Link href="/#how-it-works" onClick={() => setMobileMenu(false)} className="block text-sm font-bold text-gray-500 hover:text-green uppercase">How It Works</Link>
          <div className="h-px bg-gray-100 w-full"></div>
          <Link href="/blogs" onClick={() => setMobileMenu(false)} className="block text-sm font-bold text-gray-500 hover:text-green uppercase">Blog</Link>
          <Link href={user ? "/community" : "/login?redirect=/community"} onClick={() => setMobileMenu(false)} className="block text-sm font-bold text-gray-500 hover:text-green uppercase">Communities</Link>
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenu(false)}
              className="flex items-center gap-2 text-sm font-bold text-white bg-charcoal px-4 py-2.5 rounded-xl w-fit uppercase tracking-widest"
            >
              <Shield className="w-4 h-4 text-green-400" /> Admin Panel
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
