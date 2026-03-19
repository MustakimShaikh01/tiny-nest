'use client';

import { useState, useEffect } from 'react';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { Loader2, Send, Type, AlignLeft } from 'lucide-react';

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [blog, setBlog] = useState<any>(null);
  const [emoji, setEmoji] = useState('📋');
  const router = useRouter();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/blogs/${params.id}`);
        const data = await res.json();
        if (data.blog) {
          setBlog(data.blog);
          setEmoji(data.blog.emoji || '📋');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchBlog();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const blogData = {
      ...data,
      emoji,
      category: data.category || 'General'
    };

    try {
      const res = await fetch(`/api/blogs/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogData),
      });

      if (res.ok) {
        router.push('/blogs');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-green w-10 h-10" /></div>;
  if (!blog) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold">Blog not found</div>;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Nav user={null} />

      <div className="max-w-4xl mx-auto px-4 py-20 flex-1 w-full">
         <div className="mb-14">
            <h1 className="font-serif text-5xl font-bold text-charcoal mb-4">Edit Article</h1>
            <p className="text-gray-500 font-medium">Update your insights for the community.</p>
         </div>

         <div className="bg-white rounded-tiny border border-gray-100 shadow-tiny p-12">
            <form onSubmit={handleSubmit} className="space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Article Title</label>
                     <div className="relative flex items-center group">
                        <Type className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-green transition-colors" />
                        <input name="title" defaultValue={blog.title} required className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-tiny font-medium focus:bg-white focus:border-green transition-all outline-none" placeholder="e.g., Best Tiny Home States in 2026" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Category & Icon</label>
                     <div className="flex gap-3">
                        <input name="category" defaultValue={blog.category} required className="flex-1 px-5 py-4 bg-gray-50 border border-transparent rounded-tiny font-medium focus:bg-white focus:border-green transition-all outline-none" placeholder="e.g., Lifestyle" />
                        <input 
                           value={emoji}
                           onChange={(e) => setEmoji(e.target.value)}
                           className="w-16 px-4 py-4 bg-gray-50 border border-transparent rounded-tiny font-medium text-xl text-center focus:bg-white focus:border-green transition-all outline-none" 
                           placeholder="📋" 
                        />
                     </div>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Short Excerpt (Pre-read text)</label>
                  <input name="excerpt" defaultValue={blog.excerpt} required className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-tiny font-medium focus:bg-white focus:border-green transition-all outline-none" placeholder="Catchy summary for the blog grid..." />
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Full Content</label>
                  <div className="relative">
                    <AlignLeft className="absolute top-5 left-5 w-5 h-5 text-gray-300" />
                    <textarea 
                       name="content" 
                       defaultValue={blog.content}
                       required 
                       className="w-full pl-14 pr-6 py-6 bg-gray-50 border border-transparent rounded-tiny font-medium focus:bg-white focus:border-green transition-all outline-none min-h-[400px]" 
                       placeholder="Write your beautiful story here..."
                    ></textarea>
                  </div>
               </div>

               <div className="pt-6 border-t border-gray-50 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn btn-primary px-12 py-5 text-base font-bold shadow-2xl hover:-translate-y-1 transition-all"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Save Changes <Send className="w-5 h-5 ml-2" /></>}
                  </button>
               </div>
            </form>
         </div>
      </div>

      <Footer />
    </main>
  );
}
