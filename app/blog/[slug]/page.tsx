import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS } from "@/components/blog/registry";
import { PostLinks } from "@/components/blog/PostLinks";
import { JsonLd } from "@/components/seo/JsonLd";
import { PHOTOS, photoUrl } from "@/lib/blog/photos";
import { BLOG_POSTS, findPost, postDate } from "@/lib/blog/posts";
import { getAppConfig } from "@/lib/config";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";

/** Milestone 63 — one blog post. Price boxes inside refresh every 12 hours. */

export const revalidate = 43200;
export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

/** 1200×630 share picture (Open Graph / X large card) cut from the post's photo. */
const shareImage = (photo: keyof typeof PHOTOS) => photoUrl(PHOTOS[photo].id, 1200, 630);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.published,
      ...(post.updated ? { modifiedTime: post.updated } : {}),
      url: `/blog/${post.slug}`,
      images: [{ url: shareImage(post.photo), width: 1200, height: 630, alt: PHOTOS[post.photo].alt }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description, images: [shareImage(post.photo)] },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = findPost(slug);
  const entry = post ? POSTS[post.slug] : undefined;
  if (!post || !entry) notFound();
  const { Body, Hero } = entry;
  const today = new Date().toISOString().slice(0, 10);
  const { siteUrl } = getAppConfig().app;
  return (
    <article className="mx-auto max-w-3xl">
      <JsonLd
        data={[
          articleJsonLd(siteUrl, { ...post, image: shareImage(post.photo) }),
          breadcrumbJsonLd(siteUrl, [
            { name: "Home", path: "/" },
            { name: "Travel blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link href="/blog" className="font-semibold text-brand-700 hover:text-brand-900">
          Travel blog
        </Link>
      </nav>
      <header className="mt-3">
        {Hero && (
          <div className="mb-6 overflow-hidden rounded-3xl shadow-sm">
            <Hero priority />
          </div>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-5xl">{post.title}</h1>
        <p className="mt-3 text-sm text-slate-500">
          By the Glooconn team · {postDate(post.updated ?? post.published)} · {post.readMinutes} min read
        </p>
      </header>
      <div className="mt-8">
        <Body today={today} />
      </div>
      <PostLinks post={post} />
    </article>
  );
}
