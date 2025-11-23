import React from 'react';
import { ArrowLeft, Globe } from 'lucide-react';
import { MOCK_RESOURCE } from './constants';
import { PreviewGallery } from './components/PreviewGallery';
import { Sidebar } from './components/Sidebar';
import { Button } from './components/ui/Button';

// Utility for safe HTML rendering (in a real app, use DOMPurify)
const SafeHtml = ({ html }: { html: string }) => {
  return <div className="prose prose-invert prose-p:text-slate-400 prose-headings:text-slate-200 prose-ul:text-slate-400 max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 selection:bg-amber-500/30 selection:text-amber-200 font-sans pb-20">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-amber-900/5 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <header className="relative z-10 container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="text-sm font-medium text-slate-500 hover:text-slate-300 cursor-pointer transition-colors hidden sm:block">
                Quay lại danh sách
            </span>
        </div>
        <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
                <Globe className="w-5 h-5" />
            </Button>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Preview & Content (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-10">
                
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">
                        {MOCK_RESOURCE.title}
                    </h1>
                    <PreviewGallery items={MOCK_RESOURCE.previews} />
                </div>

                {/* Content Section */}
                <div className="relative p-1 rounded-2xl bg-gradient-to-b from-slate-800/50 to-transparent">
                    <div className="bg-[#050914] rounded-xl p-8 border border-slate-800/50 relative overflow-hidden">
                        {/* Header Decoration */}
                        <div className="absolute top-0 left-0 w-20 h-1 bg-amber-500" />
                        
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            Chi tiết tài nguyên
                        </h2>
                        
                        <div className="text-slate-400 leading-relaxed space-y-4">
                            <p className="font-serif text-lg italic text-slate-300 border-l-2 border-amber-500/50 pl-4 mb-6">
                                "{MOCK_RESOURCE.description}"
                            </p>
                            <SafeHtml html={MOCK_RESOURCE.detailedContent} />
                            
                            {/* Decorative Placeholder for long text fade */}
                            <div className="mt-8 p-6 rounded-lg border border-dashed border-slate-800 bg-slate-900/30 flex items-center justify-center text-sm text-slate-600">
                                Các thông số kỹ thuật chi tiết khác sẽ được hiển thị ở đây.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Sidebar (4 cols) */}
            <div className="lg:col-span-4">
                <Sidebar 
                    relatedItems={MOCK_RESOURCE.related} 
                    price={MOCK_RESOURCE.price}
                    originalPrice={MOCK_RESOURCE.originalPrice}
                    currency={MOCK_RESOURCE.currency}
                />
            </div>

        </div>
      </main>
    </div>
  );
};

export default App;