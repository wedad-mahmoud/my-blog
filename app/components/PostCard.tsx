"use client";

import { useState } from "react";
import {
  createComment,
  deletePost,
  deleteComment,
  updatePost,
  updateComment,
} from "@/app/actions/posts";

type Author = {
  id: string;
  name: string | null;
  email: string;
};

type Comment = {
  id: string;
  text: string;
  authorId: string;
  author: Author;
  createdAt: Date;
};

type Post = {
  id: string;
  content: string;
  authorId: string;
  author: Author;
  comments: Comment[];
  createdAt: Date;
};

export default function PostCard({
  post,
  currentUserId,
}: {
  post: Post;
  currentUserId: string | null;
}) {
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);

  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState(post.content);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  async function handleDeletePost() {
    if (!confirm("متأكد بدك تحذف البوست؟")) return;
    await deletePost(post.id);
  }

  async function handleUpdatePost() {
    if (!editPostContent.trim()) return;
    setLoading(true);
    const result = await updatePost(post.id, editPostContent);
    if (result.success) setIsEditingPost(false);
    else alert(result.error);
    setLoading(false);
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setLoading(true);
    const result = await createComment(post.id, commentText);
    if (result.success) setCommentText("");
    else alert(result.error);
    setLoading(false);
  }

  async function handleDeleteComment(id: string) {
    if (!confirm("متأكد بدك تحذف الكومنت؟")) return;
    await deleteComment(id);
  }

  function startEditComment(comment: Comment) {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.text);
  }

  async function handleUpdateComment(id: string) {
    if (!editCommentText.trim()) return;
    setLoading(true);
    const result = await updateComment(id, editCommentText);
    if (result.success) {
      setEditingCommentId(null);
      setEditCommentText("");
    } else alert(result.error);
    setLoading(false);
  }

  const timeAgo = (date: Date | string) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    );
    if (seconds < 60) return "الآن";
    if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
    if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
    return `منذ ${Math.floor(seconds / 86400)} يوم`;
  };

  const isOwner = currentUserId === post.authorId;

  return (
    <div className="glass-card p-6">
      {/* رأس البوست */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
            {(post.author.name || post.author.email)[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white">
              {post.author.name || post.author.email}
            </p>
            <p className="text-xs text-white/50">{timeAgo(post.createdAt)}</p>
          </div>
        </div>

        {/* أزرار التعديل والحذف - تظهر لصاحب البوست */}
        {isOwner && !isEditingPost && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setIsEditingPost(true);
                setEditPostContent(post.content);
              }}
              className="p-2 text-white/50 hover:text-blue-300 hover:bg-white/10 rounded-lg transition-all"
              title="تعديل"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDeletePost}
              className="p-2 text-white/50 hover:text-red-300 hover:bg-white/10 rounded-lg transition-all"
              title="حذف"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* محتوى البوست - عرض */}
      {!isEditingPost && (
        <p className="text-white/90 whitespace-pre-wrap mb-4 leading-relaxed">
          {post.content}
        </p>
      )}

      {/* محتوى البوست - تعديل */}
      {isEditingPost && (
        <div className="mb-4">
          <textarea
            value={editPostContent}
            onChange={(e) => setEditPostContent(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setIsEditingPost(false)}
              className="px-4 py-2 text-sm text-white/70 hover:bg-white/10 rounded-xl transition-all"
            >
              إلغاء
            </button>
            <button
              onClick={handleUpdatePost}
              disabled={loading}
              className="px-4 py-2 text-sm bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl disabled:opacity-50 shadow-lg"
            >
              حفظ
            </button>
          </div>
        </div>
      )}

      {/* الكومنتات */}
      {post.comments.length > 0 && (
        <div className="space-y-3 mb-4 pt-3 border-t border-white/10">
          {post.comments.map((comment) => {
            const isCommentOwner = currentUserId === comment.authorId;

            return (
              <div key={comment.id} className="flex items-start gap-2">
                <div className="w-7 h-7 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-xs font-bold text-white/80 flex-shrink-0">
                  {(comment.author.name || comment.author.email)[0].toUpperCase()}
                </div>
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-white/90">
                      {comment.author.name || comment.author.email}
                    </p>

                    {isCommentOwner && editingCommentId !== comment.id && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditComment(comment)}
                          className="p-1 text-white/40 hover:text-blue-300 transition-all"
                          title="تعديل"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 text-white/40 hover:text-red-300 transition-all"
                          title="حذف"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {editingCommentId !== comment.id && (
                    <p className="text-sm text-white/80 mt-1">{comment.text}</p>
                  )}

                  {editingCommentId === comment.id && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                      <div className="flex justify-end gap-2 mt-1">
                        <button
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditCommentText("");
                          }}
                          className="text-xs text-white/60 hover:text-white/90"
                        >
                          إلغاء
                        </button>
                        <button
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={loading}
                          className="text-xs text-pink-300 hover:text-pink-200 font-medium"
                        >
                          حفظ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* صندوق كتابة كومنت */}
      {currentUserId && (
        <form
          onSubmit={handleAddComment}
          className="flex gap-2 pt-3 border-t border-white/10"
        >
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="اكتب كومنت..."
            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            type="submit"
            disabled={loading || !commentText.trim()}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      )}
    </div>
  );
}