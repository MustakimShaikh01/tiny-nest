import { Nav } from '@/components/Nav';
import { Hero } from '@/components/Hero';
import { ListingCard } from '@/components/ListingCard';
import { BlogCard } from '@/components/BlogCard';
import { Footer } from '@/components/Footer';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import Link from 'next/link';
import { ArrowRight, Star, ShieldCheck, MapPin } from 'lucide-react';

async function getListings() {
  const db = getDb();
  return db.listings.filter((l: any) => l.status === 'approved').slice(0, 3);
}

async function getBlogs() {
  const db = getDb();
  return db.blogs.slice(0, 3);
}

export default async function HomeView() {
  const session = await getSession();
  const featuredListings = await getListings();
  const latestBlogs = await getBlogs();

  return (
    <main className="min-h-screen bg-white selection:bg-green-pale selection:text-green overflow-x-hidden">
      <Nav user={session?.user} />
      <Hero />

      {/* Trust Badges */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-12 lg:gap-24 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
           <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
             <ShieldCheck className="text-green" /> VERIFIED BUILDERS
           </div>
           <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
             <Star className="text-green" /> 4.9 AVERAGE RATING
           </div>
           <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
             <MapPin className="text-green" /> USA WIDE NETWORK
           </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
             <h2 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal mb-4 leading-tight">
               Featured <span className="text-green italic">Tiny Homes</span>
             </h2>
             <p className="text-gray-500 font-medium text-lg leading-relaxed">
               Hand-picked listings from verified sellers across the nation. Experience the best of tiny living.
             </p>
          </div>
          <Link href="/listings" className="group btn btn-outline border-green shadow-sm hover:shadow-tiny transition-all">
             Browse All Listings <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {featuredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {featuredListings.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-gray-50 rounded-tiny border-2 border-dashed border-gray-200">
             <h3 className="text-lg font-bold text-gray-400">Loading new featured homes...</h3>
          </div>
        )}
      </section>

      {/* Trust & CTA Section */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <div className="relative">
             <div className="absolute -top-12 -left-12 w-64 h-64 bg-green-pale rounded-full blur-3xl opacity-30"></div>
             <div className="bg-white p-6 rounded-tiny shadow-2xl relative z-10 rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="bg-green/10 p-8 rounded-tiny mb-6 text-center">
                  <span className="text-9xl">🪵</span>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded-full w-1/2"></div>
                  <div className="h-20 bg-gray-50 rounded-tiny"></div>
                </div>
             </div>
             <div className="absolute -bottom-8 -right-8 bg-green text-white p-8 rounded-tiny shadow-2xl z-20 animate-bounce-slow">
                <div className="text-4xl font-serif font-bold mb-1">98%</div>
                <div className="text-xs font-bold tracking-widest uppercase opacity-70">Seller Rate</div>
             </div>
           </div>
           
           <div className="space-y-8">
              <h2 className="font-serif text-4xl lg:text-6xl font-bold text-charcoal leading-tight">
                Ready to Sell Your <span className="text-earth italic underline decoration-earth/20 underline-offset-8">Tiny Home?</span>
              </h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed">
                List your tiny house for free and reach millions of potential buyers. No hidden fees, no lead charges—just you and your next buyer.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                 <Link href="/list-home" className="btn btn-primary px-10 py-4 text-base shadow-xl hover:-translate-y-1 transition-all">List Your Home Free</Link>
                 <Link href="/signup" className="btn bg-white border border-gray-200 text-charcoal px-10 py-4 text-base shadow-sm hover:bg-gray-50 transition-all">Create Free Account</Link>
              </div>
              <p className="text-xs font-bold text-gray-400 tracking-wider">★ TRUSTED BY 50,000+ TINY HOME ENTHUSIASTS</p>
           </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-green font-bold text-xs tracking-widest uppercase mb-4 block">Our Latest Articles</span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-charcoal mb-6">Expert Guides & Inspiration</h2>
          <p className="text-gray-500 font-medium text-lg">Zoning laws, financing tips, and design trends to help you navigate the tiny living movement.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestBlogs.map((blog: any) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
