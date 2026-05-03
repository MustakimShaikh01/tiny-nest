'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, MessageSquare, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

export function CommunityModeration() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/community/posts?status=pending');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/community/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setPosts(posts.filter(p => p._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-400 font-bold text-xs uppercase tracking-widest"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading posts...</div>;

  if (posts.length === 0) return (
    <div className="bg-white p-24 text-center rounded-[2.5rem] border border-gray-100 shadow-tiny-sm border-dashed border-gray-200">
       <div className="text-4xl mb-6 grayscale opacity-20">💬</div>
       <h3 className="text-xl font-bold text-charcoal mb-2">No posts to review</h3>
       <p className="text-gray-400 max-w-sm mx-auto font-medium">All community posts have been moderated. You're all caught up!</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center text-white shadow-lg">⚠️</div>
        <div>
          <div className="text-amber-800 font-bold text-sm">Action Required</div>
          <div className="text-amber-600 text-xs font-medium">{posts.length} community posts are awaiting review for spam or community guidelines.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <div key={post._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-tiny-sm hover:shadow-tiny transition-all">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-green uppercase tracking-widest bg-green-pale px-2.5 py-1 rounded-full">{post.category || 'Discussion'}</span>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.authorName}</span>
                </div>
                <h4 className="font-bold text-charcoal mb-2">{post.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">{post.content}</p>
                {post.imageUrl && (
                  <img src={post.imageUrl} className="h-32 w-48 object-cover rounded-xl border border-gray-100 mb-4" alt="Post attachment" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => handleStatusUpdate(post._id, 'approved')}
                  className="p-3 bg-green-50 text-green hover:bg-green hover:text-white rounded-xl transition-all"
                  title="Approve Post"
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleStatusUpdate(post._id, 'rejected')}
                  className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                  title="Reject Post"
                >
                  <XCircle className="w-5 h-5" />
                </button>
                <Link 
                  href={`/community/${post._id}`}
                  className="p-3 bg-gray-50 text-gray-400 hover:bg-charcoal hover:text-white rounded-xl transition-all"
                  title="Preview Full Post"
                >
                  <Eye className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
