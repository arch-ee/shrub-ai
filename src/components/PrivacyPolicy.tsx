
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

const PrivacyPolicy = ({ onBack }: PrivacyPolicyProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-cream-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <h1 className="text-3xl font-bold text-leaf-900 dark:text-cream-100">Privacy Policy</h1>
        </div>

        <Card className="p-8 bg-white/100 border-leaf-100 shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <ScrollArea className="h-[70vh] pr-4">
            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
                <p className="text-lg mb-4">
                  <strong>We do not collect any personal data from our users.</strong> This privacy policy explains how shrubAI operates as a privacy-first plant identification application.
                </p>
              </div>

              <section>
                <h2 className="text-2xl font-semibold text-leaf-800 dark:text-leaf-300 mb-3">1. Information We Do NOT Collect</h2>
                <p className="mb-3">shrubAI is designed with privacy in mind. We do not collect, store, or process any of the following:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Personal identification information (name, email, phone number, address)</li>
                  <li>Device identifiers or unique device information</li>
                  <li>Location data or GPS coordinates</li>
                  <li>Photos you take or upload (processed locally and via secure AI services only)</li>
                  <li>Usage analytics or behavioral tracking data</li>
                  <li>Cookies or persistent storage of personal information</li>
                  <li>Account information or user profiles</li>
                  <li>Payment or financial information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-leaf-800 dark:text-leaf-300 mb-3">2. How the App Works</h2>
                <p className="mb-3">shrubAI processes plant identification requests in the following privacy-preserving manner:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Local Processing:</strong> Your photos are processed on your device first</li>
                  <li><strong>Secure AI Analysis:</strong> Images are sent securely to Google's Gemini AI for identification</li>
                  <li><strong>No Storage:</strong> Images are not stored on our servers or Google's servers after processing</li>
                  <li><strong>Anonymous Processing:</strong> All AI requests are made anonymously without user identification</li>
                  <li><strong>Local Settings:</strong> Your app preferences are stored only on your device</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-leaf-800 dark:text-leaf-300 mb-3">3. Third-Party Services</h2>
                <p className="mb-3">shrubAI uses the following third-party services for core functionality:</p>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-leaf-700 dark:text-leaf-400">Google Gemini AI</h3>
                    <p>Used for plant identification. Images are processed anonymously and are not retained after analysis. Google's privacy policy applies to this processing.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-leaf-700 dark:text-leaf-400">Shopping Links</h3>
                    <p>When you click on shopping links, you are redirected to third-party retailers. We do not track these interactions or receive any data from these retailers.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-leaf-800 dark:text-leaf-300 mb-3">4. Data Security</h2>
                <p className="mb-3">Even though we don't collect personal data, we implement security measures:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All communications with AI services use HTTPS encryption</li>
                  <li>No data is stored on our servers</li>
                  <li>App preferences are stored locally on your device only</li>
                  <li>No user accounts or authentication systems are required</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-leaf-800 dark:text-leaf-300 mb-3">5. Children's Privacy</h2>
                <p>
                  Since we do not collect any personal information, shrubAI is safe for users of all ages, including children under 13. We do not knowingly collect personal information from children because we don't collect personal information from anyone.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-leaf-800 dark:text-leaf-300 mb-3">6. Your Rights and Control</h2>
                <p className="mb-3">Since we don't collect personal data, you automatically have:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Complete control over your data (it stays on your device)</li>
                  <li>No need to request data deletion (there's nothing to delete)</li>
                  <li>No need to opt-out of data collection (there is no data collection)</li>
                  <li>Full transparency about app functionality</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-leaf-800 dark:text-leaf-300 mb-3">7. International Users</h2>
                <p>
                  This privacy-first approach means shrubAI complies with international privacy regulations including GDPR, CCPA, and other data protection laws by design, since no personal data is collected or processed.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-leaf-800 dark:text-leaf-300 mb-3">8. Permissions</h2>
                <p className="mb-3">The app may request the following device permissions:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Camera:</strong> To take photos of plants for identification (photos are not stored)</li>
                  <li><strong>Photo Library:</strong> To select existing photos for identification</li>
                  <li><strong>Notifications:</strong> For optional plant care reminders (stored locally)</li>
                </ul>
                <p className="mt-3">All permissions are used only for their stated purpose and do not result in data collection.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-leaf-800 dark:text-leaf-300 mb-3">9. Changes to This Policy</h2>
                <p>
                  If we ever change our privacy practices, we will update this policy and notify users through the app. However, our commitment to not collecting personal data will remain unchanged.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-leaf-800 dark:text-leaf-300 mb-3">10. Contact Information</h2>
                <p>
                  If you have questions about this privacy policy or shrubAI's privacy practices, you can contact us through the app's feedback feature or support channels.
                </p>
              </section>

              <section className="border-t pt-6 mt-8">
                <h2 className="text-2xl font-semibold text-leaf-800 dark:text-leaf-300 mb-3">Summary</h2>
                <div className="bg-leaf-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="font-medium text-leaf-800 dark:text-leaf-300">
                    shrubAI is committed to your privacy. We built this app to be completely private by design - no data collection, no tracking, no storage of personal information. Your plant identification journey is yours alone.
                  </p>
                </div>
              </section>
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
