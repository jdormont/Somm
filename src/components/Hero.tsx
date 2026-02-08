import { Link } from 'react-router-dom';
import { 
  Camera, 
  Search, 
  Store, 
  Utensils, 
  Clock, 
  ChevronRight, 
  ScanLine 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative pt-32 pb-20 px-6 z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        
        {/* Left Column: Copy */}
        <div className="text-center lg:text-left relative z-20">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm animate-fade-in-up">
            <ScanLine className="w-3.5 h-3.5 text-champagne-400" />
            <span className="text-xs font-medium tracking-wide text-champagne-100/90 uppercase">Your Pocket Sommelier</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-medium text-white tracking-tight leading-[1] mb-8 drop-shadow-2xl">
            The Sommelier <br />
            <span className="text-champagne-400 italic">in Your Pocket.</span>
          </h1>

          <p className="text-lg sm:text-xl text-stone-300 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed font-light">
            Personalized wine recommendations for every meal, budget, and palate. Scan any list in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              to={user ? '/scan' : '/register'}
              className="group inline-flex items-center gap-3 bg-champagne-400 text-wine-slate-950 px-8 py-4 rounded-full text-base font-bold hover:bg-white transition-all shadow-[0_4px_20px_-5px_rgba(212,196,163,0.4)] hover:shadow-[0_8px_30px_-5px_rgba(255,255,255,0.5)] hover:-translate-y-0.5"
            >
              <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Start Scanning
            </Link>
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 border border-white/20 text-stone-300 hover:text-white hover:bg-white/5 px-8 py-4 rounded-full text-base font-medium transition-all"
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Right Column: Visual Mockup */}
        <div className="relative z-10 perspective-1000 group">
            {/* Ambient Glow behind mockup */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] hero-glow opacity-50 blur-[100px]" />

            {/* Mockup Container */}
            <div className="relative bg-[#1A1819] rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-6 sm:p-8 transform transition-transform duration-700 hover:rotate-y-2 hover:rotate-x-2 rotate-y-6 rotate-x-6 backdrop-blur-xl">
                 {/* Header */}
                 <div className="flex justify-between items-start mb-8">
                     <div>
                         <h3 className="font-serif text-3xl text-white mb-1">Concierge Desk</h3>
                         <p className="text-stone-400 text-sm">Your scanning history and insights</p>
                     </div>
                     <button className="flex items-center gap-2 bg-[#2D1B22] border border-[#783543]/30 text-[#fce7eb] px-4 py-2 rounded-full text-sm hover:bg-[#783543] transition-colors">
                         <ScanLine className="w-4 h-4" />
                         New scan
                     </button>
                 </div>

                 {/* Stats Row */}
                 <div className="grid grid-cols-3 gap-4 mb-8">
                     {[
                         { label: 'Scans', value: '2' },
                         { label: 'Wines Found', value: '15' },
                         { label: 'Avg Match', value: '88%' }
                     ].map((stat) => (
                         <div key={stat.label} className="bg-[#222021] rounded-2xl p-4 text-center border border-white/5">
                             <div className="font-serif text-2xl text-champagne-100 mb-1">{stat.value}</div>
                             <div className="text-[10px] uppercase tracking-wider text-stone-500">{stat.label}</div>
                         </div>
                     ))}
                 </div>

                 {/* Search & Filters */}
                 <div className="mb-6 space-y-4">
                     <div className="flex items-center gap-1 text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Scan History</div>
                     
                     <div className="relative">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                         <input 
                            type="text" 
                            placeholder="Search wines, regions, notes..." 
                            className="w-full bg-[#222021] border border-white/5 rounded-full py-3 pl-10 pr-4 text-sm text-stone-300 focus:outline-none focus:border-champagne-400/30"
                            readOnly
                         />
                     </div>

                     <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                         {['All', 'Store', 'Restaurant', 'All time'].map((filter, i) => (
                             <button 
                                key={filter}
                                className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap border ${i === 0 || i === 3 ? 'bg-champagne-400 text-wine-slate-950 border-transparent font-bold' : 'bg-transparent border-white/10 text-stone-400'}`}
                             >
                                 {filter}
                             </button>
                         ))}
                     </div>
                 </div>

                 {/* List Items */}
                 <div className="space-y-3">
                     {/* Item 1 */}
                     <div className="bg-[#222021] p-4 rounded-xl border border-white/5 flex items-center gap-4 hover:bg-[#2A2829] transition-colors cursor-default">
                         <div className="w-10 h-10 rounded-lg bg-[#2D3A45] flex items-center justify-center text-blue-300">
                             <Store className="w-5 h-5" />
                         </div>
                         <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-center mb-1">
                                 <h4 className="text-white font-serif truncate pr-2">Rutherford Hill Cabernet</h4>
                                 <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">~92%</span>
                             </div>
                             <div className="flex items-center gap-4 text-xs text-stone-500">
                                 <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 20h ago</span>
                                 <span>10 wines</span>
                                 <span>$20-50</span>
                             </div>
                         </div>
                         <ChevronRight className="w-4 h-4 text-stone-600" />
                     </div>

                     {/* Item 2 */}
                     <div className="bg-[#222021] p-4 rounded-xl border border-white/5 flex items-center gap-4 hover:bg-[#2A2829] transition-colors cursor-default">
                         <div className="w-10 h-10 rounded-lg bg-[#452D2D] flex items-center justify-center text-orange-300">
                             <Utensils className="w-5 h-5" />
                         </div>
                         <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-center mb-1">
                                 <h4 className="text-white font-serif truncate pr-2">Côte-Rôtie</h4>
                                 <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">~95%</span>
                             </div>
                             <div className="flex items-center gap-4 text-xs text-stone-500">
                                 <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 1d ago</span>
                                 <span>5 wines</span>
                                 <span>$50-125</span>
                             </div>
                         </div>
                         <ChevronRight className="w-4 h-4 text-stone-600" />
                     </div>
                 </div>
            </div>
        </div>
      </div>
      
      {/* CSS Utility for simple perspective tilt if not in global css yet */}
      <style>{`
        .rotate-y-6 { transform: rotateY(-6deg) rotateX(2deg); }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </section>
  );
}
