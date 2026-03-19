import { Nav } from '@/components/Nav';
import { BlogCard } from '@/components/BlogCard';
import { Footer } from '@/components/Footer';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

async function getBlogs() {
  const db = getDb();
  return db.blogs;
}

export default async function BlogsPage() {
  const session = await getSession();
  const blogs = await getBlogs();

  return (
    <main className="min-h-screen bg-white">
      <Nav user={session?.user} />
      
      {/* Header */}
      <section className="bg-gray-50 pt-20 pb-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
              <div className="max-w-xl">
                 <h1 className="font-serif text-5xl font-bold text-charcoal mb-4 tracking-tight">TinyNest Journal</h1>
                 <p className="text-gray-500 font-medium text-lg leading-relaxed">
                   Expert insights, community stories, and design inspiration for the tiny house lifestyle.
                 </p>
              </div>
              {session?.user.role === 'admin' && (
                <Link href="/blogs/new" className="btn btn-primary shadow-xl hover:-translate-y-1 transition-all">
                  <Plus className="w-5 h-5 mr-2" /> Write Article
                </Link>
              )}
           </div>

           <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[300px] relative flex items-center group">
                 <Search className="absolute left-4 w-4 h-4 text-gray-400 group-focus-within:text-green transition-colors" />
                 <input className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-tiny-sm shadow-tiny-sm focus:border-green focus:bg-white transition-all outline-none font-medium text-sm" placeholder="Search articles..." />
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-100 rounded-tiny-sm shadow-tiny-sm cursor-pointer hover:bg-gray-50 transition-colors">
                 <Filter className="w-4 h-4 text-gray-400" />
                 <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Categories</span>
              </div>
           </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {blogs.map((blog: any) => (
              <div key={blog.id} className="relative group">
                <BlogCard blog={blog} />
                {session?.user.role === 'admin' && (
                  <Link 
                    href={`/blogs/edit/${blog.id}`}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-tiny shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity hover:text-green font-bold text-xs"
                  >
                    Edit
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center text-gray-400 font-medium italic">No articles found</div>
        )}
      </section>

      <Footer />
    </main>
  );
}
