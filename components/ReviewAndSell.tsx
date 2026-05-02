'use client';

import { useState, useRef } from 'react';
import { 
  Home, MapPin, Ruler, Bed, ShowerHead, 
  Calendar, ImagePlus, ArrowRight, ArrowLeft,
  CheckCircle2, X, Plus, Shield, Eye,
  Layout, Tag, Info, Camera, Send
} from 'lucide-react';

export default function ReviewAndSell({ user, onComplete }: { user: any, onComplete: (data: any) => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    title: '',
    price: '',
    type: 'sale',
    street: '',
    city: '',
    state: '',
    zip: '',
    sqft: '',
    beds: '',
    baths: '',
    year: '',
    category: 'Tiny House',
    condition: 'Good',
    description: '',
    amenities: '',
    metaTitle: '',
    metaDesc: '',
    images: []
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const fd = new FormData();
      fd.append('file', files[i]);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.url) {
          setFormData((prev: any) => ({ ...prev, images: [...prev.images, data.url] }));
        }
      } catch (err) { console.error(err); }
    }
    setUploading(false);
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-12 px-4 overflow-x-auto gap-4 py-2">
        {[
          { id: 1, label: 'Details', icon: Info },
          { id: 2, label: 'Specs', icon: Layout },
          { id: 3, label: 'Photos', icon: Camera },
          { id: 4, label: 'SEO', icon: Tag },
          { id: 5, label: 'Review', icon: Eye }
        ].map((s) => (
          <div key={s.id} className="flex items-center gap-3 shrink-0">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${step >= s.id ? 'bg-green text-white shadow-lg shadow-green/20 scale-110' : 'bg-gray-100 text-gray-400'}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest hidden sm:block ${step >= s.id ? 'text-charcoal' : 'text-gray-300'}`}>{s.label}</span>
            {s.id < 5 && <div className={`w-8 h-px ${step > s.id ? 'bg-green' : 'bg-gray-100'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-tiny overflow-hidden flex flex-col min-h-[600px]">
        {/* Step Content */}
        <div className="flex-1 p-8 lg:p-12">
          {step === 1 && (
            <div className="animate-fade-in space-y-8">
              <div className="pb-6 border-b border-gray-50">
                <h2 className="text-2xl font-bold text-charcoal">Fundamental Details</h2>
                <p className="text-gray-400 text-sm mt-1">Start with the basics of your listing.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Listing Title</label>
                  <input 
                    value={formData.title} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-green/20 outline-none font-medium transition-all" 
                    placeholder="e.g. Minimalist Zen Cabin"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Price (USD)</label>
                    <input 
                      type="number"
                      value={formData.price} 
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-green/20 outline-none font-medium transition-all" 
                      placeholder="65000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Listed For</label>
                    <select 
                      value={formData.type} 
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-green/20 outline-none font-bold text-charcoal transition-all appearance-none"
                    >
                      <option value="sale">Sale</option>
                      <option value="rent">Rent</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Street Address</label>
                   <input 
                    value={formData.street} 
                    onChange={e => setFormData({ ...formData, street: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-green/20 outline-none font-medium transition-all" 
                    placeholder="123 Oak Avenue"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 md:col-span-2">
                   <input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none" placeholder="City" />
                   <input value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none" placeholder="State" />
                   <input value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none" placeholder="Zip" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in space-y-8">
              <div className="pb-6 border-b border-gray-50">
                <h2 className="text-2xl font-bold text-charcoal">Home Specifications</h2>
                <p className="text-gray-400 text-sm mt-1">Detailed metrics about your build.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['sqft', 'beds', 'baths', 'year'].map((field) => (
                  <div key={field} className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">{field}</label>
                    <input 
                      type="number"
                      value={formData[field]} 
                      onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-green/20 outline-none font-medium transition-all" 
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 md:col-span-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Features & Amenities</label>
                   <div className="h-[420px] overflow-y-auto p-4 border border-gray-100 rounded-2xl bg-gray-50 custom-scrollbar space-y-5">
                     {[
                       { heading: 'Layout', items: ['Loft','Single-Level Layout','Split-Level Layout','Studio Layout','Open Plan Living','Expandable Section','Fold-Out Section','Multi-Use Space','Foldable Furniture','Built-In Storage','Under-Stair Storage','Hidden Storage','None','Other'] },
                       { heading: 'Outdoor / Exterior', items: ['Balcony','Deck','Porch','Rooftop Terrace','Skylight','French Doors','Sliding Glass Door','Awning','Canopy','Outdoor Stairs'] },
                       { heading: 'Windows / Ventilation', items: ['Large Windows','Panoramic Windows','Double-Glazed Windows','uPVC Windows','Aluminum Windows','Cross Ventilation','Ventilation Fan','Roof Vent','Ceiling Fan','Mosquito Screens'] },
                       { heading: 'Kitchen', items: ['Compact Kitchen','Modular Kitchen','Pantry Storage','Sink Installed','Countertop','Induction Cooktop','Gas Cooktop','Microwave Space','Refrigerator Space','Overhead Cabinets','Foldable Dining Counter','Chimney / Exhaust'] },
                       { heading: 'Bathroom', items: ['Attached Bathroom','Common Bathroom','Wet Bathroom','Dry Bathroom','Shower Area','Shower Cabin','Western Toilet','Squat Toilet','Wall-Hung Toilet','Composting Toilet','Wash Basin','Vanity Unit','Water Heater Ready','Exhaust Fan'] },
                       { heading: 'Plumbing', items: ['Plumbing Ready','Pre-Plumbed','Water Supply Inlet','Drainage Outlet','Kitchen Plumbing','Bathroom Plumbing','Grey Water Line','Black Water Line','Septic Tank Ready','Water Tank Connection','Hot Water Line'] },
                       { heading: 'Electrical', items: ['Electrical Ready','Pre-Wired','Concealed Wiring','Surface Wiring','LED Lights Installed','Switchboard Installed','Power Sockets','USB Charging','Points','AC Point','Inverter Ready','Solar Ready','Generator Ready','Other'] },
                       { heading: 'Heating / Cooling', items: ['Mini Split AC','Window AC','Portable AC','Ceiling Fan','Exhaust Fan','Heat Pump','Electric Heater','Gas Heater','Solar Heating','Roof Insulation','Wall Insulation','Floor Insulation'] },
                       { heading: 'Structure / Build', items: ['Steel Frame','Lightweight Frame','Portable Structure','Foldable Structure','Expandable Structure','Trailer-Mounted','Crane Liftable','Weatherproof Exterior','Rust-Resistant Body','Fire-Resistant Panels','Soundproof Panels','Others'] },
                       { heading: 'Interior Finish', items: ['Wooden Finish','Vinyl Flooring','Laminate Flooring','Tile Flooring','PVC Panels','Wall Cladding','False Ceiling','Recessed Lighting','Minimalist Interior','Premium Interior Finish','Others'] },
                       { heading: 'Utilities / Off-Grid', items: ['Solar Power','Battery Backup','Water Tank','Rainwater Harvesting','Off-Grid Ready','Grid Connected','Internet Ready','Satellite Ready','Septic Ready','Greywater System'] },
                       { heading: 'Mobility / Installation', items: ['Portable','Mobile','Relocatable','Quick Install','Ready to Move In','Trailer Compatible','Foldable','Expandable','Minimal Foundation','No Heavy Foundation'] },
                       { heading: 'Safety', items: ['Fire Alarm','Smoke Detector','Carbon Monoxide Detector','Emergency Exit','Security Lock','Window Locks','Anti-Slip Flooring','Electrical Safety System'] },
                     ].map(({ heading, items }) => {
                       const selectedList = formData.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
                       return (
                         <div key={heading}>
                           <div className="text-xs font-bold text-charcoal uppercase tracking-widest mb-2 pb-1 border-b border-gray-200">{heading}</div>
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                             {items.map(amenity => {
                               const isChecked = selectedList.includes(amenity);
                               return (
                                 <label key={amenity} className="flex items-center gap-2 cursor-pointer group">
                                   <input
                                     type="checkbox"
                                     checked={isChecked}
                                     onChange={() => {
                                       const current = formData.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
                                       const updated = isChecked
                                         ? current.filter((a: string) => a !== amenity)
                                         : [...current, amenity];
                                       setFormData({ ...formData, amenities: updated.join(', ') });
                                     }}
                                     className="w-3.5 h-3.5 rounded accent-green flex-shrink-0"
                                   />
                                   <span className={`text-xs font-medium transition-colors ${isChecked ? 'text-green' : 'text-gray-500 group-hover:text-charcoal'}`}>{amenity}</span>
                                 </label>
                               );
                             })}
                           </div>
                         </div>
                       );
                     })}
                   </div>
                   <div className="text-xs text-gray-400 font-medium">
                     {formData.amenities.split(',').filter((s: string) => s.trim()).length} amenities selected
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Category</label>
                   <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none">
                     <option>Tiny House</option>
                     <option>Cabin</option>
                     <option>Container</option>
                     <option>RV</option>
                   </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Full Description</label>
                   <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-green/20 outline-none font-medium transition-all resize-none" 
                    placeholder="Describe your home's unique story..."
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in space-y-8">
              <div className="pb-6 border-b border-gray-50">
                <h2 className="text-2xl font-bold text-charcoal">Photo Gallery</h2>
                <p className="text-gray-400 text-sm mt-1">Wide shots and detail shots perform best.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {formData.images.map((img: string, i: number) => (
                  <div key={i} className="aspect-square relative group rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                    <img src={img} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setFormData((prev: any) => ({ ...prev, images: prev.images.filter((_: any, idx: number) => idx !== i) }))}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button 
                   onClick={() => fileInputRef.current?.click()}
                   disabled={uploading}
                   className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-green hover:bg-green-pale/20 transition-all group"
                >
                  {uploading ? <div className="w-6 h-6 border-2 border-green border-t-transparent rounded-full animate-spin" /> : <Plus className="w-6 h-6 text-gray-300 group-hover:text-green" />}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-green">Add Photos</span>
                </button>
              </div>
              <input type="file" hidden multiple ref={fileInputRef} onChange={handleImageUpload} />
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in space-y-8">
              <div className="pb-6 border-b border-gray-50">
                <h2 className="text-2xl font-bold text-charcoal">SEO & Optimization</h2>
                <p className="text-gray-400 text-sm mt-1">Help Google find your listing.</p>
              </div>
              <div className="space-y-6 max-w-2xl">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Focus Meta Title</label>
                    <input value={formData.metaTitle} onChange={e => setFormData({ ...formData, metaTitle: e.target.value })} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none" placeholder="e.g. Turnkey Off-Grid Tiny House in Colorado" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Meta Description</label>
                    <textarea value={formData.metaDesc} onChange={e => setFormData({ ...formData, metaDesc: e.target.value })} rows={3} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none" placeholder="Catchy summary for search results..." />
                 </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-fade-in space-y-8">
              <div className="pb-6 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-charcoal">Review & Confirm</h2>
                  <p className="text-gray-400 text-sm mt-1">Review your details before publishing.</p>
                </div>
                <div className="px-4 py-2 bg-green-pale/30 text-green rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                   <Shield className="w-4 h-4" /> Final Check
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <div className="space-y-6">
                   <div className="bg-gray-50 p-6 rounded-3xl space-y-1">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Property</div>
                      <div className="text-xl font-bold text-charcoal">{formData.title}</div>
                      <div className="text-sm font-medium text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {formData.city}, {formData.state}</div>
                   </div>
                   <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-white border border-gray-100 p-4 rounded-3xl">
                         <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Price</div>
                         <div className="text-lg font-bold text-green">${Number(formData.price).toLocaleString()}</div>
                      </div>
                      <div className="bg-white border border-gray-100 p-4 rounded-3xl">
                         <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">SQFT</div>
                         <div className="text-lg font-bold text-charcoal">{formData.sqft}</div>
                      </div>
                      <div className="bg-white border border-gray-100 p-4 rounded-3xl">
                         <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Beds</div>
                         <div className="text-lg font-bold text-charcoal">{formData.beds}</div>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description Preview</div>
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{formData.description}</p>
                   </div>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lead Photo</div>
                    {formData.images.length > 0 ? (
                      <div className="aspect-video rounded-[2rem] overflow-hidden shadow-tiny-sm border border-gray-100">
                        <img src={formData.images[0]} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 italic text-sm">
                        No photos uploaded
                      </div>
                    )}
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button 
            disabled={step === 1}
            onClick={prevStep}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-gray-400 hover:text-charcoal transition-all disabled:opacity-0"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          
          {step < 5 ? (
            <button 
              onClick={nextStep}
              className="flex items-center gap-2 px-10 py-4 bg-green text-white font-bold rounded-2xl hover:bg-green-dark transition-all shadow-xl active:scale-95"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={() => onComplete(formData)}
              className="flex items-center gap-2 px-10 py-4 bg-green text-white font-bold rounded-2xl hover:bg-green-dark transition-all shadow-xl active:scale-95 shadow-green/20"
            >
              Confirm & Publish <Send className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
