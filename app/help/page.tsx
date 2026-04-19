import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { getSession } from '../../lib/auth';
import { HelpCircle, Home, CreditCard, Rocket, ChevronRight, Search, BookOpen, MessageSquare, Shield } from 'lucide-react';
import Link from 'next/link';
import SupportForm from '../../components/SupportForm';

const helpArticles = [
  {
    id: 'how-to-list',
    title: 'How to List Your House',
    description: 'Learn how to create an attractive listing that gets noticed by potential buyers and renters.',
    icon: Home,
    category: 'Getting Started',
    content: `
**Step 1: Create Your Account**
Sign up for a free TinyNest account to get started. You'll need a valid email address.

**Step 2: Navigate to "List a Home"**
Click the "List a Home" button in the navigation bar or go to the Seller Portal.

**Step 3: Fill in Essential Information**
- Add a compelling listing title
- Set your price
- Choose whether you're selling or renting

**Step 4: Add Home Specifications**
- Square footage
- Number of bedrooms and bathrooms
- Year built
- A detailed description
- Location

**Step 5: Upload Photos**
Upload high-quality photos of your tiny home. Listings with multiple photos get 4x more views!

**Step 6: Submit for Review**
Your listing will be reviewed by our admin team and published within 24 hours.
    `
  },
  {
    id: 'how-to-make-payments',
    title: 'How to Make Payments',
    description: 'Everything you need to know about the payment process on TinyNest marketplace.',
    icon: CreditCard,
    category: 'Payments',
    content: `
**Connecting with Sellers**
Use our built-in messaging system to negotiate directly with sellers.

**Payment Methods**
TinyNest supports various payment methods to make your transaction smooth and secure:
- Direct bank transfer
- Escrow services
- Financing options

**Security**
All transactions are protected by our end-to-end encrypted messaging system. We recommend using verified escrow services for large transactions.

**Tips for Safe Transactions**
- Always communicate through our platform
- Never share personal financial information in messages
- Use our recommended escrow services
- Report any suspicious activity immediately
    `
  },
  {
    id: 'how-to-start',
    title: 'How to Start with Us',
    description: 'Your complete guide to getting started on TinyNest — from account creation to your first interaction.',
    icon: Rocket,
    category: 'Getting Started',
    content: `
**Welcome to TinyNest!**
TinyNest is the #1 tiny house marketplace in the USA. Here's how to get started:

**For Buyers**
1. Browse our listings to find your dream tiny home
2. Use filters to narrow down by location, price, and type
3. Save your favorite listings
4. Contact sellers directly through our messaging system

**For Sellers**
1. Create your free account
2. List your tiny home with photos and details
3. Respond to inquiries from interested buyers
4. Close the deal!

**Community Guidelines**
- Be respectful in all communications
- Provide accurate listing information
- Report any issues to our admin team
- Follow our terms of service
    `
  }
];

const quickLinks = [
  { title: 'Browse Listings', href: '/listings', icon: Search, desc: 'Find your perfect tiny home' },
  { title: 'Read Our Blog', href: '/blogs', icon: BookOpen, desc: 'Tips and inspiration' },
  { title: 'Contact Support', href: '/messages', icon: MessageSquare, desc: 'Get help from our team' },
  { title: 'Privacy & Security', href: '/privacy', icon: Shield, desc: 'How we protect you' },
];

export default async function HelpPage() {
  const session = await getSession();
  const user = session?.user;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Nav user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-green-pale rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-10 h-10 text-green" />
          </div>
          <h1 className="font-serif text-5xl font-bold text-charcoal mb-4 tracking-tight">Help Center</h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">Everything you need to know about buying, selling, and renting tiny homes on TinyNest.</p>
        </div>

        {/* Help Articles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {helpArticles.map((article) => (
            <div key={article.id} className="bg-white rounded-tiny border border-gray-100 shadow-tiny-sm hover:shadow-tiny transition-all group p-8">
              <div className="w-14 h-14 bg-green-pale rounded-tiny flex items-center justify-center text-green mb-6 group-hover:scale-110 transition-transform">
                <article.icon className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-green mb-3 block">{article.category}</span>
              <h2 className="text-xl font-bold text-charcoal mb-3 group-hover:text-green transition-colors">{article.title}</h2>
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">{article.description}</p>
              <Link href={`/help#${article.id}`} className="text-green font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                Read More <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Detailed Articles */}
        <div className="space-y-12 mb-20">
          {helpArticles.map((article) => (
            <div key={article.id} id={article.id} className="bg-white rounded-tiny border border-gray-100 shadow-tiny-sm p-8 lg:p-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-green-pale rounded-tiny flex items-center justify-center text-green">
                  <article.icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-green block">{article.category}</span>
                  <h2 className="text-2xl font-bold text-charcoal">{article.title}</h2>
                </div>
              </div>
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {article.content}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support CTA */}
        <div className="mb-16 bg-gradient-to-r from-green to-green-dark rounded-3xl p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Can't find what you're looking for?</h2>
            <p className="text-white/70 text-sm">Our support team is available 24/7. Submit an inquiry and we'll get back within 24 hours.</p>
          </div>
          <SupportForm userEmail={user?.email} userName={user?.name} />
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-charcoal mb-8 text-center">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Browse Listings', href: '/listings', icon: Search, desc: 'Find your perfect tiny home' },
              { title: 'Read Our Blog', href: '/blogs', icon: BookOpen, desc: 'Tips and inspiration' },
              { title: 'Communities', href: '/community', icon: MessageSquare, desc: 'Connect with tiny home owners' },
              { title: 'Privacy & Security', href: '/privacy', icon: Shield, desc: 'How we protect you' },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="bg-white rounded-tiny border border-gray-100 shadow-tiny-sm hover:shadow-tiny transition-all p-6 group text-center">
                <div className="w-12 h-12 bg-green-pale rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform text-green">
                  <link.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-charcoal text-sm mb-1">{link.title}</h3>
                <p className="text-xs text-gray-400 font-medium">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
