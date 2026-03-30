'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bold, Italic, List, Image, Link2, Code, Eye, Edit, Save, Type, AlignLeft, Heading1, Heading2 } from 'lucide-react';

const CATEGORIES = ['Lifestyle', 'Design', 'Finance', 'Sustainability', 'Construction', 'Community'];
const EMOJIS = ['🏡', '🌿', '💰', '🔨', '🎨', '📐', '🌍', '⚡', '🏕️', '🛠️'];

export default function ArticleEditorPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Lifestyle');
  const [emoji, setEmoji] = useState('🏡');
  const [readTime, setReadTime] = useState('5 min read');
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const wordCount = content.split(/\s+/).filter(Boolean).length;

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
      await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          excerpt: excerpt || content.substring(0, 120) + '...',
          content,
          category,
          emoji,
          readTime,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        }),
      });
      setSaved(true);
      setTimeout(() => router.push('/admin'), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/admin" className="flex items-center gap-2 text-gray-500 hover:text-charcoal transition-colors font-bold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Admin
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreview(!preview)}
              className={`flex items-center gap-2 px-4 py-2 rounded-tiny-sm text-xs font-bold uppercase tracking-widest transition-all ${
                preview ? 'bg-green-pale text-green' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {preview ? <Edit className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {preview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim() || !content.trim()}
              className={`flex items-center gap-2 px-6 py-2 rounded-tiny-sm text-xs font-bold uppercase tracking-widest transition-all ${
                saved ? 'bg-green text-white' :
                saving ? 'bg-gray-200 text-gray-400 cursor-wait' :
                'bg-charcoal text-white hover:bg-black'
              } disabled:opacity-50`}
            >
              <Save className="w-3.5 h-3.5" />
              {saved ? 'Published!' : saving ? 'Saving...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {!preview ? (
          /* ========== EDITOR VIEW ========== */
          <div className="space-y-8">
            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article title..."
                className="w-full text-4xl font-serif font-bold text-charcoal placeholder:text-gray-200 border-none outline-none bg-transparent"
              />
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-tiny-sm text-sm font-medium text-charcoal bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Emoji Icon</label>
                <div className="flex gap-1">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEmoji(e)}
                      className={`text-xl p-1.5 rounded-tiny-sm transition-all ${emoji === e ? 'bg-green-pale ring-2 ring-green scale-110' : 'hover:bg-gray-100'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Read Time</label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-tiny-sm text-sm font-medium text-charcoal bg-white w-32"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Excerpt / Summary</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short summary of your article..."
                rows={2}
                className="w-full p-4 border border-gray-200 rounded-tiny text-sm font-medium text-charcoal placeholder:text-gray-300 resize-none focus:ring-2 focus:ring-green focus:border-green outline-none"
              />
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-tiny border border-gray-200 shadow-tiny-sm">
              <div className="flex items-center gap-1 p-3 border-b border-gray-100 flex-wrap">
                <button onClick={() => insertFormatting('# ', '\n')} className="p-2 text-gray-400 hover:text-charcoal hover:bg-gray-50 rounded-tiny-sm transition-colors" title="Heading 1"><Heading1 className="w-4 h-4" /></button>
                <button onClick={() => insertFormatting('## ', '\n')} className="p-2 text-gray-400 hover:text-charcoal hover:bg-gray-50 rounded-tiny-sm transition-colors" title="Heading 2"><Heading2 className="w-4 h-4" /></button>
                <div className="w-px h-5 bg-gray-200 mx-1"></div>
                <button onClick={() => insertFormatting('**')} className="p-2 text-gray-400 hover:text-charcoal hover:bg-gray-50 rounded-tiny-sm transition-colors" title="Bold"><Bold className="w-4 h-4" /></button>
                <button onClick={() => insertFormatting('*')} className="p-2 text-gray-400 hover:text-charcoal hover:bg-gray-50 rounded-tiny-sm transition-colors" title="Italic"><Italic className="w-4 h-4" /></button>
                <div className="w-px h-5 bg-gray-200 mx-1"></div>
                <button onClick={() => insertFormatting('- ')} className="p-2 text-gray-400 hover:text-charcoal hover:bg-gray-50 rounded-tiny-sm transition-colors" title="List"><List className="w-4 h-4" /></button>
                <button onClick={() => insertFormatting('[', '](url)')} className="p-2 text-gray-400 hover:text-charcoal hover:bg-gray-50 rounded-tiny-sm transition-colors" title="Link"><Link2 className="w-4 h-4" /></button>
                <button onClick={() => insertFormatting('```\n', '\n```')} className="p-2 text-gray-400 hover:text-charcoal hover:bg-gray-50 rounded-tiny-sm transition-colors" title="Code Block"><Code className="w-4 h-4" /></button>
                <div className="flex-1"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">{wordCount} words</span>
              </div>

              {/* Editor Area */}
              <textarea
                id="editor-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article content here... (Markdown supported)"
                rows={20}
                className="w-full p-6 text-sm font-medium text-charcoal placeholder:text-gray-300 resize-none focus:outline-none font-mono leading-relaxed"
              />
            </div>
          </div>
        ) : (
          /* ========== PREVIEW VIEW ========== */
          <div className="bg-white rounded-tiny border border-gray-100 shadow-tiny-sm p-8 lg:p-16">
            <div className="max-w-3xl mx-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest text-green mb-4 block">{category}</span>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">{emoji}</span>
                <h1 className="font-serif text-4xl font-bold text-charcoal">{title || 'Untitled'}</h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-10 font-medium">
                <span>{readTime}</span>
                <span>·</span>
                <span>{wordCount} words</span>
              </div>
              {excerpt && (
                <div className="bg-green-pale border-l-4 border-green p-6 rounded-tiny mb-10">
                  <p className="text-sm font-medium text-charcoal italic">{excerpt}</p>
                </div>
              )}
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">{content}</div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
