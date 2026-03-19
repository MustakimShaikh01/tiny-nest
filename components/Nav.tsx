'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, MessageSquare, Plus, User, LogOut, Bell, Menu, X } from 'lucide-react';

export function Nav({ user }: { user: any }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Fetch unread count if user is logged in
    if (user) {
      fetch('/api/messages')
        .then(res => res.json())
        .then(data => {
          if (data.messages) {
            const count = data.messages.filter((m: any) => m.to === user.email && m.status === 'unread').length;
            setUnreadCount(count);
          }
        })
        .catch(err => console.error('Failed to fetch unread count:', err));
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
          <span className="font-serif text-2xl font-bold text-green tracking-tight">TinyNest</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1.5">
          <Link href="/listings" className="px-3.5 py-2 rounded-tiny-sm text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-charcoal transition-colors">Browse Homes</Link>
          <Link href="/blogs" className="px-3.5 py-2 rounded-tiny-sm text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-charcoal transition-colors">Blog</Link>
          {user && (
            <>
              <Link href="/messages" className="px-3.5 py-2 rounded-tiny-sm text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-charcoal transition-colors flex items-center gap-2 relative">
                <MessageSquare className="w-4 h-4" /> 
                Messages
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>
              {user.role === 'admin' && (
                <Link href="/admin" className="px-3.5 py-2 rounded-tiny-sm text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">Admin</Link>
              )}
            </>
          )}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {!isAuthPage && (
                <Link href="/list-home" className="btn btn-primary btn-sm hidden sm:flex">
                  <Plus className="w-4 h-4" /> List a Home
                </Link>
              )}
              <Link href="/profile" className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-tiny shadow-tiny-sm cursor-pointer hover:bg-gray-200 transition-colors group/profile relative">
                <div className="w-7 h-7 rounded-full bg-green-pale flex items-center justify-center text-green font-bold text-xs capitalize group-hover/profile:bg-green group-hover/profile:text-white transition-colors">
                  {user.name[0]}
                </div>
                <span className="text-sm font-semibold hidden lg:block">{user.name.split(' ')[0]}</span>
                {unreadCount > 0 && (
                   <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
              </Link>
              <button onClick={handleLogout} title="Logout" className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 text-sm font-semibold text-green hover:bg-green-pale rounded-tiny-sm transition-colors">Sign In</Link>
              <Link href="/signup" className="btn btn-primary btn-sm">Join Free</Link>
            </div>
          )}
          <button className="md:hidden p-2" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden bg-white border-b absolute top-full w-full left-0 p-4 space-y-2 shadow-xl animate-fade-in-down">
          <Link href="/listings" className="block p-3 rounded-lg hover:bg-gray-50 font-medium">Browse Homes</Link>
          <Link href="/blogs" className="block p-3 rounded-lg hover:bg-gray-50 font-medium">Blog</Link>
          {user && (
            <>
              <Link href="/messages" className="block p-3 rounded-lg hover:bg-gray-50 font-medium">Messages</Link>
              <Link href="/my-listings" className="block p-3 rounded-lg hover:bg-gray-50 font-medium">My Listings</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
export default Nav;
