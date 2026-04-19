import { getSession } from '../../lib/auth';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import ReviewAndSellWrapper from '../../components/ReviewAndSellWrapper';
import { redirect } from 'next/navigation';

export default async function ListHomePage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Nav user={session.user} />
      
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-16">
        <div className="mb-14 text-center">
           <span className="text-green font-bold text-xs tracking-widest uppercase mb-4 block decoration-green decoration-2 underline-offset-8 underline">The Marketplace</span>
           <h1 className="font-serif text-5xl md:text-6xl font-bold text-charcoal mb-4">Review & Sell</h1>
           <p className="text-gray-400 font-medium text-lg max-w-2xl mx-auto">
             List your tiny home in front of millions. Follow our 5-step standardized process used by professionals nationwide.
           </p>
        </div>

        <ReviewAndSellWrapper user={session.user} />
      </div>

      <Footer />
    </main>
  );
}
