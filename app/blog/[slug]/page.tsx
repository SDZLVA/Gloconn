import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POST_BODIES } from "@/components/blog/registry";
import { BLOG_POSTS, findPost, postDate } from "@/lib/blog/posts";

/** Milestone 63 — one blog post. Price boxes inside refresh every 12 hours. */

export const revalidate = 43200;
export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.published },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = findPost(slug);
  const Body = post ? POST_BODIES[post.slug] : undefined;
  if (!post || !Body) notFound();
  const today = new Date().toISOString().slice(0, 10);
  return (
    <article className="mx-auto max-w-3xl">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link href="/blog" className="font-semibold text-brand-700 hover:text-brand-900">
          Travel blog
        </Link>
      </nav>
      <header className="mt-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">{post.title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          By the Glooconn team · {postDate(post.updated ?? post.published)} · {post.readMinutes} min read
        </p>
      </header>
      <div className="mt-6">
        <Body today={today} />
      </div>
    </article>
  );
}
