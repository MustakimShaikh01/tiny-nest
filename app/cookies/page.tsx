import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

export default function CookieSettingsPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Nav user={null} />

      <div className="max-w-4xl mx-auto px-4 py-24 flex-1 w-full">
         <div className="mb-14">
            <h1 className="font-serif text-5xl font-bold text-charcoal mb-4">Cookie Settings</h1>
            <p className="text-gray-500 font-medium text-lg">Manage your tracking preferences.</p>
         </div>

         <div className="bg-white rounded-tiny border border-gray-100 shadow-tiny p-10 lg:p-16 text-charcoal">
            <h2 className="text-2xl font-bold mb-4">Overview of Our Cookies</h2>
            <p className="mb-10 font-medium text-gray-600 leading-relaxed">
               TinyNest relies on a few essential and non-essential cookies to enhance your browsing experience, provide secure logins, and understand how our website is utilized securely.
               Below you can review and configure these policies.
            </p>

            <div className="space-y-6">
               <div className="flex items-start gap-4 p-6 border border-gray-100 rounded-tiny bg-gray-50">
                  <div className="flex-1">
                     <h3 className="text-lg font-bold mb-1">Strictly Necessary Cookies</h3>
                     <p className="text-sm text-gray-500 font-medium">These cookies are essential for you to browse the website and use its features, such as accessing secure areas of the site.</p>
                  </div>
                  <div className="pt-2">
                     <span className="bg-charcoal text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Always Active</span>
                  </div>
               </div>

               <div className="flex items-start gap-4 p-6 border border-gray-100 rounded-tiny">
                  <div className="flex-1">
                     <h3 className="text-lg font-bold mb-1">Performance Cookies</h3>
                     <p className="text-sm text-gray-500 font-medium mb-3">These allow us to count visits and traffic sources so we can measure and improve the performance of our site. 
                     They help us to know which pages are the most and least popular.</p>
                  </div>
                  <div className="pt-2">
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green"></div>
                     </label>
                  </div>
               </div>

               <div className="flex items-start gap-4 p-6 border border-gray-100 rounded-tiny">
                  <div className="flex-1">
                     <h3 className="text-lg font-bold mb-1">Targeting & Advertising Cookies</h3>
                     <p className="text-sm text-gray-500 font-medium mb-3">These cookies may be set through our site by our advertising partners. 
                     They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.</p>
                  </div>
                  <div className="pt-2">
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green"></div>
                     </label>
                  </div>
               </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end">
               <button className="btn btn-primary px-8 py-3 font-bold hover:-translate-y-1 transition-transform shadow-xl">
                 Save Preferences
               </button>
            </div>
         </div>
      </div>

      <Footer />
    </main>
  );
}
