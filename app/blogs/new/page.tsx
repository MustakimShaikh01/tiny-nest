'use client';

import { useState, useRef, useEffect } from 'react';
import Nav from '../../../components/Nav';
import { useRouter } from 'next/navigation';
import {
  Type, AlignLeft, Tag, Search, Image as ImageIcon, Loader2, Send,
  Eye, ChevronDown, ChevronUp, Hash, MapPin, Clock, Plus, X, CheckCircle2,
  Bold, Italic, List, Link2, Heading, Quote, Code, BarChart2
} from 'lucide-react';

// ── Helpers ──
const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

const readTimeCalc = (content: string) => {
  const words = content.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
};

const SEO_COLORS = { good: '#10b981', ok: '#f59e0b', bad: '#ef4444' };

function SeoScore({ title, metaDesc, focusKeyword, content, slug }: any) {
  const checks = [
    { label: 'Title contains focus keyword', pass: title && focusKeyword && title.toLowerCase().includes(focusKeyword.toLowerCase()) },
    { label: 'Title length (50-60 chars)', pass: title.length >= 50 && title.length <= 60 },
    { label: 'Meta description has keyword', pass: metaDesc && focusKeyword && metaDesc.toLowerCase().includes(focusKeyword.toLowerCase()) },
    { label: 'Meta description length (120-160)', pass: metaDesc.length >= 120 && metaDesc.length <= 160 },
    { label: 'Slug contains keyword', pass: slug && focusKeyword && slug.toLowerCase().includes(focusKeyword.toLowerCase().replace(/\s+/g, '-')) },
    { label: 'Content has 300+ words', pass: content.trim().split(/\s+/).length >= 300 },
    { label: 'Content contains keyword', pass: content && focusKeyword && content.toLowerCase().includes(focusKeyword.toLowerCase()) },
    { label: 'Focus keyword set', pass: !!focusKeyword },
  ];
  const score = Math.round((checks.filter(c => c.pass).length / checks.length) * 100);
  const color = score >= 70 ? SEO_COLORS.good : score >= 40 ? SEO_COLORS.ok : SEO_COLORS.bad;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 font-bold text-charcoal">
          <BarChart2 className="w-4 h-4 text-green" /> SEO Analysis
        </div>
        <div className="text-2xl font-bold" style={{ color }}>{score}/100</div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
        <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
      </div>
      <div className="space-y-2">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className={c.pass ? 'text-green-500' : 'text-red-400'}>{c.pass ? '✓' : '✗'}</span>
            <span className={c.pass ? 'text-gray-600' : 'text-gray-400'}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableOfContents({ content }: { content: string }) {
  const headings = content.match(/^## .+$/gm) || [];
  if (headings.length === 0) return null;
  return (
    <div className="bg-green-pale/30 border border-green/20 rounded-2xl p-5 mb-6">
      <div className="font-bold text-charcoal text-sm mb-3 flex items-center gap-2">
        <List className="w-4 h-4 text-green" /> Table of Contents
      </div>
      <ol className="space-y-1.5 list-decimal list-inside">
        {headings.map((h, i) => (
          <li key={i} className="text-sm text-green font-medium hover:underline cursor-pointer">
            {h.replace(/^## /, '')}
          </li>
        ))}
      </ol>
    </div>
  );
}

function ContentPreview({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
      {content || <span className="text-gray-300 italic">Preview will appear here...</span>}
    </div>
  );
}

export default function NewBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [showSeoPanel, setShowSeoPanel] = useState(true);
  const [emoji, setEmoji] = useState('📋');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [form, setForm] = useState({
    title: '',
    category: '',
    excerpt: '',
    content: '',
    focusKeyword: '',
    metaTitle: '',
    metaDesc: '',
    slug: '',
    location: '',
    featuredImage: '',
    author: '',
    readTime: '',
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (form.title) {
      setForm(prev => ({ ...prev, slug: slugify(form.title), metaTitle: form.title }));
    }
  }, [form.title]);

  // Auto-generate readTime from content
  useEffect(() => {
    setForm(prev => ({ ...prev, readTime: readTimeCalc(form.content) }));
  }, [form.content]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const insertMarkdown = (syntax: string, wrap = false) => {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = form.content.substring(start, end);
    let insertion = wrap ? `${syntax}${selected || 'text'}${syntax}` : `${syntax}${selected || ''}`;
    const newContent = form.content.substring(0, start) + insertion + form.content.substring(end);
    setForm(prev => ({ ...prev, content: newContent }));
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + syntax.length, start + syntax.length + (selected || 'text').length); }, 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, emoji, tags, readTime: readTimeCalc(form.content) }),
      });
      if (res.ok) { router.push('/blogs'); router.refresh(); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      <Nav user={null} />

      <div className="max-w-[1400px] mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl font-bold text-charcoal">SEO Article Editor</h1>
            <p className="text-gray-400 text-sm mt-1 font-medium">Write, optimize, and publish SEO-ready content</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${readTimeCalc(form.content) ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
              <Clock className="w-3.5 h-3.5" /> {readTimeCalc(form.content) || '0 min read'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
            
            {/* ── LEFT: Main Editor ── */}
            <div className="space-y-5">

              {/* Write / Preview Tabs */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="flex border-b border-gray-100">
                  {(['write', 'preview'] as const).map(tab => (
                    <button key={tab} type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-charcoal text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                      {tab === 'write' ? '✏️ Write' : '👁 Preview'}
                    </button>
                  ))}
                </div>

                <div className="p-6 space-y-5">
                  {/* Title */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Article Title *</label>
                    <input
                      required value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. 10 Best Tiny House States in 2026 | Complete Guide"
                      className="w-full px-4 py-3.5 bg-gray-50 rounded-xl text-xl font-bold text-charcoal focus:bg-white focus:ring-2 focus:ring-green/20 outline-none transition-all"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-gray-400">Ideal: 50-60 characters</span>
                      <span className={`text-[10px] font-bold ${form.title.length >= 50 && form.title.length <= 60 ? 'text-green' : form.title.length > 60 ? 'text-red-400' : 'text-gray-400'}`}>{form.title.length}/60</span>
                    </div>
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">URL Slug</label>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl">
                      <span className="text-gray-400 text-xs font-medium">/blogs/</span>
                      <input
                        value={form.slug}
                        onChange={e => setForm({ ...form, slug: slugify(e.target.value) })}
                        className="flex-1 bg-transparent text-sm text-green font-bold outline-none"
                      />
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Excerpt (Pre-read summary) *</label>
                    <textarea
                      required value={form.excerpt}
                      onChange={e => setForm({ ...form, excerpt: e.target.value })}
                      rows={2}
                      placeholder="A compelling 1-2 sentence summary shown in the blog grid..."
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium resize-none focus:bg-white focus:ring-2 focus:ring-green/20 outline-none transition-all"
                    />
                  </div>

                  {/* Content Editor */}
                  {activeTab === 'write' ? (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Full Content (Markdown supported) *</label>
                      {/* Toolbar */}
                      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-100 rounded-t-xl border-b border-gray-200">
                        {[
                          { icon: <Bold className="w-4 h-4" />, action: () => insertMarkdown('**', true), tip: 'Bold' },
                          { icon: <Italic className="w-4 h-4" />, action: () => insertMarkdown('*', true), tip: 'Italic' },
                          { icon: <Heading className="w-4 h-4" />, action: () => insertMarkdown('## '), tip: 'Heading' },
                          { icon: <List className="w-4 h-4" />, action: () => insertMarkdown('- '), tip: 'List' },
                          { icon: <Quote className="w-4 h-4" />, action: () => insertMarkdown('> '), tip: 'Blockquote' },
                          { icon: <Code className="w-4 h-4" />, action: () => insertMarkdown('`', true), tip: 'Code' },
                          { icon: <Link2 className="w-4 h-4" />, action: () => insertMarkdown('[Link Text](https://url.com)'), tip: 'Link' },
                        ].map((btn, i) => (
                          <button key={i} type="button" onClick={btn.action} title={btn.tip}
                            className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-500 hover:text-charcoal transition-all">
                            {btn.icon}
                          </button>
                        ))}
                        <div className="ml-2 text-[10px] text-gray-400 font-bold">Use ## for headings (auto Table of Contents)</div>
                      </div>
                      <textarea
                        ref={contentRef}
                        required value={form.content}
                        onChange={e => setForm({ ...form, content: e.target.value })}
                        placeholder="## Introduction&#10;&#10;Start writing your article here...&#10;&#10;## Section 1&#10;&#10;Content for section 1..."
                        className="w-full px-4 py-4 bg-white border-x border-b border-gray-200 rounded-b-xl text-sm font-mono resize-none focus:ring-2 focus:ring-green/20 outline-none transition-all min-h-[450px]"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>{form.content.trim().split(/\s+/).filter(Boolean).length} words · {readTimeCalc(form.content)}</span>
                        <span className={form.content.trim().split(/\s+/).length >= 300 ? 'text-green font-bold' : ''}>
                          {form.content.trim().split(/\s+/).filter(Boolean).length < 300 ? `Need ${300 - form.content.trim().split(/\s+/).filter(Boolean).length} more words for good SEO` : '✓ Good length'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="min-h-[450px] bg-gray-50 rounded-xl p-6">
                      <TableOfContents content={form.content} />
                      <ContentPreview content={form.content} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── RIGHT: SEO + Meta Panel ── */}
            <div className="space-y-5">

              {/* SEO Score */}
              <SeoScore title={form.title} metaDesc={form.metaDesc} focusKeyword={form.focusKeyword} content={form.content} slug={form.slug} />

              {/* Focus Keyword */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
                <div className="font-bold text-charcoal text-sm flex items-center gap-2">
                  <Search className="w-4 h-4 text-green" /> Focus Keyword
                </div>
                <input
                  value={form.focusKeyword}
                  onChange={e => setForm({ ...form, focusKeyword: e.target.value })}
                  placeholder="e.g. tiny house for sale texas"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-green/20 transition-all"
                />
                {form.focusKeyword && (
                  <div className="text-xs text-gray-400">
                    Keyword density: <span className="font-bold text-green">
                      {form.content ? ((form.content.toLowerCase().match(new RegExp(form.focusKeyword.toLowerCase(), 'g')) || []).length) : 0}x
                    </span> in content
                  </div>
                )}
              </div>

              {/* Meta SEO */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
                <div className="font-bold text-charcoal text-sm flex items-center gap-2">
                  <Hash className="w-4 h-4 text-green" /> Meta Tags (SERP Preview)
                </div>

                {/* Google SERP Preview */}
                {(form.metaTitle || form.metaDesc) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs">
                    <div className="text-[#1a0dab] font-medium text-sm line-clamp-1 hover:underline cursor-pointer">{form.metaTitle || form.title}</div>
                    <div className="text-green text-[11px] mt-0.5">{`tinylivingmarket.com/blogs/${form.slug}`}</div>
                    <div className="text-gray-600 mt-1 line-clamp-2">{form.metaDesc}</div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Meta Title</label>
                  <input value={form.metaTitle}
                    onChange={e => setForm({ ...form, metaTitle: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green/20 transition-all"
                    placeholder="SEO title (60 chars max)"
                  />
                  <div className={`text-[10px] text-right mt-0.5 ${form.metaTitle.length > 60 ? 'text-red-400' : 'text-gray-400'}`}>{form.metaTitle.length}/60</div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Meta Description</label>
                  <textarea value={form.metaDesc}
                    onChange={e => setForm({ ...form, metaDesc: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green/20 transition-all resize-none"
                    placeholder="Compelling description (120-160 chars)"
                  />
                  <div className={`text-[10px] text-right mt-0.5 ${form.metaDesc.length > 160 ? 'text-red-400' : form.metaDesc.length >= 120 ? 'text-green' : 'text-gray-400'}`}>{form.metaDesc.length}/160</div>
                </div>
              </div>

              {/* Category, Author, Location, Emoji */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
                <div className="font-bold text-charcoal text-sm">Article Details</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Category *</label>
                    <input required value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      placeholder="e.g. Lifestyle"
                      className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Emoji</label>
                    <input value={emoji} onChange={e => setEmoji(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-xl text-center outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block flex items-center gap-1"><MapPin className="w-3 h-3" /> Location (optional)</label>
                  <input value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Austin, TX or National"
                    className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green/20 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Author</label>
                  <input value={form.author}
                    onChange={e => setForm({ ...form, author: e.target.value })}
                    placeholder="e.g. Admin or Jane Smith"
                    className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green/20 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Featured Image URL</label>
                  <input value={form.featuredImage}
                    onChange={e => setForm({ ...form, featuredImage: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green/20 transition-all"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
                <div className="font-bold text-charcoal text-sm flex items-center gap-2">
                  <Tag className="w-4 h-4 text-green" /> Tags
                </div>
                <div className="flex flex-wrap gap-2 min-h-[32px]">
                  {tags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1 bg-green-pale text-green rounded-full text-xs font-bold">
                      #{tag} <button type="button" onClick={() => setTags(tags.filter((_, j) => j !== i))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 bg-gray-50 rounded-xl text-sm outline-none"
                  />
                  <button type="button" onClick={addTag} className="px-3 py-2 bg-green text-white rounded-xl text-xs font-bold hover:bg-green-dark transition-all">
                    Add
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-charcoal text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl text-sm uppercase tracking-widest"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Publish Article</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
