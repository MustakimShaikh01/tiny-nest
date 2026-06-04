'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Bold, Italic, List, Image as ImageIcon, Link2, 
  Code, Eye, Edit, Save, Type, AlignLeft, Heading1, Heading2, 
  Search, Globe, FileText, Layout, User as UserIcon, ListTree 
} from 'lucide-react';

const CATEGORIES = ['Lifestyle', 'Design', 'Finance', 'Sustainability', 'Construction', 'Community'];
const EMOJIS = ['🏡', '🌿', '💰', '🔨', '🎨', '📐', '🌍', '⚡', '🏕️', '🛠️'];

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const blogId = searchParams.get('id');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Lifestyle');
  const [emoji, setEmoji] = useState('🏡');
  const [readTime, setReadTime] = useState('5 min read');
  const [featuredImage, setFeaturedImage] = useState('');
  const [author, setAuthor] = useState('Admin');
  
  // SEO Fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(!!blogId);

  // Fetch existing blog if editing
  useEffect(() => {
    if (blogId) {
      fetch(`/api/blogs/${blogId}`)
        .then(r => r.json())
        .then(data => {
          if (data.blog) {
            const b = data.blog;
            setTitle(b.title || '');
            setSlug(b.slug || '');
            setSlugManual(true);
            setExcerpt(b.excerpt || '');
            setContent(b.content || '');
            setCategory(b.category || 'Lifestyle');
            setEmoji(b.emoji || '🏡');
            setReadTime(b.readTime || '5 min read');
            setFeaturedImage(b.featuredImage || '');
            setAuthor(b.author || 'Admin');
            setMetaTitle(b.metaTitle || '');
            setMetaDesc(b.metaDesc || '');
            setFocusKeyword(b.focusKeyword || '');
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [blogId]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!blogId && title && !slugManual) {
      setSlug(title
        .toLowerCase()
        .replace(/[^a-z0-9-\s]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 60));
    }
  }, [title, blogId, slugManual]);

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  // Real-time Table of Contents
  const toc = content.split('\n')
    .filter(line => line.startsWith('#') || line.startsWith('##'))
    .map(line => {
      const level = line.startsWith('##') ? 2 : 1;
      const text = line.replace(/^#+\s/, '');
      return { level, text };
    });

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = document.getElementById('editor-content') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const newContent = content.substring(0, start) + before + selected + (after || before) + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const method = blogId ? 'PATCH' : 'POST';
      const url = blogId ? `/api/blogs/${blogId}` : '/api/blogs';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          excerpt: excerpt || content.substring(0, 120) + '...',
          content,
          category,
          emoji,
          readTime,
          featuredImage,
          author,
          metaTitle: metaTitle || title,
          metaDesc: metaDesc || excerpt,
          focusKeyword,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        }),
      });
      
      if (res.ok) {
        setSaved(true);
        setTimeout(() => router.push('/admin'), 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 uppercase tracking-widest font-bold text-xs text-gray-400">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-green border-t-transparent rounded-full animate-spin" />
        Loading Article...
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all text-gray-400 hover:text-charcoal" title="Back to Admin">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="h-6 w-px bg-gray-100"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-green uppercase tracking-widest">{blogId ? 'Edit Article' : 'New Article'}</span>
              <span className="text-xs font-bold text-charcoal truncate max-w-[200px]">{title || 'Untitled Draft'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreview(!preview)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                preview ? 'bg-green-pale text-green' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {preview ? <Edit className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {preview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim() || !content.trim()}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                saved ? 'bg-green text-white shadow-lg shadow-green/20' :
                saving ? 'bg-gray-200 text-gray-400 cursor-wait' :
                'bg-charcoal text-white hover:bg-black shadow-lg shadow-charcoal/10'
              } disabled:opacity-50`}
            >
              <Save className="w-3.5 h-3.5" />
              {saved ? 'Saved!' : saving ? 'Saving...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* ========== LEFT: SIDEBAR (CONFIG) ========== */}
        {!preview && (
          <aside className="w-80 border-r border-gray-100 bg-gray-50/50 p-6 overflow-y-auto hidden lg:block custom-scrollbar">
            <div className="space-y-8">
              {/* Category & Emoji */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-4 flex items-center gap-2">
                   <Layout className="w-3 h-3" /> Basic Info
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-2">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-charcoal outline-none focus:border-green"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-2">Emoji Icon</label>
                    <div className="grid grid-cols-5 gap-2">
                      {EMOJIS.map((e) => (
                        <button
                          key={e}
                          onClick={() => setEmoji(e)}
                          className={`text-lg aspect-square rounded-lg transition-all flex items-center justify-center ${emoji === e ? 'bg-green text-white ring-4 ring-green/10' : 'bg-white border border-gray-100 hover:border-green/30'}`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Author & Read Time */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-4 flex items-center gap-2">
                   <UserIcon className="w-3 h-3" /> Credits
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-2">Author Display Name</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-charcoal outline-none focus:border-green"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-2">Read Time</label>
                    <input
                      type="text"
                      value={readTime}
                      onChange={(e) => setReadTime(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-charcoal outline-none focus:border-green"
                    />
                  </div>
                </div>
              </section>

              {/* SEO Score & Analysis */}
              <section className="bg-white rounded-2xl p-5 border border-green/10 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-green">SEO Analysis</h3>
                   <div className={`px-2 py-1 rounded-md text-[10px] font-black ${
                     (wordCount > 500 && focusKeyword && metaDesc) ? 'bg-green text-white' : 'bg-amber-400 text-white'
                   }`}>
                     {Math.min(100, 
                        (title.length > 30 ? 25 : 0) + 
                        (metaDesc.length > 50 ? 25 : 0) + 
                        (content.includes('##') ? 25 : 0) + 
                        (wordCount > 400 ? 25 : 0)
                     )}% SCORE
                   </div>
                </div>
                <div className="space-y-3">
                   {[
                     { label: 'Title length', ok: title.length > 40 && title.length < 70 },
                     { label: 'Meta description', ok: metaDesc.length > 80 },
                     { label: 'Focus keyword usage', ok: focusKeyword && content.toLowerCase().includes(focusKeyword.toLowerCase()) },
                     { label: 'Subheadings (H2)', ok: content.includes('##') },
                     { label: 'Word count (>500)', ok: wordCount > 500 },
                   ].map(item => (
                     <div key={item.label} className="flex items-center justify-between text-[11px] font-bold">
                        <span className={item.ok ? 'text-charcoal' : 'text-gray-300'}>{item.label}</span>
                        <div className={`w-3 h-3 rounded-full ${item.ok ? 'bg-green' : 'bg-gray-100'}`} />
                     </div>
                   ))}
                </div>
              </section>

              {/* Table of Contents Preview */}
              <section className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Table of Contents</h3>
                <div className="space-y-2 border-l-2 border-gray-50 pl-4 max-h-40 overflow-y-auto custom-scrollbar">
                  {content.split('\n')
                    .filter(line => line.startsWith('#'))
                    .map((line, idx) => {
                      const level = line.match(/^#+/)?.[0].length || 1;
                      const text = line.replace(/^#+\s*/, '');
                      return (
                         <div key={idx} style={{ paddingLeft: `${(level - 1) * 12}px` }} className="text-[11px] font-bold text-gray-500 truncate">
                           {text}
                         </div>
                      );
                    })
                  }
                  {!content.includes('#') && <div className="text-[11px] text-gray-300 italic">No headings detected. Use # or ## to create structure.</div>}
                </div>
              </section>

              {/* SEO SETTINGS */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-4 flex items-center gap-2">
                   <Globe className="w-3 h-3" /> SEO Configuration
                </h3>
                <div className="space-y-4">

                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-2">Meta Title</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder={title}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-charcoal outline-none focus:border-green"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-2">Meta Description</label>
                    <textarea
                      value={metaDesc}
                      onChange={(e) => setMetaDesc(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-500 outline-none focus:border-green resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-2">Focus Keyword</label>
                    <input
                      type="text"
                      value={focusKeyword}
                      onChange={(e) => setFocusKeyword(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-charcoal outline-none focus:border-green"
                    />
                  </div>
                </div>
              </section>

              {/* Featured Image */}
              <section>
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-4 flex items-center gap-2">
                   <ImageIcon className="w-3 h-3" /> Featured Image
                </h3>
                <input
                  type="text"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="https://image-url.com"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-mono text-charcoal outline-none focus:border-green"
                />
                {featuredImage && (
                  <img src={featuredImage} alt="Featured" className="mt-3 w-full h-32 object-cover rounded-lg border border-gray-100" />
                )}
              </section>
            </div>
          </aside>
        )}

        {/* ========== CENTER: EDITOR OR PREVIEW ========== */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          <div className="max-w-4xl mx-auto px-8 py-16">
            {!preview ? (
              <div className="space-y-12">
                {/* Title Input */}
                <div className="space-y-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="The Title Of Your Masterpiece..."
                    className="w-full text-5xl font-serif font-bold text-charcoal placeholder:text-gray-100 border-none outline-none bg-transparent leading-tight"
                  />
                  <div className="flex items-center gap-1 text-sm text-gray-400 mt-2 font-medium">
                    <span className="font-semibold text-gray-500">Permalink:</span>
                    <span>/blogs/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        const val = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-\s]/g, '')
                          .replace(/\s+/g, '-')
                          .replace(/-+/g, '-')
                          .slice(0, 60);
                        setSlug(val);
                        setSlugManual(true);
                      }}
                      className="border-b border-dashed border-gray-300 focus:border-green outline-none bg-transparent px-1 font-mono text-xs text-charcoal max-w-md w-full"
                      placeholder="permalink-slug"
                    />
                  </div>
                </div>

                {/* Excerpt Input */}
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Write a captivating summary for the article cards..."
                  rows={2}
                  className="w-full p-4 bg-gray-50/50 rounded-xl border border-gray-100 text-lg font-medium text-gray-500 placeholder:text-gray-200 resize-none focus:bg-white focus:border-green/20 outline-none transition-all leading-relaxed"
                />

                {/* Main Editor Header with word count */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                   <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Content Body</h2>
                   <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                      <span>{wordCount} WORDS</span>
                      <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                      <span>{readTime}</span>
                   </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-tiny-sm sticky top-4 z-40">
                  <div className="flex items-center gap-1 p-2 flex-wrap">
                    <button onClick={() => insertFormatting('# ', '\n')} className="p-2 text-gray-400 hover:text-charcoal hover:bg-gray-50 rounded-lg transition-colors" title="Heading 1"><Heading1 className="w-4 h-4" /></button>
                    <button onClick={() => insertFormatting('## ', '\n')} className="p-2 text-gray-400 hover:text-charcoal hover:bg-gray-50 rounded-lg transition-colors" title="Heading 2"><Heading2 className="w-4 h-4" /></button>
                    <div className="w-px h-5 bg-gray-100 mx-1"></div>
                    <button onClick={() => insertFormatting('**')} className="p-2 text-gray-400 hover:text-charcoal hover:bg-gray-50 rounded-lg transition-colors" title="Bold"><Bold className="w-4 h-4" /></button>
                    <button onClick={() => insertFormatting('*')} className="p-2 text-gray-400 hover:text-charcoal hover:bg-gray-50 rounded-lg transition-colors" title="Italic"><Italic className="w-4 h-4" /></button>
                    <div className="w-px h-5 bg-gray-100 mx-1"></div>
                    <button onClick={() => insertFormatting('- ')} className="p-2 text-gray-400 hover:text-charcoal hover:bg-gray-50 rounded-lg transition-colors" title="List"><List className="w-4 h-4" /></button>
                    <button onClick={() => insertFormatting('[', '](url)')} className="p-2 text-gray-400 hover:text-charcoal hover:bg-gray-50 rounded-lg transition-colors" title="Link"><Link2 className="w-4 h-4" /></button>
                    <button onClick={() => insertFormatting('```\n', '\n```')} className="p-2 text-gray-400 hover:text-charcoal hover:bg-gray-50 rounded-lg transition-colors" title="Code Block"><Code className="w-4 h-4" /></button>
                  </div>

                  {/* Textarea */}
                  <textarea
                    id="editor-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start typing your story... (Markdown supported)"
                    className="w-full p-8 text-lg font-medium text-charcoal placeholder:text-gray-200 resize-none focus:outline-none font-sans leading-relaxed min-h-[600px]"
                  />
                </div>
              </div>
            ) : (
              /* ========== PREVIEW VIEW FILLED ========== */
              <div className="animate-fade-in max-w-3xl mx-auto">
                 {featuredImage && (
                   <img src={featuredImage} alt="Cover" className="w-full aspect-[2/1] object-cover rounded-3xl mb-12 shadow-2xl" />
                 )}
                 <div className="flex items-center gap-3 mb-6">
                    <span className="text-sm font-bold text-green px-3 py-1 bg-green-pale rounded-full">{category}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm font-bold text-gray-400">{dateToString(new Date())}</span>
                 </div>
                 <h1 className="text-5xl font-serif font-bold text-charcoal leading-tight mb-8">
                    <span className="mr-3">{emoji}</span>
                    {title || 'Untitled Article'}
                 </h1>
                 <div className="flex items-center gap-4 border-y border-gray-100 py-6 mb-12">
                     <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400">{author[0]}</div>
                     <div className="flex flex-col">
                        <span className="font-bold text-charcoal">{author}</span>
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">{readTime} · {wordCount} words</span>
                     </div>
                 </div>

                 {/* Simulated ToC for Preview */}
                 {toc.length > 0 && (
                   <div className="bg-gray-50 p-8 rounded-3xl mb-12 border border-gray-100">
                      <h4 className="text-sm font-bold text-charcoal mb-6 flex items-center gap-2">
                         <ListTree className="w-4 h-4 text-green" /> Table of Contents
                      </h4>
                      <ul className="space-y-3">
                         {toc.map((item, i) => (
                           <li key={i} className={`${item.level === 2 ? 'ml-6' : ''}`}>
                              <span className="text-gray-400 mr-2">0{i+1}.</span>
                              <span className="text-sm font-bold text-gray-600 hover:text-green cursor-pointer">{item.text}</span>
                           </li>
                         ))}
                      </ul>
                   </div>
                 )}

                 <div className="prose prose-lg prose-charcoal max-w-none whitespace-pre-wrap font-medium text-gray-600 leading-relaxed">
                    {content}
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* ========== RIGHT: TOC (DURING EDIT) ========== */}
        {!preview && (
           <aside className="w-72 border-l border-gray-50 p-6 overflow-y-auto hidden xl:block bg-white/50">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-6 flex items-center gap-2">
                 <ListTree className="w-3 h-3" /> Outline
              </h3>
              {toc.length > 0 ? (
                <div className="space-y-4">
                   {toc.map((item, i) => (
                     <div key={i} className={`text-xs font-bold transition-colors group cursor-default ${item.level === 2 ? 'ml-4' : ''}`}>
                        <div className="flex gap-2">
                           <span className="text-gray-200 group-hover:text-green">#{item.level}</span>
                           <span className="text-gray-500 group-hover:text-charcoal leading-snug">{item.text}</span>
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="text-[10px] text-gray-300 italic font-medium">Use # or ## to generate an outline.</div>
              )}
           </aside>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #ddd; }
      `}} />
    </main>
  );
}

function dateToString(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function ArticleEditorPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center font-bold text-xs uppercase tracking-widest text-gray-300">Preparing Workspace...</div>}>
      <EditorContent />
    </Suspense>
  );
}

