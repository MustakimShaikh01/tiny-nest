import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { getSession } from '@/lib/auth';
import { Calendar, Clock, ArrowRight, User, Share2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getBlog(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/blogs/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  return data.blog;
}

export default async function BlogDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const blog = await getBlog(params.id);

  if (!blog) notFound();

  return (
    <main className="min-h-screen bg-white">
      <Nav user={session?.user} />

      <article className="max-w-4xl mx-auto px-4 py-24">
         <div className="mb-14 text-center">
            <Link href="/blogs" className="group flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-green transition-colors mb-10">
               <ArrowRight className="w-4 h-4 rotate-180 transition-transform group-hover:-translate-x-1" /> All Articles
            </Link>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-pale text-green rounded-full text-[10px] font-bold tracking-widest uppercase mb-6">
               {blog.category}
            </div>
            <h1 className="font-serif text-5xl lg:text-7xl font-bold text-charcoal mb-10 leading-[1.1] tracking-tight">{blog.title}</h1>
            <div className="flex items-center justify-center gap-10 text-xs font-bold uppercase tracking-widest text-gray-400">
               <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-green-light" /> {blog.date}</div>
               <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-green-light" /> {blog.readTime}</div>
               <div className="flex items-center gap-2"><User className="w-4 h-4 text-green-light" /> TINYNEST TEAM</div>
            </div>
         </div>

         <div className="aspect-[21/9] bg-green-pale rounded-tiny shadow-2xl flex items-center justify-center text-9xl mb-20 relative overflow-hidden group">
            <span className="group-hover:scale-105 transition-transform duration-700">{blog.emoji}</span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
         </div>

         <div className="prose prose-lg lg:prose-xl max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:font-medium prose-p:text-gray-500 prose-p:leading-relaxed">
            <p className="text-xl lg:text-3xl text-charcoal mb-12 italic font-serif border-l-8 border-green-pale pl-10 leading-relaxed">
               {blog.excerpt}
            </p>
            <div className="whitespace-pre-line text-lg text-gray-600 space-y-8 font-medium leading-loose">
               {blog.content}
               
               {"\n\n"}
               The tiny house movement continues to grow rapidly in 2026, with more Americans choosing to downsize and simplify their lives. Whether motivated by financial freedom, environmental consciousness, or a desire for adventure, tiny home owners consistently report higher life satisfaction than their counterparts in traditional housing.
               
               {"\n\n"}
               <strong>Key Takeaways:</strong>
               {"\n"}
               • Research your target area's zoning laws before committing to a purchase.
               {"\n"}
               • Get pre-approved for financing before searching for homes.
               {"\n"}
               • Visit at least 3-5 tiny homes in person before buying.
               {"\n"}
               • Connect with the tiny home community for real-world advice.
            </div>
         </div>

         <div className="mt-24 pt-16 border-t border-gray-100 flex items-center justify-between gap-12">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-full bg-green text-white flex items-center justify-center font-serif text-2xl font-bold shadow-xl">T</div>
               <div>
                  <div className="font-bold text-charcoal text-lg mb-1">TinyNest Editorial Team</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Expert insights on the tiny living movement</div>
               </div>
            </div>
            <button className="btn bg-gray-50 text-gray-400 hover:text-green hover:bg-green-pale p-5 rounded-tiny-sm transition-all group">
               <Share2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
         </div>
      </article>

      <section className="bg-cream py-24 mb-0">
         <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="font-serif text-4xl font-bold text-charcoal mb-10 leading-tight tracking-tight">Inspired to find your tiny home?</h2>
            <Link href="/listings" className="btn btn-primary px-12 py-5 shadow-2xl hover:-translate-y-1 transition-all">Start Your Search Today</Link>
         </div>
      </section>

      <Footer />
    </main>
  );
}
