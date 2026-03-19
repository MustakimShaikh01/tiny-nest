import Link from 'next/link';
import { Home, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-charcoal text-white pt-24 pb-12 overflow-hidden">
      {/* Decorative Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-green/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 mb-20">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-green rounded-tiny flex items-center justify-center">
                <Home className="text-white w-5 h-5" />
              </div>
              <span className="font-serif text-3xl font-bold text-white tracking-tight">TinyNest</span>
            </Link>
            <p className="text-white/50 text-base leading-relaxed mb-10 max-w-sm font-medium">
              Join the movement that's changing how America lives. Whether you're buying, selling, or just dreaming, TinyNest is your home.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-tiny-sm border border-white/10 flex items-center justify-center hover:bg-green hover:border-green hover:text-white transition-all duration-300 text-white/40">
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 lg:col-span-3 gap-12 lg:gap-24">
            <div>
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-white/30 mb-8 py-1 border-white/5 inline-block border-b-2">Browse</h4>
              <ul className="space-y-4 font-semibold text-white/60">
                {['Living Communities', 'Homes for Sale', 'Homes for Rent', 'Newest Listings', 'Luxury Collections'].map((link) => (
                  <li key={link}><Link href="/listings" className="hover:text-green-light transition-colors">{link}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-white/30 mb-8 py-1 border-white/5 inline-block border-b-2">Resources</h4>
              <ul className="space-y-4 font-semibold text-white/60">
                {['Buyer’s Checklist', 'Financing Guide', 'Zoning Laws 2026', 'Tiny House Blog', 'Safety Center'].map((link) => (
                  <li key={link}><Link href="/blogs" className="hover:text-green-light transition-colors">{link}</Link></li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-white/30 mb-8 py-1 border-white/5 inline-block border-b-2">Contact</h4>
              <ul className="space-y-5 font-semibold text-white/60 text-sm">
                <li className="flex gap-4 group">
                  <Mail className="w-5 h-5 text-green-light group-hover:scale-110 transition-transform" />
                  <span className="hover:text-white transition-colors">hello@tinynest.com</span>
                </li>
                <li className="flex gap-4 group">
                  <Phone className="w-5 h-5 text-green-light group-hover:scale-110 transition-transform" />
                  <span className="hover:text-white transition-colors">1 (555) 000-TINY</span>
                </li>
                <li className="flex gap-4 group">
                  <MapPin className="w-5 h-5 text-green-light group-hover:scale-110 transition-transform" />
                  <span className="hover:text-white transition-colors">Asheville, NC · Portland, OR</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 font-bold text-xs uppercase tracking-widest text-white/30">
          <p>© 2026 TINYNEST INC. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-10">
            {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map((link) => (
              <Link key={link} href="#" className="hover:text-white transition-colors">{link}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
