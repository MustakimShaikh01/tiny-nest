import Link from 'next/link';
import { Home, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, FileText, ExternalLink } from 'lucide-react';

// Resource links for SEO (Google Docs, PDFs)
const resources = [
  {
    name: "Buyer's Checklist (PDF)",
    href: 'https://drive.google.com/file/d/1SWqzToHyludoVLrV2U90fCo17Axj9gRk/view',
    external: true,
    icon: '📄',
  },
  {
    name: 'Zoning Laws by State 2026',
    href: 'https://drive.google.com/file/d/1qr_BeiaLUEn0xj-29EeHZRACqODZ73a_/view',
    external: true,
    icon: '⚖️',
  },
  {
    name: 'Financing Guide (Google Doc)',
    href: 'https://docs.google.com/document/d/1tiny_financing_guide_2026/view',
    external: true,
    icon: '💰',
  },
  { name: 'Tiny House Blog', href: '/blogs', external: false, icon: '📝' },
  { name: 'Safety Center', href: '/help', external: false, icon: '🛡️' },
];

export default function Footer() {
  return (
    <footer className="relative bg-charcoal text-white pt-24 pb-12 overflow-hidden" role="contentinfo">
      {/* Decorative Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-green/10 via-transparent to-transparent opacity-50 pointer-events-none" aria-hidden="true"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-8" aria-label="TinyNest – Home">
              <div className="w-10 h-10 bg-green rounded-tiny flex items-center justify-center" aria-hidden="true">
                <Home className="text-white w-5 h-5" />
              </div>
              <span className="font-serif text-3xl font-bold text-white tracking-tight">TinyNest</span>
            </Link>
            <p className="text-white/50 text-base leading-relaxed mb-10 max-w-sm font-medium">
              Join the movement that&apos;s changing how America lives. Whether you&apos;re buying, selling, or just
              dreaming, TinyNest is your home.
            </p>
            {/* Social Links */}
            <nav aria-label="Social media links">
              <div className="flex gap-4">
                <a
                  href="https://www.facebook.com/tinynest"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TinyNest on Facebook"
                  className="w-10 h-10 rounded-tiny-sm border border-white/10 flex items-center justify-center hover:bg-green hover:border-green hover:text-white transition-all duration-300 text-white/40"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/tinynest"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TinyNest on Instagram"
                  className="w-10 h-10 rounded-tiny-sm border border-white/10 flex items-center justify-center hover:bg-green hover:border-green hover:text-white transition-all duration-300 text-white/40"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com/tinynest"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TinyNest on Twitter / X"
                  className="w-10 h-10 rounded-tiny-sm border border-white/10 flex items-center justify-center hover:bg-green hover:border-green hover:text-white transition-all duration-300 text-white/40"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://www.youtube.com/tinynest"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TinyNest on YouTube"
                  className="w-10 h-10 rounded-tiny-sm border border-white/10 flex items-center justify-center hover:bg-green hover:border-green hover:text-white transition-all duration-300 text-white/40"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </nav>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 lg:col-span-3 gap-12 lg:gap-16">
            {/* Browse Links */}
            <nav aria-label="Browse listings">
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/30 mb-8 py-1 border-white/5 inline-block border-b-2">
                Browse
              </h2>
              <ul className="space-y-4 font-semibold text-white/60">
                {[
                  { name: 'Tiny Houses for Sale', href: '/listings?type=sale' },
                  { name: 'Tiny Houses for Rent', href: '/listings?type=rent' },
                  { name: 'Tiny Homes on Wheels', href: '/listings?q=wheels' },
                  { name: 'Tiny Communities', href: '/listings?q=community' },
                  { name: 'Newest Listings', href: '/listings' },
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="hover:text-green-light transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Resources – with Google Docs / PDF links */}
            <nav aria-label="Resources and guides">
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/30 mb-8 py-1 border-white/5 inline-block border-b-2">
                Free Resources
              </h2>
              <ul className="space-y-4 font-semibold text-white/60">
                {resources.map((resource) => (
                  <li key={resource.name}>
                    {resource.external ? (
                      <a
                        href={resource.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-green-light transition-colors text-sm inline-flex items-center gap-2 group"
                        aria-label={`${resource.name} – opens in new tab`}
                      >
                        <span>{resource.icon}</span>
                        {resource.name}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" aria-hidden="true" />
                      </a>
                    ) : (
                      <Link href={resource.href} className="hover:text-green-light transition-colors text-sm inline-flex items-center gap-2">
                        <span>{resource.icon}</span>
                        {resource.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Contact */}
            <div className="col-span-2 sm:col-span-1">
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/30 mb-8 py-1 border-white/5 inline-block border-b-2">
                Contact
              </h2>
              <address className="not-italic">
                <ul className="space-y-5 font-semibold text-white/60 text-sm">
                  <li className="flex gap-4 group">
                    <Mail className="w-5 h-5 text-green-light group-hover:scale-110 transition-transform flex-shrink-0" aria-hidden="true" />
                    <a href="mailto:hello@tinynest.com" className="hover:text-white transition-colors">
                      hello@tinynest.com
                    </a>
                  </li>
                  <li className="flex gap-4 group">
                    <Phone className="w-5 h-5 text-green-light group-hover:scale-110 transition-transform flex-shrink-0" aria-hidden="true" />
                    <a href="tel:+15550008469" className="hover:text-white transition-colors">
                      1 (555) 000-TINY
                    </a>
                  </li>
                  <li className="flex gap-4 group">
                    <MapPin className="w-5 h-5 text-green-light group-hover:scale-110 transition-transform flex-shrink-0" aria-hidden="true" />
                    <span className="hover:text-white transition-colors">Asheville, NC · Portland, OR</span>
                  </li>
                </ul>
              </address>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 font-bold text-xs uppercase tracking-widest text-white/30">
          <p>© {new Date().getFullYear()} TINYNEST INC. ALL RIGHTS RESERVED.</p>
          <nav aria-label="Legal links">
            <div className="flex gap-10">
              {[
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms of Service', path: '/terms' },
                { name: 'Cookie Settings', path: '/cookies' },
                { name: 'Sitemap', path: '/sitemap.xml' },
              ].map((link) => (
                <Link key={link.name} href={link.path} className="hover:text-white transition-colors">
                  {link.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </footer>
  );
}
