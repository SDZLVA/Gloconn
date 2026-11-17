import Link from "next/link";
import { POSTS } from "@/components/blog/registry";
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
        {BLOG_POSTS.map((post) => {
          const Hero = POSTS[post.slug]?.Hero;
          return (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:border-brand-700">
                {Hero && <Hero credit={false} />}
                <div className="p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-700">{post.tags.slice(0, 2).join(" · ")}</p>
                  <h2 className="mt-1 text-2xl font-extrabold text-slate-900">{post.title}</h2>
                  <p className="mt-2 text-slate-600">{post.description}</p>
                  <p className="mt-3 text-xs text-slate-500">
                    {postDate(post.published)} · {post.readMinutes} min read
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
