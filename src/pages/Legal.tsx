import { Link } from 'react-router-dom';
import { Wine, ArrowLeft } from 'lucide-react';

export default function Legal() {
  return (
    <div className="min-h-screen bg-cream-50">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-50/80 backdrop-blur-md border-b border-stone-200/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Wine className="w-6 h-6 text-wine-800" />
            <span className="font-semibold text-lg text-stone-900 tracking-tight">Somm</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-stone-900 mb-2">Legal Information</h1>
          <p className="text-stone-500 mb-12">Last updated: February 7, 2026</p>

          <div className="space-y-16">
            <section>
              <h2 className="text-3xl font-bold text-stone-900 mb-6 pb-3 border-b border-stone-200">
                Privacy Policy
              </h2>

              <div className="prose prose-stone max-w-none space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">1. Information We Collect</h3>
                  <p className="text-stone-600 leading-relaxed mb-3">
                    When you use Somm, we collect information that you provide directly to us, including:
                  </p>
                  <ul className="list-disc list-inside text-stone-600 space-y-2 ml-4">
                    <li>Account information (email address)</li>
                    <li>Wine preferences and taste profiles</li>
                    <li>Scan history and wine selections</li>
                    <li>Restaurant preferences and budget information</li>
                    <li>Wine memories and notes you create</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">2. How We Use Your Information</h3>
                  <p className="text-stone-600 leading-relaxed mb-3">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc list-inside text-stone-600 space-y-2 ml-4">
                    <li>Provide personalized wine recommendations</li>
                    <li>Improve our AI recommendation algorithm</li>
                    <li>Maintain your scan history and wine cellar</li>
                    <li>Send you service-related communications</li>
                    <li>Analyze usage patterns to improve our service</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">3. Information Sharing</h3>
                  <p className="text-stone-600 leading-relaxed">
                    We do not sell, trade, or rent your personal information to third parties. We may share
                    your information only in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside text-stone-600 space-y-2 ml-4 mt-3">
                    <li>With service providers who assist in operating our platform</li>
                    <li>When required by law or to protect our legal rights</li>
                    <li>With your explicit consent</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">4. Data Security</h3>
                  <p className="text-stone-600 leading-relaxed">
                    We implement appropriate security measures to protect your personal information. Your
                    data is stored securely using industry-standard encryption. However, no method of
                    transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">5. Your Rights</h3>
                  <p className="text-stone-600 leading-relaxed mb-3">You have the right to:</p>
                  <ul className="list-disc list-inside text-stone-600 space-y-2 ml-4">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate information</li>
                    <li>Request deletion of your data</li>
                    <li>Export your data</li>
                    <li>Opt out of marketing communications</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">6. Cookies and Tracking</h3>
                  <p className="text-stone-600 leading-relaxed">
                    We use cookies and similar tracking technologies to maintain your session and improve
                    your experience. You can control cookie settings through your browser preferences.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">7. Age Requirements</h3>
                  <p className="text-stone-600 leading-relaxed">
                    Somm is only available to users who are of legal drinking age in their jurisdiction.
                    We do not knowingly collect information from individuals under the legal drinking age.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-stone-900 mb-6 pb-3 border-b border-stone-200">
                Terms of Service
              </h2>

              <div className="prose prose-stone max-w-none space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">1. Acceptance of Terms</h3>
                  <p className="text-stone-600 leading-relaxed">
                    By accessing and using Somm, you accept and agree to be bound by these Terms of Service.
                    If you do not agree to these terms, please do not use our service.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">2. Use of Service</h3>
                  <p className="text-stone-600 leading-relaxed mb-3">
                    You agree to use Somm only for lawful purposes and in accordance with these Terms.
                    You agree not to:
                  </p>
                  <ul className="list-disc list-inside text-stone-600 space-y-2 ml-4">
                    <li>Use the service in any way that violates applicable laws</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Interfere with or disrupt the service</li>
                    <li>Use automated systems to access the service without permission</li>
                    <li>Share your account credentials with others</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">3. User Accounts</h3>
                  <p className="text-stone-600 leading-relaxed">
                    You are responsible for maintaining the confidentiality of your account credentials and
                    for all activities that occur under your account. You must notify us immediately of any
                    unauthorized use of your account.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">4. Recommendations Disclaimer</h3>
                  <p className="text-stone-600 leading-relaxed">
                    Wine recommendations provided by Somm are based on AI analysis and your stated preferences.
                    These are suggestions only and should not be considered professional sommelier advice.
                    Individual taste preferences may vary, and we cannot guarantee satisfaction with any
                    recommended wine.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">5. Responsible Drinking</h3>
                  <p className="text-stone-600 leading-relaxed">
                    You must be of legal drinking age in your jurisdiction to use this service. Somm promotes
                    responsible alcohol consumption. Please drink responsibly and never drink and drive.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">6. Intellectual Property</h3>
                  <p className="text-stone-600 leading-relaxed">
                    All content, features, and functionality of Somm are owned by us and are protected by
                    copyright, trademark, and other intellectual property laws. You may not copy, modify,
                    distribute, or create derivative works without our express permission.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">7. Limitation of Liability</h3>
                  <p className="text-stone-600 leading-relaxed">
                    Somm is provided "as is" without warranties of any kind. We shall not be liable for any
                    indirect, incidental, special, consequential, or punitive damages resulting from your use
                    or inability to use the service.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">8. Modifications to Service</h3>
                  <p className="text-stone-600 leading-relaxed">
                    We reserve the right to modify or discontinue the service at any time, with or without
                    notice. We shall not be liable to you or any third party for any modification, suspension,
                    or discontinuance of the service.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">9. Termination</h3>
                  <p className="text-stone-600 leading-relaxed">
                    We may terminate or suspend your account and access to the service immediately, without
                    prior notice or liability, for any reason, including breach of these Terms.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">10. Changes to Terms</h3>
                  <p className="text-stone-600 leading-relaxed">
                    We reserve the right to modify these Terms at any time. We will notify users of any
                    material changes. Your continued use of the service after changes constitutes acceptance
                    of the modified Terms.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">11. Governing Law</h3>
                  <p className="text-stone-600 leading-relaxed">
                    These Terms shall be governed by and construed in accordance with applicable laws,
                    without regard to conflict of law provisions.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-3">12. Contact Information</h3>
                  <p className="text-stone-600 leading-relaxed">
                    If you have any questions about these Terms or Privacy Policy, please contact us through
                    your account settings.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <footer className="py-8 px-6 border-t border-stone-200/50 bg-cream-50">
        <div className="max-w-6xl mx-auto text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors">
            <Wine className="w-4 h-4" />
            <span className="text-sm">Somm</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
