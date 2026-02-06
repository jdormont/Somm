import { Link } from 'react-router-dom';
import { Wine, Camera, Star, Utensils, ArrowRight, ScanLine, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-wine-slate-950">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-wine-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Wine className="w-6 h-6 text-champagne-400 transition-colors duration-500" />
            <span className="font-serif font-light text-xl text-champagne-100 tracking-tight group-hover:text-champagne-400 transition-colors duration-500">Somm</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-somm-red-900 text-champagne-100 px-5 py-2 rounded-xl text-sm font-sans font-medium hover:bg-somm-red-500 hover:shadow-lg hover:shadow-somm-red-500/20 transition-all duration-500"
              >
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-sans font-medium text-champagne-100/60 hover:text-champagne-100 transition-colors duration-500 px-4 py-2"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-somm-red-900 text-champagne-100 px-5 py-2 rounded-xl text-sm font-sans font-medium hover:bg-somm-red-500 hover:shadow-lg hover:shadow-somm-red-500/20 transition-all duration-500"
                >
                  Get started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-champagne-400/10 text-champagne-400 border border-champagne-400/20 px-4 py-1.5 rounded-full text-sm font-sans font-medium mb-8">
            <ScanLine className="w-4 h-4" />
            AI-Powered Wine Advisor
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-light text-champagne-100 tracking-tight leading-[1.1] mb-6">
            Never second-guess
            <br />
            <span className="text-champagne-400">a wine choice</span> again
          </h1>
          <p className="text-lg sm:text-xl font-sans tracking-wide text-champagne-100/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Snap a photo of any wine list or shelf, and get instant, personalized
            recommendations based on your taste, budget, and what you're eating.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? '/scan' : '/register'}
              className="inline-flex items-center gap-2 bg-somm-red-900 text-champagne-100 border border-somm-red-500/30 px-8 py-3.5 rounded-xl text-base font-sans font-medium hover:bg-somm-red-500 hover:border-champagne-400/50 hover:shadow-lg hover:shadow-somm-red-500/20 transition-all duration-500"
            >
              <Camera className="w-5 h-5" />
              Start scanning
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-champagne-100/60 hover:text-champagne-100 px-6 py-3.5 rounded-xl text-base font-sans font-medium transition-all duration-500"
            >
              See how it works
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-wine-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: 'Scan any wine list',
                desc: 'Take a photo of a restaurant menu, wine shop shelf, or bottle label. Our AI reads and identifies every wine.',
              },
              {
                icon: Star,
                title: 'Personalized picks',
                desc: 'Set your preferences once -- favorite types, regions, and flavor profiles -- and get tailored recommendations every time.',
              },
              {
                icon: Utensils,
                title: 'Perfect pairings',
                desc: "Tell us what you're eating and your budget. We'll find the wine that makes your meal unforgettable.",
              },
            ].map((feature) => (
              <div key={feature.title} className="group p-8 rounded-2xl bg-wine-slate-900/80 backdrop-blur-md border border-white/10 hover:border-champagne-400/30 hover:shadow-2xl hover:shadow-champagne-400/5 transition-all duration-500">
                <div className="w-12 h-12 rounded-xl bg-champagne-400/10 border border-champagne-400/20 flex items-center justify-center mb-5 group-hover:bg-champagne-400/20 transition-all duration-500">
                  <feature.icon className="w-6 h-6 text-champagne-400" />
                </div>
                <h3 className="text-lg font-serif font-light text-champagne-100 mb-2">{feature.title}</h3>
                <p className="text-champagne-100/60 font-sans tracking-wide leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-serif font-light text-champagne-100 text-center mb-4">How it works</h2>
          <p className="text-champagne-100/60 font-sans tracking-wide text-center mb-16 max-w-lg mx-auto">Three simple steps to find your perfect bottle every time.</p>
          <div className="space-y-12">
            {[
              {
                step: '01',
                title: 'Set your preferences',
                desc: 'Tell us what you love -- red or white, Old World or New, bold or delicate. Your profile helps us understand your palate.',
              },
              {
                step: '02',
                title: 'Snap & scan',
                desc: 'At a restaurant or shop, take a photo of the wine list or shelf. Our AI instantly reads and identifies every option available.',
              },
              {
                step: '03',
                title: 'Get your recommendation',
                desc: 'Receive ranked picks with match scores, tasting notes, and food pairing suggestions -- all personalized to you.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 sm:gap-8 items-start">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-somm-red-900 border border-champagne-400/30 text-champagne-400 flex items-center justify-center font-serif font-light text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-serif font-light text-champagne-100 mb-2">{item.title}</h3>
                  <p className="text-champagne-100/60 font-sans tracking-wide leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-somm-red-900 border-t border-champagne-400/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-light text-champagne-100 mb-4">
            Ready to find your next favorite bottle?
          </h2>
          <p className="text-champagne-100/60 font-sans tracking-wide mb-8 text-lg">
            Join Somm and start making confident wine decisions tonight.
          </p>
          <Link
            to={user ? '/scan' : '/register'}
            className="inline-flex items-center gap-2 bg-champagne-100 text-somm-red-900 px-8 py-3.5 rounded-xl text-base font-sans font-semibold hover:bg-champagne-400 hover:shadow-lg hover:shadow-champagne-400/20 transition-all duration-500"
          >
            Get started free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-white/5 bg-wine-slate-950">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-champagne-100/40">
            <Wine className="w-4 h-4" />
            <span className="text-sm font-serif font-light">Somm</span>
          </div>
          <p className="text-xs text-champagne-100/40 font-sans tracking-wide">Drink responsibly.</p>
        </div>
      </footer>
    </div>
  );
}
