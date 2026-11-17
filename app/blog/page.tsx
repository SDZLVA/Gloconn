import Link from "next/link";
import { BLOG_POSTS, postDate } from "@/lib/blog/posts";

export const metadata = {
  title: "Travel blog",
  description: "Budget travel ideas from Glooconn: cheap weekend trips, the best months to fly and how to plan a whole trip within your budget.",
  alternates: { canonical: "/blog" },
};

/** Milestone 63 — blog index. */
export default function BlogIndex() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">Travel blog</h1>
        <p className="text-slate-600">Budget travel ideas, with live prices — then plan the whole trip on Glooconn.</p>
      </header>
      <ul className="space-y-4">
        {BLOG_POSTS.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{post.tags.slice(0, 2).join(" · ")}</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">{post.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{post.description}</p>
              <p className="mt-2 text-xs text-slate-500">
                {postDate(post.published)} · {post.readMinutes} min read
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
