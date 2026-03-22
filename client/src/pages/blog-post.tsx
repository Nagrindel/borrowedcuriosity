import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import Comments from "@/components/comments";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: string;
  readingTime: string;
  gradient: string;
  imageUrl: string | null;
  createdAt: string;
}

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["blog", slug],
    queryFn: () => apiRequest(`/api/blog/${slug}`),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6">
        <div>
          <h1 className="font-display text-4xl font-bold mb-4">Post not found</h1>
          <p className="text-gray-500 mb-6">This post doesn't exist or has been removed.</p>
          <Link href="/blog"><span className="btn-primary cursor-pointer">Back to Blog</span></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <article className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/blog">
            <span className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-400 transition-colors cursor-pointer mb-8">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </span>
          </Link>

          <div className={`w-full aspect-video rounded-2xl bg-gradient-to-br ${post.gradient} mb-8 overflow-hidden`}>
            {post.imageUrl && (
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            )}
          </div>

          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass text-xs font-medium text-brand-500">
              <Tag className="w-3 h-3" /> {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" /> {post.readingTime}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-8">
            {post.title}
          </h1>

          {/<[a-z][\s\S]*>/i.test(post.content) ? (
            <div
              className="prose prose-lg dark:prose-invert max-w-none mb-16
                prose-headings:font-display prose-headings:text-gray-900 dark:prose-headings:text-white
                prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-p:leading-relaxed
                prose-a:text-brand-500 prose-strong:text-gray-800 dark:prose-strong:text-gray-200
                prose-ul:text-gray-600 dark:prose-ul:text-gray-400
                prose-ol:text-gray-600 dark:prose-ol:text-gray-400"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <div className="prose prose-lg dark:prose-invert max-w-none mb-16">
              {post.content.split("\n\n").map((paragraph, i) => (
                <p key={i} className="text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </motion.div>

        <Comments targetType="blog" targetId={post.id} />
      </article>
    </div>
  );
}
