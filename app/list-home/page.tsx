'use client';

import { useState, useRef } from 'react';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { Home, MapPin, Ruler, Bed, ShowerHead, Calendar, ImagePlus, ArrowRight, Loader2, CheckCircle2, X, Plus } from 'lucide-react';

export default function ListHomePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages = [...images];

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.url) {
          newImages.push(data.url);
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    setImages(newImages);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (images.length === 0) {
      alert('Please upload at least one image.');
      return;
    }
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const listingData = {
      ...data,
      price: Number(data.price),
      sqft: Number(data.sqft),
      beds: Number(data.beds),
      baths: Number(data.baths),
      year: Number(data.year),
      amenities: ["Solar Power", "Modern Kitchen", "High Ceilings", "Wood Finish"],
      img: images[0],
      images: images
    };

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/listings'), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-green flex flex-col items-center justify-center text-white px-4 text-center">
         <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-12 animate-bounce-slow">
            <CheckCircle2 className="w-12 h-12 text-white" />
         </div>
         <h1 className="font-serif text-5xl font-bold mb-6">Listing Submitted!</h1>
         <p className="text-xl text-green-pale max-w-md font-medium leading-relaxed">Your home is being reviewed by our admin team. It will be published within 24 hours.</p>
         <button onClick={() => router.push('/listings')} className="mt-12 btn bg-white text-green px-10 py-4 font-bold rounded-tiny hover:-translate-y-1 transition-all">Go to Listings</button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Nav user={null} />

      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="mb-14 text-center">
           <span className="text-green font-bold text-xs tracking-widest uppercase mb-4 block">Seller Portal</span>
           <h1 className="font-serif text-5xl font-bold text-charcoal mb-4">List Your Tiny Home</h1>
           <p className="text-gray-500 font-medium text-lg">Reach over 50,000 potential buyers and renters across the country.</p>
        </div>

        <div className="bg-white rounded-tiny border border-gray-100 shadow-tiny p-10 lg:p-16">
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Essential Info */}
            <div>
               <h2 className="text-xl font-bold text-charcoal mb-8 pb-3 border-b border-gray-50">Essential Information</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Listing Title</label>
                    <div className="relative flex items-center group">
                      <Home className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-green transition-colors" />
                      <input name="title" required className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-tiny font-medium focus:bg-white focus:border-green transition-all outline-none" placeholder="Modern Cabin on Wheels" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Price (USD)</label>
                        <input name="price" type="number" required className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-tiny font-medium focus:bg-white focus:border-green transition-all outline-none" placeholder="65000" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Type</label>
                        <select name="type" required className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-tiny font-bold text-charcoal focus:bg-white focus:border-green transition-all outline-none appearance-none">
                          <option value="sale">For Sale</option>
                          <option value="rent">For Rent</option>
                        </select>
                     </div>
                  </div>
               </div>
            </div>

            {/* Specifications */}
            <div>
               <h2 className="text-xl font-bold text-charcoal mb-8 pb-3 border-b border-gray-50">Home Specifications</h2>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">SQ Footage</label>
                    <input name="sqft" type="number" required className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-tiny font-medium focus:bg-white focus:border-green transition-all outline-none" placeholder="280" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Bedrooms</label>
                    <input name="beds" type="number" required className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-tiny font-medium focus:bg-white focus:border-green transition-all outline-none" placeholder="1" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Bathrooms</label>
                    <input name="baths" type="number" required className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-tiny font-medium focus:bg-white focus:border-green transition-all outline-none" placeholder="1" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Year Built</label>
                    <input name="year" type="number" required className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-tiny font-medium focus:bg-white focus:border-green transition-all outline-none" placeholder="2026" />
                  </div>
               </div>
               <div className="mt-8 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Home Description</label>
                  <textarea name="description" required className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-tiny font-medium focus:bg-white focus:border-green transition-all outline-none min-h-[160px]" placeholder="Tell us about your home's unique features, location, and history..."></textarea>
               </div>
               <div className="mt-8 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Location</label>
                  <div className="relative flex items-center group">
                    <MapPin className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-green" />
                    <input name="location" required className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-tiny font-medium focus:bg-white focus:border-green transition-all outline-none" placeholder="City, State" />
                  </div>
               </div>
            </div>

            {/* Photos */}
            <div>
               <h2 className="text-xl font-bold text-charcoal mb-8 pb-3 border-b border-gray-50">Upload Photos</h2>
               
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                 {images.map((img, i) => (
                   <div key={i} className="aspect-square relative group rounded-tiny overflow-hidden border border-gray-100 shadow-sm">
                     <img src={img} className="w-full h-full object-cover" alt="Upload" />
                     <button 
                       type="button" 
                       onClick={() => removeImage(i)}
                       className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-600 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       <X className="w-3.5 h-3.5" />
                     </button>
                   </div>
                 ))}
                 <button 
                   type="button"
                   onClick={() => fileInputRef.current?.click()}
                   disabled={uploading}
                   className="aspect-square border-2 border-dashed border-gray-200 rounded-tiny flex flex-col items-center justify-center gap-2 hover:border-green hover:bg-green-pale/30 transition-all group"
                 >
                   {uploading ? <Loader2 className="w-6 h-6 animate-spin text-green" /> : <ImagePlus className="w-6 h-6 text-gray-400 group-hover:text-green" />}
                   <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-green">Add Image</span>
                 </button>
               </div>

               <input 
                 type="file" 
                 hidden 
                 multiple 
                 accept="image/*"
                 ref={fileInputRef}
                 onChange={handleImageUpload}
               />
               
               <p className="text-gray-400 font-medium text-xs text-center">Listings with multiple high-quality photos get 4x more views.</p>
            </div>

            <div className="pt-8 flex justify-end">
               <button 
                type="submit" 
                disabled={loading || uploading}
                className="btn btn-primary px-12 py-5 text-base font-bold shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Publish Listing <ArrowRight className="w-6 h-6 ml-2" /></>}
               </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  );
}
