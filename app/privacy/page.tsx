import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Nav user={null} />

      <div className="max-w-4xl mx-auto px-4 py-24 flex-1 w-full">
         <div className="mb-14">
            <h1 className="font-serif text-5xl font-bold text-charcoal mb-4">Privacy Policy</h1>
            <p className="text-gray-500 font-medium text-lg">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
         </div>

         <div className="bg-white rounded-tiny border border-gray-100 shadow-tiny p-10 lg:p-16 prose prose-lg max-w-none text-charcoal">
            <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
            <p className="mb-6 font-medium text-gray-600 leading-relaxed">
               At TinyNest, we collect information you provide directly to us when you create an account, list a property, send messages through our platform, or otherwise communicate with us.
               The types of information we may collect include your name, email address, postal address, phone number, and any other information you choose to provide.
            </p>

            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
            <p className="mb-6 font-medium text-gray-600 leading-relaxed">
               We use the information we collect to provide, maintain, and improve our services.
               This includes using the information to:
            </p>
            <ul className="list-disc pl-6 mb-8 font-medium text-gray-600 space-y-2">
               <li>Facilitate transactions and interactions between buyers and sellers.</li>
               <li>Send you technical notices, updates, security alerts, and support and administrative messages.</li>
               <li>Respond to your comments, questions, and customer service requests.</li>
               <li>Communicate with you about products, services, offers, promotions, and events.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">3. Security</h2>
            <p className="mb-6 font-medium text-gray-600 leading-relaxed">
               TinyNest takes reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
            </p>

            <h2 className="text-2xl font-bold mb-4">4. Contact Us</h2>
            <p className="font-medium text-gray-600 leading-relaxed">
               If you have any questions about this Privacy Policy, please contact us at: <br/>
               <a href="mailto:privacy@tinynest.com" className="text-green hover:underline">privacy@tinynest.com</a>
            </p>
         </div>
      </div>

      <Footer />
    </main>
  );
}
