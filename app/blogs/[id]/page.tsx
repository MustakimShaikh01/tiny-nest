import type { Metadata } from 'next';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { getSession } from '../../../lib/auth';
import { getDb } from '../../../lib/db';
import { Calendar, Clock, ArrowRight, User, Share2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinynest.com';

async function getBlog(id: string) {
  const db = await getDb();
  return db.blogs.find((b: any) => b.id === id);
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const blog = await getBlog(params.id);

  if (!blog) {
    return {
      title: 'Article Not Found | TinyNest Blog',
      description: 'This article could not be found.',
    };
  }

  const title = `${blog.title} | TinyNest Blog`;
  const description = blog.excerpt || blog.content?.slice(0, 155) || 'Read expert tiny house tips and advice on TinyNest.';
  const canonical = `${siteUrl}/blogs/${blog.id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      publishedTime: blog.date,
      authors: ['TinyNest Editorial Team'],
      section: blog.category,
      tags: [blog.category, 'tiny house', 'tiny home', 'tiny living'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const blog = await getBlog(params.id);

  if (!blog) notFound();

  // JSON-LD: BlogPosting / Article schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.excerpt,
    datePublished: blog.date,
    dateModified: blog.date,
    author: {
      '@type': 'Organization',
      name: 'TinyNest Editorial Team',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TinyNest',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blogs/${blog.id}`,
    },
    articleSection: blog.category,
    keywords: [blog.category, 'tiny house', 'tiny home', 'tiny living', 'minimalism'],
    url: `${siteUrl}/blogs/${blog.id}`,
    inLanguage: 'en-US',
    about: {
      '@type': 'Thing',
      name: 'Tiny Houses',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blogs` },
      { '@type': 'ListItem', position: 3, name: blog.title, item: `${siteUrl}/blogs/${blog.id}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="min-h-screen bg-white">
        <Nav user={session?.user} />

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="max-w-4xl mx-auto px-4 pt-6">
          <ol className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <li><Link href="/" className="hover:text-green transition-colors">Home</Link></li>
            <li aria-hidden="true"><span>/</span></li>
            <li><Link href="/blogs" className="hover:text-green transition-colors">Blog</Link></li>
            <li aria-hidden="true"><span>/</span></li>
            <li className="text-charcoal truncate max-w-[200px]" aria-current="page">{blog.category}</li>
          </ol>
        </nav>

        <article className="max-w-4xl mx-auto px-4 py-16" itemScope itemType="https://schema.org/BlogPosting">
          <meta itemProp="headline" content={blog.title} />
          <meta itemProp="description" content={blog.excerpt} />
          <meta itemProp="datePublished" content={blog.date} />
          <meta itemProp="author" content="TinyNest Editorial Team" />

          <header className="mb-14 text-center">
            <Link href="/blogs" className="group inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-green transition-colors mb-10">
              <ArrowRight className="w-4 h-4 rotate-180 transition-transform group-hover:-translate-x-1" aria-hidden="true" /> All Articles
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-pale text-green rounded-full text-[10px] font-bold tracking-widest uppercase mb-6" itemProp="articleSection">
              {blog.category}
            </div>

            <h1 className="font-serif text-5xl lg:text-7xl font-bold text-charcoal mb-10 leading-[1.1] tracking-tight" itemProp="name">
              {blog.title}
            </h1>

            <div className="flex items-center justify-center gap-10 text-xs font-bold uppercase tracking-widest text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-light" aria-hidden="true" />
                <time dateTime={blog.date} itemProp="datePublished">{blog.date}</time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-light" aria-hidden="true" />
                <span>{blog.readTime}</span>
              </div>
              <div className="flex items-center gap-2" itemProp="author" itemScope itemType="https://schema.org/Organization">
                <User className="w-4 h-4 text-green-light" aria-hidden="true" />
                <span itemProp="name">TINYNEST TEAM</span>
              </div>
            </div>
          </header>

          <div className="aspect-[21/9] bg-green-pale rounded-tiny shadow-2xl flex items-center justify-center text-9xl mb-20 relative overflow-hidden group" aria-hidden="true">
            <span className="group-hover:scale-105 transition-transform duration-700">{blog.emoji}</span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          <div
            className="prose prose-lg lg:prose-xl max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:font-medium prose-p:text-gray-500 prose-p:leading-relaxed"
            itemProp="articleBody"
          >
            <p className="text-xl lg:text-3xl text-charcoal mb-12 italic font-serif border-l-8 border-green-pale pl-10 leading-relaxed">
              {blog.excerpt}
            </p>

            <div className="whitespace-pre-line text-lg text-gray-600 space-y-8 font-medium leading-loose">
              {blog.content}

              {'\n\n'}
              The tiny house movement continues to grow rapidly in 2026, with more Americans choosing to
              downsize and simplify their lives. Whether motivated by financial freedom, environmental
              consciousness, or a desire for adventure, tiny home owners consistently report higher life
              satisfaction than their counterparts in traditional housing.

              {'\n\n'}
              <strong>Key Takeaways:</strong>
              {'\n'}
              • Research your target area&apos;s zoning laws before committing to a purchase.
              {'\n'}
              • Get pre-approved for financing before searching for homes.
              {'\n'}
              • Visit at least 3-5 tiny homes in person before buying.
              {'\n'}
              • Connect with the tiny home community for real-world advice.
            </div>

            {/* Related Resources – Google Docs & PDF links */}
            <div className="mt-16 p-10 bg-green-pale/30 rounded-3xl border border-green-pale not-prose">
              <h3 className="font-serif text-2xl font-bold text-charcoal mb-6">📚 Related Resources</h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="https://drive.google.com/file/d/1SWqzToHyludoVLrV2U90fCo17Axj9gRk/view"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-green font-bold hover:underline"
                    aria-label="Download Tiny House Buyer's Checklist PDF"
                  >
                    📄 Tiny House Buyer&apos;s Checklist 2026 (PDF Guide)
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://drive.google.com/file/d/1qr_BeiaLUEn0xj-29EeHZRACqODZ73a_/view"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-green font-bold hover:underline"
                    aria-label="View Tiny House Zoning Laws by State 2026"
                  >
                    ⚖️ Zoning Laws by State – 2026 (Google Sheets)
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.google.com/document/d/1tiny_financing_guide_2026/view"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-green font-bold hover:underline"
                    aria-label="Read Tiny House Financing Guide"
                  >
                    💰 Tiny House Financing Guide (Google Doc)
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <footer className="mt-24 pt-16 border-t border-gray-100 flex items-center justify-between gap-12">
            <div className="flex items-center gap-6" itemProp="author" itemScope itemType="https://schema.org/Organization">
              <div className="w-16 h-16 rounded-full bg-green text-white flex items-center justify-center font-serif text-2xl font-bold shadow-xl" aria-hidden="true">T</div>
              <div>
                <div className="font-bold text-charcoal text-lg mb-1" itemProp="name">TinyNest Editorial Team</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Expert insights on the tiny living movement</div>
              </div>
            </div>
            <button
              id={`share-blog-${blog.id}`}
              className="btn bg-gray-50 text-gray-400 hover:text-green hover:bg-green-pale p-5 rounded-tiny-sm transition-all group"
              aria-label="Share this article"
            >
              <Share2 className="w-6 h-6 group-hover:scale-110 transition-transform" aria-hidden="true" />
            </button>
          </footer>
        </article>

        <section className="bg-cream py-24 mb-0" aria-label="Call to action">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="font-serif text-4xl font-bold text-charcoal mb-10 leading-tight tracking-tight">
              Inspired to find your tiny home?
            </h2>
            <Link
              href="/listings"
              id="blog-cta-search"
              className="btn btn-primary px-12 py-5 shadow-2xl hover:-translate-y-1 transition-all"
            >
              Start Your Search Today
            </Link>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
