import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Send, Image as ImageIcon, MapPin, Hash, Heart, 
  MessageCircle, Share2, MoreHorizontal, Trash2, Flag, AlertCircle, X, Check 
} from 'lucide-react';
import { postsApi, authApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import ScrollReveal from './ScrollReveal';

export interface PostType {
  _id: string;
  user?: { _id: string; name: string; email?: string; role?: string };
  author?: { name: string; avatar?: string };
  content: string;
  image?: string;
  likes: any[];
  comments: any[];
  shares?: number;
  hashtags?: string[];
  tags?: string[];
  createdAt: string;
  isReported?: boolean;
}

const REPORT_REASONS = [
  { id: 'spam', label: 'Spam or Advertisement' },
  { id: 'offensive', label: 'Offensive or Abusive Content' },
  { id: 'fake', label: 'Fake Place or Misleading Information' },
  { id: 'inappropriate', label: 'Inappropriate or Unsafe' },
  { id: 'other', label: 'Other Concern' }
];

const CommunitySection = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Reporting State
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await postsApi.getAllPosts();
      if (res.success && res.data) {
        setPosts(res.data as PostType[]);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    authApi.getCurrentUser().then(res => {
      if (res.success && res.user) {
        setCurrentUser(res.user);
      }
    }).catch(() => {});
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      setPosting(true);
      const res = await postsApi.createPost({
        content: newPostContent.trim(),
        image: newPostImage.trim() || undefined,
      });

      if (res.success) {
        toast({ title: 'Post published!', description: 'Your food discovery is live for the community.' });
        setNewPostContent('');
        setNewPostImage('');
        setShowImageInput(false);
        fetchPosts();
      } else {
        toast({ title: 'Error', description: res.error || 'Failed to publish post', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await postsApi.toggleLike(postId);
      if (res.success) {
        fetchPosts();
      }
    } catch {
      toast({ title: 'Error', description: 'Please login to like posts', variant: 'destructive' });
    }
  };

  const handleComment = async (postId: string) => {
    if (!commentText.trim()) return;
    try {
      const res = await postsApi.addComment(postId, commentText.trim());
      if (res.success) {
        setCommentText('');
        setActiveCommentPostId(null);
        fetchPosts();
        toast({ title: 'Comment posted!' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to post comment', variant: 'destructive' });
    }
  };

  const handleShare = async (postId: string) => {
    try {
      await postsApi.sharePost(postId);
      if (navigator.share) {
        navigator.share({
          title: 'FoodYatra Community',
          url: window.location.href,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Link copied!', description: 'Post link copied to clipboard.' });
      }
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await postsApi.deletePost(postId);
      if (res.success) {
        toast({ title: 'Post deleted' });
        fetchPosts();
      } else {
        toast({ title: 'Error', description: res.error || 'Could not delete post', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete post', variant: 'destructive' });
    }
  };

  const handleSubmitReport = async () => {
    if (!reportingPostId) return;
    try {
      setIsSubmittingReport(true);
      const res = await postsApi.reportPost(reportingPostId, reportReason, reportDetails);
      if (res.success) {
        toast({
          title: 'Report Submitted',
          description: 'Thank you for keeping FoodYatra safe. Admins will review this post.'
        });
        setReportingPostId(null);
        setReportDetails('');
      } else {
        toast({
          title: 'Report Failed',
          description: res.error || 'Could not submit report',
          variant: 'destructive'
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to submit report',
        variant: 'destructive'
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <section className="py-20 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      <div className="max-w-3xl mx-auto relative z-10 space-y-12">
        <ScrollReveal>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill mb-4 border border-primary/20 bg-primary/10">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Vadodara Foodie Community</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold mb-3">
              Share Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Culinary Discoveries</span>
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Post your favorite street food spots, honest food reviews, and food walk memories.
            </p>
          </div>
        </ScrollReveal>

        {/* Create Post Card */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-xl backdrop-blur-md">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What delicious food did you discover in Vadodara today? #SevUsal #Alkapuri..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 transition-all resize-none min-h-[100px]"
            />

            {showImageInput && (
              <div className="relative animate-in fade-in">
                <ImageIcon className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  value={newPostImage}
                  onChange={(e) => setNewPostImage(e.target.value)}
                  placeholder="Paste food image URL (e.g. https://...)"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  showImageInput ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-muted-foreground hover:text-foreground'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>{showImageInput ? 'Image URL Added' : 'Add Photo'}</span>
              </button>

              <button
                type="submit"
                disabled={posting || !newPostContent.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:brightness-110 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{posting ? 'Posting...' : 'Share Discovery'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Loading community stories...
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => {
              const authorName = post.user?.name || post.author?.name || 'Vadodara Foodie';
              const isOwner = currentUser && (currentUser.id === post.user?._id || currentUser.id === post.user?.toString());
              const isAdmin = currentUser && currentUser.role === 'admin';

              return (
                <ScrollReveal key={post._id}>
                  <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-lg space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-orange-500 to-amber-500 flex items-center justify-center font-bold text-white shadow">
                          {authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-sm text-foreground">{authorName}</h4>
                            {post.user?.role === 'admin' && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-primary/20 text-primary font-bold border border-primary/30">
                                Staff
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Report Button */}
                        <button
                          onClick={() => setReportingPostId(post._id)}
                          className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-amber-400 transition-colors"
                          title="Report Post for Moderation"
                        >
                          <Flag className="w-4 h-4" />
                        </button>

                        {/* Delete Button (Owner or Admin) */}
                        {(isOwner || isAdmin) && (
                          <button
                            onClick={() => handleDelete(post._id)}
                            className="p-1.5 rounded-full hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-colors"
                            title="Delete Post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {/* Image */}
                    {post.image && (
                      <div className="rounded-2xl overflow-hidden max-h-96 w-full bg-black/40 border border-white/10">
                        <img
                          src={post.image}
                          alt="Food post"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {post.hashtags.map((tag, idx) => (
                          <span key={idx} className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(post._id)}
                          className="flex items-center gap-1.5 text-muted-foreground hover:text-rose-400 transition-colors font-medium"
                        >
                          <Heart className="w-4 h-4" />
                          <span>{post.likes?.length || 0}</span>
                        </button>

                        <button
                          onClick={() => setActiveCommentPostId(activeCommentPostId === post._id ? null : post._id)}
                          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors font-medium"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments?.length || 0}</span>
                        </button>

                        <button
                          onClick={() => handleShare(post._id)}
                          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-medium"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>{post.shares || 0}</span>
                        </button>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {activeCommentPostId === post._id && (
                      <div className="pt-3 border-t border-white/10 space-y-3 animate-in fade-in">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleComment(post._id)}
                            placeholder="Add a comment..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                          />
                          <button
                            onClick={() => handleComment(post._id)}
                            disabled={!commentText.trim()}
                            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 disabled:opacity-50"
                          >
                            Reply
                          </button>
                        </div>

                        {post.comments && post.comments.length > 0 && (
                          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                            {post.comments.map((c: any, i: number) => (
                              <div key={c._id || i} className="p-2.5 rounded-xl bg-white/5 text-xs space-y-0.5">
                                <span className="font-bold text-primary mr-1.5">{c.user?.name || 'Foodie'}:</span>
                                <span className="text-foreground/90">{c.content}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              );
            })
          ) : (
            <div className="text-center py-16 bg-card rounded-3xl border border-white/10 text-muted-foreground text-sm">
              No community posts yet. Be the first to share a food review!
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {reportingPostId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-foreground"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertCircle className="w-5 h-5" />
                  <h3 className="font-bold text-base text-foreground">Report Community Post</h3>
                </div>
                <button
                  onClick={() => setReportingPostId(null)}
                  className="p-1 rounded-full hover:bg-white/10 text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Help us keep FoodYatra authentic and safe. Why are you reporting this post?
              </p>

              <div className="space-y-2">
                {REPORT_REASONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setReportReason(r.id)}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                      reportReason === r.id
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-white/10 bg-white/5 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>{r.label}</span>
                    {reportReason === r.id && <Check className="w-4 h-4 text-primary" />}
                  </button>
                ))}
              </div>

              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Additional details (optional)..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none h-20"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportingPostId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReport}
                  disabled={isSubmittingReport}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CommunitySection;
