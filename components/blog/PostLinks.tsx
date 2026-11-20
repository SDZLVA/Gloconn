import Link from "next/link";
import { otherPosts, relatedRoutesForPost } from "@/lib/blog/related";
import { BLOG_POSTS, postDate, type BlogPostMeta } from "@/lib/blog/posts";

/** Milestone 73 — end of a blog post: flight routes to the places in it, and more posts to read. */
export function PostLinks({ post }: { post: BlogPostMeta }) {
  const routes = relatedRoutesForPost(post);
  const more = otherPosts(post, BLOG_POSTS);
  if (routes.length === 0 && more.length === 0) return null;
  return (
    <aside className="mt-12 space-y-8 border-t border-slate-200 pt-8">
      {routes.length > 0 && (
        <section aria-labelledby="post-routes" className="space-y-3">
          <h2 id="post-routes" className="text-xl font-bold text-slate-900">
            Cheap flights to the places in this guide
          </h2>
          <ul className="flex flex-wrap gap-2">
            {routes.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/flights/${r.slug}`}
                  className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-brand-700 hover:text-brand-700"
                >
                  Flights from {r.from.name} to {r.to.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {more.length > 0 && (
        <section aria-labelledby="more-posts" className="space-y-3">
          <h2 id="more-posts" className="text-xl font-bold text-slate-900">
            More travel ideas
          </h2>
          <ul className="space-y-2">
            {more.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="font-semibold text-brand-700 hover:text-brand-900">
                  {p.title}
                </Link>
                <span className="ml-2 text-xs text-slate-500">{postDate(p.published)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
