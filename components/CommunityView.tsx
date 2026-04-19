'use client';

import { useState, useCallback } from 'react';
import {
  MessageSquare, MapPin, Star, ThumbsUp, Pin, CheckCircle2,
  Send, Plus, X, ChevronDown, ChevronUp, Flag, Clock, Shield,
  HelpCircle, FileText, Loader2, AlertTriangle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// ── Content Safety ──
const BANNED_PATTERNS = [
  /https?:\/\/[^\s]+/gi,            // URLs
  /www\.[^\s]+\.[a-z]{2,}/gi,       // www.anything
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // email
  /(\+?[\d][\s.-]?){7,15}/g,        // phone numbers
  /(?:0|91)?[6-9]\d{9}/g,           // India mobile
];

function sanitize(text: string): { clean: string; blocked: boolean } {
  let clean = text;
  let blocked = false;
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(clean)) { blocked = true; break; }
    clean = clean.replace(pattern, '[removed]');
    pattern.lastIndex = 0;
  }
  return { clean, blocked };
}

// ── Star Rating ──
function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n} type="button"
          onClick={() => !readonly && onChange?.(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-all ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-125'}`}
          disabled={readonly}
        >
          <Star className={`w-5 h-5 ${(hovered || value) >= n ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
        </button>
      ))}
    </div>
  );
}

// ── Comment Item ──
function CommentItem({ comment, currentUser, onReply, isAnswer = false, isPinned = false, onPin }: any) {
  return (
    <div className={`flex gap-3 ${isPinned ? 'bg-green-pale/20 border border-green/20 rounded-2xl p-4' : ''}`}>
      <div className="w-8 h-8 bg-green-pale rounded-full flex items-center justify-center font-bold text-green text-sm flex-shrink-0">
        {comment.authorName?.[0] || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm text-charcoal">{comment.authorName}</span>
          {isPinned && <span className="flex items-center gap-1 px-2 py-0.5 bg-green text-white text-[9px] font-bold uppercase rounded-full"><Pin className="w-2.5 h-2.5" /> Pinned Answer</span>}
          <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{comment.text}</p>
        <div className="flex items-center gap-3 mt-2">
          {onReply && currentUser && (
            <button onClick={() => onReply(comment)} className="text-[11px] font-bold text-gray-400 hover:text-green transition-colors">Reply</button>
          )}
          {onPin && currentUser && (
            <button onClick={() => onPin(comment._id)} className="text-[11px] font-bold text-gray-400 hover:text-green transition-colors flex items-center gap-1">
              <Pin className="w-3 h-3" /> {isPinned ? 'Unpin' : 'Pin as Answer'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Post Card ──
function PostCard({ post, currentUser, onRate, onComment, onPinAnswer, type = 'post' }: any) {
  const [expanded, setExpanded] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const avgRating = post.ratings?.length > 0
    ? (post.ratings.reduce((a: number, r: any) => a + r.value, 0) / post.ratings.length).toFixed(1)
    : null;
  const userExistingRating = post.ratings?.find((r: any) => r.user === currentUser?.email)?.value;

  const handleComment = async () => {
    if (!commentText.trim() || !currentUser) return;
    const { blocked: isBlocked } = sanitize(commentText);
    if (isBlocked) { setBlocked(true); return; }
    setBlocked(false);
    setSubmitLoading(true);
    await onComment(post._id, commentText);
    setCommentText('');
    setCommenting(false);
    setSubmitLoading(false);
  };

  const handleRate = async (value: number) => {
    if (!currentUser) return;
    setUserRating(value);
    await onRate(post._id, value);
  };

  return (
    <div className={`bg-white rounded-3xl border shadow-tiny-sm hover:shadow-tiny transition-all ${type === 'question' ? 'border-blue-100' : 'border-gray-100'}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-green-pale/50 text-green rounded-full flex items-center justify-center font-bold flex-shrink-0">
            {post.authorName?.[0] || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-charcoal">{post.authorName}</span>
              {post.isAnnouncement && <span className="px-2 py-0.5 bg-green text-white text-[9px] font-bold uppercase rounded-full">Announcement</span>}
              {type === 'question' && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold uppercase rounded-full flex items-center gap-1"><HelpCircle className="w-2.5 h-2.5" /> Question</span>}
              <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            {post.location && <div className="flex items-center gap-1 text-[10px] text-green font-bold mt-0.5"><MapPin className="w-3 h-3" />{post.location}</div>}
          </div>
        </div>

        <h3 className="font-bold text-charcoal text-base mb-2">{post.title}</h3>
        <p className={`text-sm text-gray-500 leading-relaxed ${!expanded && 'line-clamp-3'}`}>{post.content}</p>
        {post.content?.length > 200 && (
          <button onClick={() => setExpanded(!expanded)} className="text-green text-xs font-bold mt-1 flex items-center gap-1 hover:underline">
            {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
          </button>
        )}

        {/* Photos */}
        {post.photos?.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {post.photos.slice(0, 3).map((p: string, i: number) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden">
                <img src={p} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Rating */}
        {type === 'post' && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <StarRating value={userExistingRating || userRating} onChange={handleRate} readonly={!!userExistingRating} />
              {avgRating && <span className="text-sm font-bold text-charcoal">{avgRating}</span>}
              <span className="text-xs text-gray-400">({post.ratings?.length || 0} ratings)</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 mt-3">
          <button onClick={() => setCommenting(!commenting)} className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-green transition-colors">
            <MessageSquare className="w-4 h-4" />
            {post.comments?.length || 0} {type === 'question' ? 'Answer(s)' : 'Comment(s)'}
          </button>
        </div>
      </div>

      {/* Comments / Answers */}
      {(commenting || (post.comments?.length > 0)) && (
        <div className="px-6 pb-6 border-t border-gray-50 pt-4 space-y-4">
          {/* Pinned answer first */}
          {type === 'question' && post.comments?.filter((c: any) => c._id === post.pinnedAnswer).map((c: any) => (
            <CommentItem key={c._id} comment={c} currentUser={currentUser} isPinned={true}
              onPin={post.authorEmail === currentUser?.email ? (id: string) => onPinAnswer(post._id, id) : undefined} />
          ))}
          {post.comments?.filter((c: any) => c._id !== post.pinnedAnswer).map((c: any) => (
            <CommentItem key={c._id} comment={c} currentUser={currentUser} isAnswer={type === 'question'}
              onPin={type === 'question' && post.authorEmail === currentUser?.email ? (id: string) => onPinAnswer(post._id, id) : undefined} />
          ))}

          {/* Comment Input */}
          {currentUser && commenting && (
            <div className="space-y-2 pt-2">
              {blocked && (
                <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4" /> Links, emails and phone numbers are not allowed in {type === 'question' ? 'answers' : 'comments'}.
                </div>
              )}
              <div className="flex gap-2">
                <textarea
                  value={commentText}
                  onChange={e => { setCommentText(e.target.value); setBlocked(false); }}
                  placeholder={type === 'question' ? 'Write your answer...' : 'Write a comment...'}
                  rows={2}
                  className="flex-1 px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green/20 transition-all resize-none"
                />
                <button onClick={handleComment} disabled={submitLoading || !commentText.trim()}
                  className="px-4 py-2.5 bg-green text-white rounded-xl hover:bg-green-dark transition-all disabled:opacity-50 flex-shrink-0">
                  {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
          {!currentUser && <p className="text-xs text-gray-400 italic">Log in to {type === 'question' ? 'answer' : 'comment'}</p>}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──
export default function CommunityView({ data, user }: { data: any; user?: any }) {
  const [activeTab, setActiveTab] = useState<'posts' | 'questions'>('posts');
  const { community, posts: init, isMember: initMember } = data;
  const [posts, setPosts] = useState<any[]>(init || []);
  const [isMember, setIsMember] = useState(initMember);
  const [isPosting, setIsPosting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', location: '', type: 'post' as 'post' | 'question' });
  const router = useRouter();

  const forumPosts = posts.filter(p => p.type !== 'question');
  const questions = posts.filter(p => p.type === 'question');

  const handleJoin = async () => {
    if (!user) { router.push('/login'); return; }
    setIsJoining(true);
    try {
      const res = await fetch(`/api/communities/${community._id}/join`, { method: 'POST' });
      if (res.ok) { setIsMember(true); router.refresh(); }
    } finally { setIsJoining(false); }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push('/login'); return; }
    if (!isMember) { alert('Join this community first.'); return; }
    const { blocked: b } = sanitize(newPost.content + ' ' + newPost.title);
    if (b) { setBlocked(true); return; }
    setBlocked(false);
    setIsPosting(true);
    try {
      const res = await fetch(`/api/communities/${community._id}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPost, area: community.area }),
      });
      if (res.ok) {
        const post = await res.json();
        setPosts([post, ...posts]);
        setNewPost({ title: '', content: '', location: '', type: newPost.type });
        setShowForm(false);
      }
    } finally { setIsPosting(false); }
  };

  const handleRate = useCallback(async (postId: string, value: number) => {
    if (!user) { router.push('/login'); return; }
    const res = await fetch(`/api/communities/${community._id}/posts/${postId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, ratings: updated.ratings } : p));
    }
  }, [community._id, user, router]);

  const handleComment = useCallback(async (postId: string, text: string) => {
    if (!user) { router.push('/login'); return; }
    const res = await fetch(`/api/communities/${community._id}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: updated.comments } : p));
    }
  }, [community._id, user, router]);

  const handlePinAnswer = useCallback(async (postId: string, commentId: string) => {
    const res = await fetch(`/api/communities/${community._id}/posts/${postId}/pin`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, pinnedAnswer: updated.pinnedAnswer } : p));
    }
  }, [community._id]);

  const displayPosts = activeTab === 'posts' ? forumPosts : questions;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-tiny-sm border border-gray-100 sticky top-24">
          <div className="w-14 h-14 bg-green text-white rounded-2xl flex items-center justify-center mb-4 text-2xl">🏘️</div>
          <h1 className="text-xl font-bold text-charcoal mb-1">{community.name}</h1>
          <div className="flex items-center gap-1.5 text-xs text-green font-bold mb-3">
            <MapPin className="w-3.5 h-3.5" /> {community.area}
          </div>
          <p className="text-gray-500 text-sm leading-relaxed mb-5">{community.description}</p>

          {!isMember ? (
            <button onClick={handleJoin} disabled={isJoining}
              className="w-full py-3 bg-green text-white font-bold rounded-2xl hover:bg-green-dark transition-all shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Join Community</>}
            </button>
          ) : (
            <div className="flex items-center gap-2 text-green font-bold text-sm bg-green-pale/30 px-4 py-3 rounded-2xl">
              <CheckCircle2 className="w-4 h-4" /> Member
            </div>
          )}

          <div className="mt-5 pt-5 border-t border-gray-50 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 font-medium">Posts</span>
              <span className="font-bold text-charcoal">{forumPosts.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 font-medium">Questions</span>
              <span className="font-bold text-charcoal">{questions.length}</span>
            </div>
          </div>

          {community.rules && (
            <div className="mt-5 pt-5 border-t border-gray-50">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Shield className="w-3 h-3" /> Community Rules</div>
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl leading-relaxed">{community.rules}</div>
            </div>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="lg:col-span-3 space-y-6">
        {/* Tabs */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-tiny-sm border border-gray-100">
            {([['posts', FileText, 'Posts'], ['questions', HelpCircle, 'Q&A']] as const).map(([tab, Icon, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-green text-white shadow-md' : 'text-gray-400 hover:text-charcoal'}`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {isMember && (
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-5 py-2.5 bg-charcoal text-white font-bold rounded-2xl hover:bg-black transition-all text-sm shadow-lg">
              <Plus className="w-4 h-4" />
              {activeTab === 'questions' ? 'Ask Question' : 'Post Update'}
            </button>
          )}
        </div>

        {/* Post Form */}
        {showForm && isMember && (
          <div className="bg-white rounded-3xl p-6 shadow-tiny border border-gray-200 animate-fade-in">
            <h3 className="font-bold text-charcoal mb-4 flex items-center gap-2">
              {activeTab === 'questions' ? <><HelpCircle className="w-5 h-5 text-blue-500" /> Ask a Question</> : <><Plus className="w-5 h-5 text-green" /> Share with Community</>}
            </h3>
            {blocked && (
              <div className="mb-4 flex items-center gap-2 text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-200">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Links, email addresses, and phone numbers are not allowed in community posts.
              </div>
            )}
            <form onSubmit={handlePost} className="space-y-4">
              <input required value={newPost.title}
                onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                placeholder={activeTab === 'questions' ? 'What is your question?' : 'Post title...'}
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-green/20 outline-none text-sm font-medium transition-all"
              />
              <textarea required value={newPost.content}
                onChange={e => { setNewPost({ ...newPost, content: e.target.value }); setBlocked(false); }}
                placeholder={activeTab === 'questions' ? 'Describe your question in detail (500-600 words recommended)...' : 'Share your photo, rent details, location, experience... (500-600 words recommended)'}
                rows={6}
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-green/20 outline-none text-sm font-medium transition-all resize-none"
              />
              <div className="flex items-center gap-1 text-right">
                <span className={`text-xs ml-auto ${newPost.content.split(/\s+/).filter(Boolean).length < 500 ? 'text-gray-400' : 'text-green font-bold'}`}>
                  {newPost.content.split(/\s+/).filter(Boolean).length} / 500 words
                </span>
              </div>
              <div className="flex gap-3">
                <input value={newPost.location}
                  onChange={e => setNewPost({ ...newPost, location: e.target.value })}
                  placeholder="Your location (city, state)"
                  className="flex-1 px-4 py-3 bg-gray-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-green/20 outline-none text-sm font-medium transition-all"
                />
              </div>
              <input type="hidden" value={activeTab === 'questions' ? 'question' : 'post'} name="type" />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-gray-400 font-bold rounded-2xl hover:bg-gray-50 transition-all text-sm">Cancel</button>
                <button type="submit" disabled={isPosting}
                  className="px-8 py-3 bg-green text-white font-bold rounded-2xl hover:bg-green-dark transition-all shadow-lg text-sm flex items-center gap-2 disabled:opacity-50">
                  {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit for Review
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center">Posts are reviewed by admin before publishing. You'll receive an email notification.</p>
            </form>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-5">
          {displayPosts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-4">{activeTab === 'questions' ? '🤔' : '📋'}</div>
              <p className="font-medium">No {activeTab === 'questions' ? 'questions' : 'posts'} yet. Be the first!</p>
            </div>
          ) : (
            displayPosts.map(post => (
              <PostCard key={post._id} post={post} currentUser={user}
                type={post.type === 'question' ? 'question' : 'post'}
                onRate={handleRate} onComment={handleComment} onPinAnswer={handlePinAnswer}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
