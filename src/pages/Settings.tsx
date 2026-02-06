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
        <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-stone-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Settings</h1>
          <p className="text-sm text-stone-500">Manage your app configuration</p>
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-5 h-5 text-stone-600" />
            <h2 className="text-lg font-semibold text-stone-900">OpenAI API Key</h2>
          </div>

          <p className="text-sm text-stone-500 mb-4">
            Somm uses OpenAI's vision model to analyze wine lists and bottles.
            You need an OpenAI API key to use the scanner.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Your key is stored locally</p>
                <p className="text-amber-700">
                  Your API key is stored only in this browser's local storage and sent directly to OpenAI
                  through our secure edge function. We never store it on our servers.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-stone-700">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-2.5 pr-12 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-wine-800/20 focus:border-wine-800 transition-all text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {apiKey && !showKey && (
              <p className="text-xs text-stone-400 font-mono">{maskedKey}</p>
            )}
          </div>

          <button
            onClick={handleSave}
            className="mt-4 bg-wine-800 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-wine-900 transition-colors flex items-center gap-2"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              'Save key'
            )}
          </button>

          <div className="mt-6 pt-4 border-t border-stone-100">
            <h3 className="text-sm font-medium text-stone-700 mb-2">How to get an API key</h3>
            <ol className="text-sm text-stone-500 space-y-1.5 list-decimal list-inside">
              <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-wine-800 underline hover:text-wine-900">platform.openai.com/api-keys</a></li>
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
