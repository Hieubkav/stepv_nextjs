import React from 'react';
import { RelatedResource } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Lock, ShoppingCart, ExternalLink } from 'lucide-react';

interface SidebarProps {
  relatedItems: RelatedResource[];
  price: number;
  originalPrice?: number;
  currency: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ relatedItems, price, originalPrice, currency }) => {
  // Format price to Vietnamese standard (e.g. 1.250.000)
  const formatPrice = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

  const discountPercentage = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;

  return (
    <div className="flex flex-col gap-6 sticky top-8">
      
      {/* Actions Card */}
      <div className="relative">
          {/* Decorative Glow behind actions */}
          <div className="absolute inset-0 bg-amber-500/5 blur-2xl rounded-full -z-10" />
          
          <Card className="border-amber-500/20 bg-gradient-to-b from-slate-900/80 to-slate-950/90 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            
            <CardContent className="pt-6 flex flex-col gap-5">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <span className="text-slate-400 text-sm font-medium">Giá ưu đãi</span>
                         {originalPrice && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                    -{discountPercentage}%
                                </span>
                            </div>
                         )}
                    </div>
                    <div className="flex flex-col items-end">
                        {originalPrice && (
                            <span className="text-sm text-slate-500 line-through decoration-slate-600 mb-0.5">
                                {formatPrice(originalPrice)} {currency}
                            </span>
                        )}
                        <span className="text-3xl font-serif text-white tracking-tight text-shadow-sm">
                            {formatPrice(price)} <span className="text-lg text-slate-400 font-sans">{currency}</span>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <Button variant="gold" className="w-full group relative overflow-hidden h-12">
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        <span className="mr-2 font-bold tracking-wide">THÊM VÀO GIỎ</span>
                        <ShoppingCart className="w-5 h-5" />
                    </Button>

                     <Button 
                        disabled 
                        className="w-full bg-slate-800/40 text-slate-500 border border-slate-800 hover:bg-slate-800 cursor-not-allowed justify-between h-11"
                    >
                        <span className="font-medium">Tải về (Bản Free)</span>
                        <Lock className="w-4 h-4" />
                    </Button>
                </div>
                
                {/* Removed Security Payment Text */}
            </CardContent>
          </Card>
      </div>

      {/* Related Resources Card */}
      <Card className="border-slate-800 bg-slate-950/40">
        <CardHeader className="pb-4 border-b border-slate-800/50">
          <CardTitle className="text-lg font-medium text-slate-200">Tài nguyên liên quan</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col gap-4">
          {relatedItems.map((item) => (
            <a 
                key={item.id} 
                href={item.link}
                className="group relative flex items-center justify-between p-2 rounded-lg border border-transparent bg-transparent hover:bg-slate-900 hover:border-slate-800 transition-all duration-200"
            >
                <div className="flex items-center gap-3 w-full">
                    {/* Thumbnail Image */}
                    <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden rounded-md border border-slate-800 group-hover:border-slate-600 transition-colors">
                        <img 
                            src={item.thumbnail} 
                            alt={item.title} 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                    </div>
                    
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span className="text-sm text-slate-300 font-medium group-hover:text-amber-500 transition-colors line-clamp-2">
                            {item.title}
                        </span>
                        <span className="text-xs text-slate-500 group-hover:text-slate-400">
                           Xem chi tiết
                        </span>
                    </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-500 transition-colors flex-shrink-0 ml-2" />
            </a>
          ))}
        </CardContent>
      </Card>

    </div>
  );
};