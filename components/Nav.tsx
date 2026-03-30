'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, MessageSquare, Plus, User, LogOut, Bell, Menu, X, Heart, HelpCircle, List, ChevronDown } from 'lucide-react';

export function Nav({ user }: { user: any }) {
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
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-tiny shadow-tiny-sm cursor-pointer hover:bg-gray-200 transition-colors group/profile relative"
                >
                  <div className="w-7 h-7 rounded-full bg-green-pale flex items-center justify-center text-green font-bold text-xs capitalize group-hover/profile:bg-green group-hover/profile:text-white transition-colors">
                    {user.name[0]}
                  </div>
                  <span className="text-sm font-semibold hidden lg:block">{user.name.split(' ')[0]}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileDropdown ? 'rotate-180' : ''}`} />
                  {unreadCount > 0 && (
                     <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                  )}
                </button>

                {/* Profile Dropdown */}
                {profileDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-tiny border border-gray-100 shadow-tiny py-2 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <div className="text-sm font-bold text-charcoal">{user.name}</div>
                      <div className="text-xs text-gray-400 truncate">{user.email}</div>
                    </div>
                    <Link href="/profile" onClick={() => setProfileDropdown(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-charcoal transition-colors">
                      <User className="w-4 h-4 text-gray-400" /> My Profile
                    </Link>
                    <Link href="/my-listings" onClick={() => setProfileDropdown(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-charcoal transition-colors">
                      <List className="w-4 h-4 text-gray-400" /> My Listings
                    </Link>
                    <Link href="/profile#favorites" onClick={() => setProfileDropdown(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-charcoal transition-colors">
                      <Heart className="w-4 h-4 text-gray-400" /> Favorite Listings
                    </Link>
                    <Link href="/help" onClick={() => setProfileDropdown(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-charcoal transition-colors">
                      <HelpCircle className="w-4 h-4 text-gray-400" /> Help
                    </Link>
                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button onClick={() => { setProfileDropdown(false); handleLogout(); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
          <Link href="/listings" onClick={() => setMobileMenu(false)} className="block p-3 rounded-lg hover:bg-gray-50 font-medium">Browse Homes</Link>
          <Link href="/blogs" onClick={() => setMobileMenu(false)} className="block p-3 rounded-lg hover:bg-gray-50 font-medium">Blog</Link>
          {user && (
            <>
              <Link href="/messages" onClick={() => setMobileMenu(false)} className="block p-3 rounded-lg hover:bg-gray-50 font-medium">Messages</Link>
              <Link href="/my-listings" onClick={() => setMobileMenu(false)} className="block p-3 rounded-lg hover:bg-gray-50 font-medium">My Listings</Link>
              {user.role === 'admin' && (
                <Link href="/admin" onClick={() => setMobileMenu(false)} className="block p-3 rounded-lg hover:bg-red-50 font-medium text-red-600">Admin</Link>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
}
export default Nav;
