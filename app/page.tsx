import type { Metadata } from 'next';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Link from 'next/link';
import { ArrowRight, Star, MapPin, Search, Home as HomeIcon, CheckCircle2, Shield, ChevronDown } from 'lucide-react';
import { getDb } from '../lib/db';
import { getSession } from '../lib/auth';
import { BlogCard } from '../components/BlogCard';
import PropertyMap from '../components/PropertyMap';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinynest.com';

export const metadata: Metadata = {
  title: 'TinyNest – #1 Tiny House Marketplace | Buy, Sell & Rent Tiny Homes',
  description: 'Browse the largest collection of tiny house listings. Buy, sell, or rent verified sustainable homes, cabins, and container homes across the USA.',
  alternates: { canonical: siteUrl },
};

export default async function Home() {
  const db = await getDb();
  const session = await getSession();

  const allListings = (db?.listings || []).filter((l: any) => l.status === 'approved');
  const featuredListings = allListings.slice(0, 3);
  const recentListings = allListings.slice(3, 9);
  const blogs = (db?.blogs || []).slice(0, 3);
  const user = session?.user;

  const categories = [
    { label: 'Tiny Houses', emoji: '🏠', href: '/listings?category=tiny-house', count: allListings.filter((l:any) => l.category === 'Tiny House').length || '12+' },
    { label: 'Cabins', emoji: '🌲', href: '/listings?category=cabin', count: allListings.filter((l:any) => l.category === 'Cabin').length || '8+' },
    { label: 'Container Homes', emoji: '📦', href: '/listings?category=container', count: allListings.filter((l:any) => l.category === 'Container').length || '5+' },
    { label: 'RVs & WHOWs', emoji: '🚌', href: '/listings?category=rv', count: allListings.filter((l:any) => l.category === 'RV').length || '10+' },
    { label: 'Off-Grid Homes', emoji: '⚡', href: '/listings?type=sale', count: '15+' },
    { label: 'For Rent', emoji: '🔑', href: '/listings?type=rent', count: allListings.filter((l:any) => l.type === 'rent').length || '7+' },
  ];

  const locations = [
    { city: 'Austin, TX', img: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&q=80&w=400' },
    { city: 'Portland, OR', img: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&q=80&w=400' },
    { city: 'Asheville, NC', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80&w=400' },
    { city: 'Denver, CO', img: 'https://images.unsplash.com/photo-1619468129361-605ebea04b44?auto=format&fit=crop&q=80&w=400' },
    { city: 'Sedona, AZ', img: 'https://images.unsplash.com/photo-1598755257130-c2157eb6c3c0?auto=format&fit=crop&q=80&w=400' },
    { city: 'Nashville, TN', img: 'https://images.unsplash.com/photo-1601933513793-45d33b5e3e48?auto=format&fit=crop&q=80&w=400' },
  ];

  const faqs = [
    { q: 'How do I list my tiny house?', a: 'Simply click "Add Listing", complete the step-by-step form with photos and details, and our team reviews your listing within 24 hours.' },
    { q: 'Is TinyNest free to use?', a: 'Browsing and contacting sellers is completely free. We charge a small success fee only when your listing gets approved.' },
    { q: 'How do I contact a seller?', a: 'Once you find a listing you love, click "Contact Seller" to send a direct, encrypted message through our secure messenger.' },
    { q: 'Are listings verified?', a: 'Yes. Every listing is reviewed by our moderation team before it goes live. Sellers must provide accurate photos and details.' },
    { q: 'Can I negotiate the price?', a: 'Absolutely. All negotiations happen directly between buyer and seller via our encrypted messaging system.' },
    { q: 'What types of homes are listed?', a: 'Tiny houses, container homes, park models, RVs, cabins, yurts, and more. If it is a small, sustainable home — you\'ll find it here.' },
  ];

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Nav user={user} />

      {/* ── 1. HERO + SEARCH ─────────────────────────────────────── */}
      <section className="relative min-h-[80vh] flex items-center bg-charcoal overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1449156001437-37c645dce501?auto=format&fit=crop&q=80&w=2000"
            className="w-full h-full object-cover opacity-40"
            alt="Tiny home in nature"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-green-pale font-bold text-xs tracking-widest uppercase mb-6 bg-green/20 border border-green/30 px-4 py-2 rounded-full">
              🏡 #1 Tiny House Marketplace in USA
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-[1.08] tracking-tight">
              Find Your Perfect <span className="text-green-pale italic">Tiny Home.</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl font-medium mb-10 max-w-2xl leading-relaxed">
              Browse {allListings.length}+ verified tiny houses for sale and rent by owners and professional builders across North America.
            </p>

            {/* Search Bar */}
            <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-2xl">
              <div className="flex-[2] relative flex items-center group">
                <MapPin className="absolute left-5 text-gray-400 group-focus-within:text-green w-5 h-5 transition-colors" />
                <input
                  type="text"
                  placeholder="Enter city, state, or zip code..."
                  className="w-full h-14 bg-transparent pl-13 pr-4 text-charcoal font-bold placeholder:text-gray-300 focus:outline-none pl-12"
                />
              </div>
              <div className="h-10 w-px bg-gray-100 self-center hidden md:block" />
              <Link
                href="/listings"
                className="flex-1 h-14 bg-green text-white font-bold rounded-xl hover:bg-green-dark transition-all flex items-center justify-center gap-2 shadow-lg uppercase tracking-widest text-xs min-w-[140px]"
              >
                <Search className="w-4 h-4" /> Search Homes
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-6 px-2">
              {[
                { label: 'Buy A Home', href: '/listings?type=sale', color: 'bg-green' },
                { label: 'Rent A Home', href: '/listings?type=rent', color: 'bg-amber-400' },
                { label: 'Sell Your Home', href: '/list-home', color: 'bg-blue-400' },
              ].map(item => (
                <Link key={item.label} href={item.href} className="text-white/80 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/30 flex flex-col items-center gap-1 animate-bounce">
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* ── 2. TRUST BAR ───────────────────────────────────────────── */}
      <section className="py-5 border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-6 text-center">
            {[
              { value: '12,400+', label: 'Verified Listings' },
              { value: '4.9★', label: 'Average Rating' },
              { value: '100%', label: 'Free to Browse' },
              { value: '24h', label: 'Listing Review' },
              { value: '50+', label: 'US States Covered' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                {i > 0 && <div className="w-px h-8 bg-gray-200 hidden md:block" />}
                <div>
                  <div className="text-xl font-bold text-charcoal font-serif">{stat.value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. FEATURED LISTINGS (3 only) ──────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-green font-bold text-xs tracking-widest uppercase mb-3 block">🔥 Featured</span>
              <h2 className="text-4xl font-serif font-bold text-charcoal tracking-tight">Featured Homes</h2>
            </div>
            <Link href="/listings" className="group flex items-center gap-2 text-sm font-bold text-charcoal hover:text-green transition-colors">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredListings.map((item: any) => (
              <Link key={item.id} href={`/listings/${item.slug || item.id || item._id}`} className="group block bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-tiny-sm hover:shadow-tiny hover:-translate-y-2 transition-all duration-500">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full text-white ${item.type === 'sale' ? 'bg-green' : 'bg-amber-500'}`}>
                      {item.type === 'sale' ? 'For Sale' : 'For Rent'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-green uppercase tracking-widest mb-2">
                    <MapPin className="w-3 h-3" /> {item.location}
                  </div>
                  <h3 className="text-lg font-bold text-charcoal mb-4 group-hover:text-green transition-colors leading-tight">{item.title}</h3>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="text-2xl font-serif font-bold text-charcoal">${item.price?.toLocaleString()}</div>
                    <div className="text-xs text-gray-400 font-bold">{item.beds} Bed · {item.sqft} sqft</div>
                  </div>
                </div>
              </Link>
            ))}
            {featuredListings.length === 0 && (
              <div className="col-span-3 text-center py-20 text-gray-400">No approved listings yet.</div>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. CATEGORIES ──────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-green font-bold text-xs tracking-widest uppercase mb-3 block">Shop by Type</span>
            <h2 className="text-4xl font-serif font-bold text-charcoal tracking-tight">Browse by Category</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <Link key={i} href={cat.href} className="group bg-white rounded-2xl p-6 text-center border border-gray-100 hover:border-green hover:shadow-tiny transition-all">
                <div className="text-4xl mb-3">{cat.emoji}</div>
                <div className="font-bold text-sm text-charcoal group-hover:text-green transition-colors">{cat.label}</div>
                <div className="text-[10px] font-bold text-gray-400 mt-1">{cat.count} homes</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. LOCATIONS ───────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-green font-bold text-xs tracking-widest uppercase mb-3 block">Explore</span>
            <h2 className="text-4xl font-serif font-bold text-charcoal tracking-tight">Popular Locations</h2>
            <p className="text-gray-500 mt-3 text-sm font-medium">Discover tiny homes in the most sought-after cities across the US</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {locations.map((loc, i) => (
              <Link key={i} href={`/listings?location=${encodeURIComponent(loc.city)}`} className="group relative rounded-2xl overflow-hidden aspect-[3/4] block">
                <img src={loc.img} alt={loc.city} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-1 text-white font-bold text-sm">
                    <MapPin className="w-3.5 h-3.5 text-green-pale" />
                    <span>{loc.city}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mini City-wise Map */}
          <div className="mt-14 rounded-3xl overflow-hidden border border-gray-200 shadow-lg" style={{ height: '400px' }}>
            <PropertyMap listings={allListings} />
          </div>
          <div className="text-center mt-5">
            <Link href="/listings" className="inline-flex items-center gap-2 text-green font-bold text-sm hover:underline">
              View full interactive map <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. WHY US ──────────────────────────────────────────────── */}
      <section className="py-24 bg-charcoal text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-green-pale font-bold text-xs tracking-widest uppercase mb-3 block">Our Promise</span>
            <h2 className="text-4xl font-serif font-bold tracking-tight">Why Choose TinyNest?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '✅', title: 'Verified Listings', desc: 'Every listing is manually reviewed by our team for accuracy and legitimacy.' },
              { icon: '🔒', title: 'Secure Messaging', desc: 'Direct, end-to-end encrypted communication between buyers and sellers.' },
              { icon: '💸', title: 'No Hidden Fees', desc: 'Completely free to browse, search, and contact sellers on TinyNest.' },
              { icon: '🌿', title: 'Sustainable Focus', desc: 'We champion eco-friendly tiny living and off-grid communities across the US.' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
                <div className="text-4xl mb-5">{item.icon}</div>
                <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-white/50 text-sm font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. RECENT LISTINGS ─────────────────────────────────────── */}
      {recentListings.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-green font-bold text-xs tracking-widest uppercase mb-3 block">New Arrivals</span>
                <h2 className="text-4xl font-serif font-bold text-charcoal tracking-tight">Recent Listings</h2>
              </div>
              <Link href="/listings" className="group flex items-center gap-2 text-sm font-bold text-charcoal hover:text-green transition-colors">
                All Listings <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentListings.map((item: any) => (
                <Link key={item.id} href={`/listings/${item.slug || item.id || item._id}`} className="group flex bg-white rounded-2xl border border-gray-100 shadow-tiny-sm hover:shadow-tiny transition-all overflow-hidden">
                  <div className="w-36 h-36 flex-shrink-0 overflow-hidden">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-green uppercase tracking-widest mb-1">
                        <MapPin className="w-3 h-3" /> {item.location}
                      </div>
                      <h3 className="font-bold text-charcoal text-sm line-clamp-2 group-hover:text-green transition-colors">{item.title}</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green font-serif">${item.price?.toLocaleString()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${item.type === 'sale' ? 'bg-green-pale text-green' : 'bg-amber-50 text-amber-600'}`}>
                        {item.type === 'sale' ? 'Sale' : 'Rent'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 8. BLOG (3 posts) ──────────────────────────────────────── */}
      {blogs.length > 0 && (
        <section className="py-24 bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-green font-bold text-xs tracking-widest uppercase mb-3 block">TinyNest Journal</span>
                <h2 className="text-4xl font-serif font-bold text-charcoal tracking-tight">Latest Articles</h2>
              </div>
              <Link href="/blogs" className="group flex items-center gap-2 text-sm font-bold text-charcoal hover:text-green transition-colors">
                All Articles <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogs.map((blog: any) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 9. CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-green via-green-dark to-green">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-5xl mb-6">🏡</div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 tracking-tight">
            Ready to Sell Your Tiny House?
          </h2>
          <p className="text-white/70 text-lg font-medium mb-10 max-w-xl mx-auto leading-relaxed">
            List your property today and connect with thousands of serious buyers across the USA. It's free to get started.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/list-home" className="px-10 py-4 bg-white text-green font-bold rounded-2xl hover:shadow-2xl transition-all text-sm uppercase tracking-widest hover:-translate-y-1">
              List Your Home Free
            </Link>
            <Link href="/listings" className="px-10 py-4 border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 transition-all text-sm uppercase tracking-widest">
              Browse Homes
            </Link>
          </div>
        </div>
      </section>

      {/* ── 10. FAQ ────────────────────────────────────────────────── */}
      <section className="py-24 bg-white" id="faq">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-green font-bold text-xs tracking-widest uppercase mb-3 block">Got Questions?</span>
            <h2 className="text-4xl font-serif font-bold text-charcoal tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 font-bold text-charcoal text-sm list-none hover:text-green transition-colors">
                  {faq.q}
                  <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-5 text-sm text-gray-500 font-medium leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/help" className="text-green font-bold text-sm hover:underline">
              View All Help Articles →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 11. STATES & CITIES BROWSE ──────────────────────────────── */}
      <section className="py-20 bg-gray-50/60 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-xl font-bold text-charcoal tracking-tight mb-2">Tiny Houses for Sale/Rent by State:</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Search by state across the USA</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-3 gap-x-4 mb-16">
            {[
              "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", 
              "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", 
              "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", 
              "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", 
              "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
            ].map(state => (
              <Link 
                key={state} 
                href={`/listings?location=${encodeURIComponent(state)}`}
                className="text-sm font-semibold text-gray-500 hover:text-green hover:underline transition-all"
              >
                {state} Tiny House
              </Link>
            ))}
          </div>

          <div className="mb-12 border-t border-gray-200/60 pt-12">
            <h2 className="text-xl font-bold text-charcoal tracking-tight mb-2">Tiny Houses for Sale/Rent by City:</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Search in major cities</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-y-3 gap-x-4">
            {[
              "Austin", "Chicago", "Denver", "Houston", "Los Angeles", "Miami", "New York", "Orlando", "Portland", "San Diego", "Seattle", "Tampa"
            ].map(city => (
              <Link 
                key={city} 
                href={`/listings?location=${encodeURIComponent(city)}`}
                className="text-sm font-semibold text-gray-500 hover:text-green hover:underline transition-all"
              >
                {city} Tiny House
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
