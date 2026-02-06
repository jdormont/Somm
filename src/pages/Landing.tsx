import { Link } from 'react-router-dom';
import { Wine, Camera, Star, Utensils, ArrowRight, ScanLine, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-cream-50">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-50/80 backdrop-blur-md border-b border-stone-200/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Wine className="w-6 h-6 text-wine-800" />
            <span className="font-semibold text-lg text-stone-900 tracking-tight">Somm</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-wine-800 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-wine-900 transition-colors"
              >
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors px-4 py-2"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-wine-800 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-wine-900 transition-colors"
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
          <div className="inline-flex items-center gap-2 bg-wine-100/60 text-wine-800 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <ScanLine className="w-4 h-4" />
            AI-Powered Wine Advisor
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-stone-900 tracking-tight leading-[1.1] mb-6">
            Never second-guess
            <br />
            <span className="text-wine-800">a wine choice</span> again
          </h1>
          <p className="text-lg sm:text-xl text-stone-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Snap a photo of any wine list or shelf, and get instant, personalized
            recommendations based on your taste, budget, and what you're eating.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? '/scan' : '/register'}
              className="inline-flex items-center gap-2 bg-wine-800 text-white px-8 py-3.5 rounded-full text-base font-medium hover:bg-wine-900 transition-all hover:shadow-lg hover:shadow-wine-800/20"
            >
              <Camera className="w-5 h-5" />
              Start scanning
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 px-6 py-3.5 rounded-full text-base font-medium transition-colors"
            >
              See how it works
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white/50">
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
              <div key={feature.title} className="group p-8 rounded-2xl bg-white border border-stone-100 hover:border-wine-200 hover:shadow-lg hover:shadow-wine-800/5 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-wine-50 flex items-center justify-center mb-5 group-hover:bg-wine-100 transition-colors">
                  <feature.icon className="w-6 h-6 text-wine-700" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">{feature.title}</h3>
                <p className="text-stone-500 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 text-center mb-4">How it works</h2>
          <p className="text-stone-500 text-center mb-16 max-w-lg mx-auto">Three simple steps to find your perfect bottle every time.</p>
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
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-wine-800 text-white flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-2">{item.title}</h3>
                  <p className="text-stone-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-wine-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to find your next favorite bottle?
          </h2>
          <p className="text-wine-200 mb-8 text-lg">
            Join Somm and start making confident wine decisions tonight.
          </p>
          <Link
            to={user ? '/scan' : '/register'}
            className="inline-flex items-center gap-2 bg-white text-wine-800 px-8 py-3.5 rounded-full text-base font-semibold hover:bg-cream-100 transition-all hover:shadow-lg"
          >
            Get started free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-stone-200/50 bg-cream-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-400">
            <Wine className="w-4 h-4" />
            <span className="text-sm">Somm</span>
          </div>
          <p className="text-xs text-stone-400">Drink responsibly.</p>
        </div>
      </footer>
    </div>
  );
}
