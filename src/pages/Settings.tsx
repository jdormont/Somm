import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Check, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const API_KEY_STORAGE_KEY = 'somm_openai_api_key';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (stored) setApiKey(stored);
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const maskedKey = apiKey
    ? `${apiKey.slice(0, 7)}${'*'.repeat(Math.max(0, apiKey.length - 11))}${apiKey.slice(-4)}`
    : '';

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
          <SettingsIcon className="w-5 h-5 text-stone-400" />
        </div>
        <div>
          <h1 className="text-2xl font-serif text-champagne-100">Settings</h1>
          <p className="text-sm text-stone-500 font-light">Manage your app configuration</p>
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-wine-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-5 h-5 text-champagne-400" />
            <h2 className="text-lg font-medium text-champagne-100">OpenAI API Key</h2>
          </div>

          <p className="text-sm text-stone-400 mb-6 leading-relaxed font-light">
            Somm uses OpenAI's vision model to analyze wine lists and bottles.
            You need an OpenAI API key to use the scanner.
          </p>

          <div className="bg-amber-900/10 border border-amber-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-200/80">
                <p className="font-medium mb-1 text-amber-200">Your key is stored locally</p>
                <p className="font-light leading-relaxed">
                  Your API key is stored only in this browser's local storage and sent directly to OpenAI
                  through our secure edge function. We never store it on our servers.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-3 pr-12 rounded-xl border border-white/10 bg-black/20 text-champagne-100 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-champagne-400/50 focus:border-champagne-400/50 transition-all text-sm font-mono backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {apiKey && !showKey && (
              <p className="text-xs text-stone-500 font-mono pl-1">{maskedKey}</p>
            )}
          </div>

          <button
            onClick={handleSave}
            className="mt-6 bg-somm-red-900/80 text-champagne-100 px-6 py-3 rounded-xl font-medium text-sm hover:bg-somm-red-800 transition-all flex items-center gap-2 border border-somm-red-500/30 hover:shadow-lg hover:shadow-somm-red-900/20"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Saved!
              </>
            ) : (
              'Save key'
            )}
          </button>

          <div className="mt-8 pt-6 border-t border-white/5">
            <h3 className="text-sm font-medium text-stone-400 mb-3">How to get an API key</h3>
            <ol className="text-sm text-stone-500 space-y-2 list-decimal list-inside font-light">
              <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-champagne-400 hover:text-champagne-300 hover:underline transition-colors">platform.openai.com/api-keys</a></li>
              <li>Sign in or create an account</li>
              <li>Click "Create new secret key"</li>
              <li>Copy the key and paste it above</li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}
