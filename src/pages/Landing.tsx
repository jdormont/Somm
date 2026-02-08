import { Link } from 'react-router-dom';
import { Wine, Camera, Star, Utensils, ArrowRight } from 'lucide-react';
import Hero from '../components/Hero';
import { useAuth } from '../contexts/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-wine-slate-950 text-champagne-100 overflow-x-hidden selection:bg-somm-red-900 selection:text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] hero-glow opacity-60 mix-blend-screen" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-wine-slate-900/40 rounded-full blur-[100px]" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-wine-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-full bg-somm-red-900/20 text-somm-red-500 group-hover:bg-somm-red-900/40 transition-colors">
               <Wine className="w-5 h-5" />
            </div>
            <span className="font-serif font-bold text-xl tracking-wide text-champagne-100">Somm</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
             <a href="#features" className="text-sm font-medium text-stone-400 hover:text-champagne-100 transition-colors">Features</a>
             <a href="#how-it-works" className="text-sm font-medium text-stone-400 hover:text-champagne-100 transition-colors">How it works</a>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-somm-red-900 border border-somm-red-500/30 text-champagne-100 px-6 py-2.5 rounded-full text-sm font-medium hover:bg-somm-red-500 hover:text-white transition-all shadow-lg shadow-somm-red-900/20 hover:shadow-somm-red-500/20"
              >
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden md:block text-sm font-medium text-stone-400 hover:text-white transition-colors px-4 py-2"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-champagne-400 text-wine-slate-950 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-white transition-all shadow-[0_0_15px_-3px_rgba(212,196,163,0.3)] hover:shadow-[0_0_20px_-3px_rgba(255,255,255,0.4)] hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <Hero />

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Camera,
                title: 'Instant Recognition',
                desc: 'GPT-4 Vision identifies wines from any blurry menu photo.',
              },
              {
                icon: Star,
                title: 'Taste Intelligence',
                desc: 'Learns your preferences with every rating.',
              },
              {
                icon: Utensils,
                title: 'Perfect Pairings',
                desc: "Matches the wine to your Ribeye or Takeout Thai.",
              },
            ].map((feature) => (
              <div key={feature.title} className="group p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-champagne-400/20 hover:bg-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-black/20">
                <div className="w-14 h-14 rounded-2xl bg-somm-red-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner shadow-black/20">
                  <feature.icon className="w-6 h-6 text-champagne-400" />
                </div>
                <h3 className="font-serif text-2xl text-white mb-3">{feature.title}</h3>
                <p className="text-stone-400 leading-relaxed text-base font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works / Social Proof */}
      <section id="how-it-works" className="py-24 px-6 bg-wine-slate-900/30 border-y border-white/5 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl text-white mb-4">The Accessible Insider</h2>
            <p className="text-stone-400 max-w-lg mx-auto font-light">Demystifying wine, one scan at a time.</p>
          </div>
          
          <div className="space-y-8">
            {[
              {
                step: '01',
                title: 'Tell us what you like',
                desc: 'Red or white? Bold or delicate? Set your preferences once, and we handle the rest.',
              },
              {
                step: '02',
                title: 'Capture the moment',
                desc: 'Snap a photo of a wine list at dinner or a shelf at the shop.',
              },
              {
                step: '03',
                title: 'Drink with confidence',
                desc: 'Get ranked recommendations with match scores and "why you\'ll love it" notes.',
              },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-8 group">
                <div className="hidden sm:flex flex-shrink-0 w-16 h-16 rounded-full border border-white/10 items-center justify-center font-serif text-2xl text-champagne-400 group-hover:border-champagne-400/50 group-hover:scale-110 transition-all duration-500 bg-white/[0.02]">
                  {item.step}
                </div>
                <div className="flex-1 p-6 sm:p-8 rounded-2xl border border-transparent hover:bg-white/[0.03] hover:border-white/5 transition-all duration-500">
                  <span className="sm:hidden text-xs font-bold text-champagne-400 uppercase tracking-widest mb-2 block">{item.step}</span>
                  <h3 className="font-serif text-2xl text-white mb-2">{item.title}</h3>
                  <p className="text-stone-400 font-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-wine-slate-950 via-somm-red-900/10 to-wine-slate-950 pointer-events-none" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="font-serif text-4xl sm:text-5xl text-white mb-6">
            Ready to order like a Pro?
          </h2>
          <p className="text-stone-300 mb-10 text-lg font-light max-w-xl mx-auto">
            Join Somm today and turning every wine list into a curated menu just for you.
          </p>
          <Link
            to={user ? '/scan' : '/register'}
            className="inline-flex items-center gap-3 bg-champagne-400 text-wine-slate-950 px-10 py-4 rounded-full text-base font-bold hover:bg-white transition-all shadow-[0_0_20px_-5px_rgba(212,196,163,0.4)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.5)] transform hover:-translate-y-1"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-wine-slate-950">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-stone-500 hover:text-stone-300 transition-colors cursor-default">
            <Wine className="w-4 h-4" />
            <span className="font-serif tracking-wide text-sm">Somm</span>
          </div>
          <div className="flex items-center gap-8">
            <Link to="/legal" className="text-xs text-stone-500 hover:text-champagne-100 transition-colors">
              Privacy & Terms
            </Link>
            <p className="text-xs text-stone-600">Drink responsibly.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
