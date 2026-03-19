import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Link from 'next/link';
import { ArrowRight, Star, MapPin, Search } from 'lucide-react';
import { getDb } from '../lib/db';
import { getSession } from '../lib/auth';

async function getListings() {
  const db = await getDb();
  return db.listings.filter((l: any) => l.status === 'approved').slice(0, 3);
}

async function getBlogs() {
  const db = await getDb();
  return db.blogs.slice(0, 3);
}

export default async function Home() {
  const listings = await getListings();
  const blogs = await getBlogs();
  const session = await getSession();
  const user = session?.user;

  return (
    <main className="min-h-screen bg-white">
      <Nav user={user} />

      {/* Hero Section - Restored to original design */}
      <section className="relative min-h-[580px] flex items-center overflow-hidden" 
        style={{ background: 'linear-gradient(135deg, #1A3D2B 0%, #2D6A4F 50%, #40916C 100%)' }}>
        
        {/* SVG Mesh Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20 lg:py-32">
          <div className="hero-badge inline-flex items-center gap-2 bg-white/10 text-white px-4 py-1.5 rounded-full text-xs font-bold border border-white/20 mb-8 backdrop-blur-sm">
             🏡 #1 Tiny House Marketplace in the USA
          </div>
          
          <h1 className="font-serif text-white text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 max-w-4xl tracking-tight">
             Find Your Perfect <span className="text-[#95D5B2] italic">Tiny Home</span> & Live Large
          </h1>
          
          <p className="text-white/80 text-lg md:text-xl font-medium mb-12 max-w-2xl leading-relaxed">
             Browse thousands of tiny houses for sale and rent across America. Join a community of 50,000+ tiny home enthusiasts.
          </p>

          <form action="/listings" className="search-box bg-white p-2 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-wrap gap-2 max-w-2xl">
             <div className="flex-1 min-w-[200px] flex items-center px-4 py-3 bg-[#F8FAF9] rounded-xl border border-transparent focus-within:border-green transition-all">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input name="q" placeholder="Search by city, state, or keyword..." className="bg-transparent border-none outline-none w-full text-sm font-medium text-charcoal" />
             </div>
             <select name="type" className="px-4 py-3 bg-[#F8FAF9] rounded-xl border border-transparent outline-none text-sm font-bold text-charcoal">
                <option value="all">Buy or Rent</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
             </select>
             <button type="submit" className="btn btn-primary px-10 py-3 text-sm font-bold shadow-xl">
                Search
             </button>
          </form>

          <div className="flex gap-10 mt-12 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex-shrink-0">
               <div className="font-serif text-3xl font-bold text-white mb-1">12,400+</div>
               <div className="text-xs font-bold text-white/60 uppercase tracking-widest">Active Listings</div>
            </div>
            <div className="flex-shrink-0">
               <div className="font-serif text-3xl font-bold text-white mb-1">50K+</div>
               <div className="text-xs font-bold text-white/60 uppercase tracking-widest">Homes Sold</div>
            </div>
            <div className="flex-shrink-0">
               <div className="font-serif text-3xl font-bold text-white mb-1">15M</div>
               <div className="text-xs font-bold text-white/60 uppercase tracking-widest">Monthly Visitors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Tiny Houses for Sale', icon: '🏡', q: 'sale', color: 'bg-green-pale' },
            { label: 'Tiny Houses for Rent', icon: '🔑', q: 'rent', color: 'bg-earth/10' },
            { label: 'On Wheels (THOW)', icon: '🚐', q: 'wheels', color: 'bg-blue-50' },
            { label: 'Communities', icon: '🏘️', q: 'community', color: 'bg-amber-50' }
          ].map((c) => (
             <Link key={c.q} href="/listings" className="group bg-white p-8 rounded-3xl border border-gray-100 shadow-tiny-sm hover:shadow-tiny hover:-translate-y-1 transition-all text-center">
                <div className={`w-16 h-16 ${c.color} rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                   {c.icon}
                </div>
                <div className="font-bold text-charcoal text-sm">{c.label}</div>
             </Link>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="font-serif text-4xl font-bold text-charcoal tracking-tight mb-4">Newly Listed Homes</h2>
              <p className="text-gray-500 font-medium">Handpicked properties verified by our tiny home experts.</p>
            </div>
            <Link href="/listings" className="text-green font-bold flex items-center gap-2 hover:gap-3 transition-all">
              View All <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {listings.map((item: any) => (
              <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-tiny-sm hover:shadow-tiny transition-all group">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                  <div className="absolute top-6 left-6 flex gap-2">
                    <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-charcoal shadow-sm">
                      ${item.price.toLocaleString()}
                    </span>
                    <span className="px-4 py-2 bg-green/90 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                      {item.type}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-2 text-green text-[10px] font-bold uppercase tracking-widest mb-3">
                    <MapPin className="w-3 h-3" /> {item.location}
                  </div>
                  <h3 className="text-xl font-bold text-charcoal mb-4 group-hover:text-green transition-colors leading-tight">{item.title}</h3>
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span>{item.beds} beds</span>
                    <span>{item.sqft} sqft</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hero CTA */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-charcoal rounded-3xl p-12 md:p-24 text-center relative overflow-hidden group shadow-2xl">
          <div className="absolute inset-0 bg-green/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white tracking-tight mb-8">
              Ready to Sell Your Tiny Home?
            </h2>
            <p className="text-gray-400 text-lg md:text-xl font-medium mb-12 leading-relaxed">
              List your tiny house for free and reach millions of potential buyers. No hidden fees, no lead charges—just you and your next buyer.
            </p>
            {!user ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/signup" className="btn btn-primary btn-lg w-full sm:w-auto px-12 py-5 text-sm font-bold shadow-2xl">
                  List Your Home Free
                </Link>
                <Link href="/signup" className="text-white font-bold hover:underline transition-all">
                  Create Free Account
                </Link>
              </div>
            ) : (
                <Link href="/listings" className="btn btn-white btn-lg w-full sm:w-auto px-12 py-5 text-sm font-bold shadow-2xl" 
                  style={{ background: 'white', color: '#1A1A1A' }}>
                  Manage Your Listings
                </Link>
            )}
            <div className="mt-12 pt-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-8 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
               ★ TRUSTED BY 50,000+ TINY HOME ENTHUSIASTS
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-4xl font-bold text-charcoal tracking-tight mb-4">The Tiny Life Blog</h2>
          <p className="text-gray-500 font-medium leading-relaxed italic">Tips, inspiration, and expert advice on downsizing and living big in a tiny home.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {blogs.map((post: any) => (
            <Link key={post.id} href={`/blogs/${post.id}`} className="group relative block overflow-hidden rounded-3xl border border-gray-100 shadow-tiny-sm hover:shadow-tiny transition-all">
               <div className="aspect-video bg-gray-50 flex items-center justify-center group-hover:bg-green-pale transition-colors overflow-hidden">
                  <span className="text-6xl group-hover:scale-125 transition-transform duration-500">{post.emoji}</span>
               </div>
               <div className="p-8 bg-white">
                  <div className="text-[10px] font-bold text-green uppercase tracking-[0.2em] mb-4">{post.category}</div>
                  <h3 className="text-xl font-bold text-charcoal mb-4 group-hover:text-green transition-colors leading-tight">{post.title}</h3>
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                    <span>{post.date}</span>
                    <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                    <span>{post.readTime}</span>
                  </div>
               </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
