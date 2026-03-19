import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export function BlogCard({ blog }: { blog: any }) {
  return (
    <Link href={`/blogs/${blog.id}`} className="group bg-white rounded-tiny border border-gray-100 shadow-tiny-sm hover:shadow-tiny transition-all duration-300 flex flex-col h-full overflow-hidden">
      <div className="relative h-48 bg-green-pale flex items-center justify-center overflow-hidden">
        <span className="text-6xl group-hover:scale-110 transition-transform duration-500">{blog.emoji}</span>
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[10px] font-bold text-green uppercase tracking-widest rounded-full shadow-sm">
            {blog.category}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-serif text-xl font-bold text-charcoal mb-3 group-hover:text-green-light transition-colors leading-snug">
          {blog.title}
        </h3>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-6 font-medium leading-relaxed">
          {blog.excerpt}
        </p>
        
        <div className="mt-auto flex items-center justify-between text-gray-400 font-bold text-[10px] uppercase tracking-widest pb-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {blog.date}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {blog.readTime}
          </div>
        </div>
      </div>
    </Link>
  );
}
