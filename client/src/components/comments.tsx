import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

interface CommentsProps {
  targetType: "blog" | "gallery" | "course";
  targetId: number;
}

export default function Comments({ targetType, targetId }: CommentsProps) {
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const qc = useQueryClient();

  const { data: commentList = [] } = useQuery<Comment[]>({
    queryKey: ["comments", targetType, targetId],
    queryFn: () => apiRequest(`/api/comments/${targetType}/${targetId}`),
  });

  const postComment = useMutation({
    mutationFn: () => apiRequest("/api/comments", {
      method: "POST",
      body: JSON.stringify({ targetType, targetId, author: author.trim(), content: content.trim() }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", targetType, targetId] });
      setContent("");
    },
  });

  const canSubmit = author.trim().length > 0 && content.trim().length > 0 && !postComment.isPending;

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display font-semibold text-lg mb-5 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-brand-500" />
        Comments ({commentList.length})
      </h3>

      {/* Form */}
      <div className="space-y-3 mb-6">
        <input
          value={author}
          onChange={e => setAuthor(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-brand-500/50 outline-none text-sm"
        />
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="flex-1 px-4 py-3 rounded-xl glass border border-white/10 focus:border-brand-500/50 outline-none text-sm resize-none"
          />
          <button
            onClick={() => postComment.mutate()}
            disabled={!canSubmit}
            className="btn-primary self-end px-4 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {commentList.map(c => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 p-3 rounded-xl glass"
            >
              <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{c.author}</span>
                  <span className="text-[11px] text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{c.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {commentList.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-6">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}
