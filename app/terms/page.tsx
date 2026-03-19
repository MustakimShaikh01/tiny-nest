import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Nav user={null} />

      <div className="max-w-4xl mx-auto px-4 py-24 flex-1 w-full">
         <div className="mb-14">
            <h1 className="font-serif text-5xl font-bold text-charcoal mb-4">Terms of Service</h1>
            <p className="text-gray-500 font-medium text-lg">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
         </div>

         <div className="bg-white rounded-tiny border border-gray-100 shadow-tiny p-10 lg:p-16 prose prose-lg max-w-none text-charcoal">
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-6 font-medium text-gray-600 leading-relaxed">
               By accessing or using the TinyNest platform, whether acting as a buyer, seller, or casual visitor, you agree to be legally bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
            </p>

            <h2 className="text-2xl font-bold mb-4">2. The TinyNest Platform</h2>
            <p className="mb-6 font-medium text-gray-600 leading-relaxed">
               TinyNest acts as an administrative marketplace to connect people looking for tiny homes with sellers and builders. We do not own, manage, or operate any of the physical properties listed on the site. All transactions occur directly between the buyer and the seller.
               We cannot guarantee the condition or legality of any specific listing.
            </p>

            <h2 className="text-2xl font-bold mb-4">3. User Responsibilities</h2>
            <ul className="list-disc pl-6 mb-8 font-medium text-gray-600 space-y-2">
               <li>You are responsible for safeguarding the password that you use to access the service.</li>
               <li>You agree not to post false, misleading, or deceptive listings.</li>
               <li>You agree to comply with all local, state, and federal zoning and housing laws.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">4. Indemnification</h2>
            <p className="mb-6 font-medium text-gray-600 leading-relaxed">
               You agree to defend, indemnify, and hold harmless TinyNest and its licensee and licensors, and their employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt.
            </p>

            <h2 className="text-2xl font-bold mb-4">5. Contact Configuration</h2>
            <p className="font-medium text-gray-600 leading-relaxed">
               For legal inquiries, please contact: <br/>
               <a href="mailto:legal@tinynest.com" className="text-green hover:underline">legal@tinynest.com</a>
            </p>
         </div>
      </div>

      <Footer />
    </main>
  );
}
