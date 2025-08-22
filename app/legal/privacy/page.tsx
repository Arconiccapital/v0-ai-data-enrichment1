"use client"

import { Button } from "@/components/ui/button"
import { FileSpreadsheet } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <FileSpreadsheet className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-sans font-semibold text-foreground">AI DataEnrich</h1>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/legal/terms">
                <Button variant="ghost" size="sm" className="font-sans">
                  Terms of Service
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="font-sans">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-12">
            <h1 className="font-sans text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground font-sans text-lg">Last updated: January 20, 2025</p>
          </div>

          <div className="prose prose-gray max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="font-sans text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
                <p className="text-foreground font-sans leading-relaxed mb-4">
                  We collect information you provide directly to us, such as when you create an account, use our
                  services, or contact us for support.
                </p>
                <h3 className="font-sans text-lg font-semibold text-foreground mb-2">Personal Information</h3>
                <ul className="list-disc pl-6 space-y-2 text-foreground font-sans mb-4">
                  <li>Name and email address</li>
                  <li>Company information</li>
                  <li>Billing and payment information</li>
                  <li>Communication preferences</li>
                </ul>
                <h3 className="font-sans text-lg font-semibold text-foreground mb-2">Usage Data</h3>
                <ul className="list-disc pl-6 space-y-2 text-foreground font-sans">
                  <li>Data files you upload and process</li>
                  <li>Service usage patterns and preferences</li>
                  <li>Device and browser information</li>
                  <li>IP address and location data</li>
                </ul>
              </section>

              <section>
                <h2 className="font-sans text-2xl font-semibold text-foreground mb-4">
                  2. How We Use Your Information
                </h2>
                <p className="text-foreground font-sans leading-relaxed mb-4">
                  We use the information we collect to provide, maintain, and improve our services. Specifically, we use
                  your information to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground font-sans">
                  <li>Process and enrich your data using AI technology</li>
                  <li>Provide customer support and respond to your requests</li>
                  <li>Send you technical notices and security alerts</li>
                  <li>Process billing and manage your subscription</li>
                  <li>Improve our services and develop new features</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="font-sans text-2xl font-semibold text-foreground mb-4">3. Data Processing and AI</h2>
                <p className="text-foreground font-sans leading-relaxed mb-4">
                  When you use our AI enrichment services, we process your data to provide enhanced information. This
                  processing may involve:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground font-sans mb-4">
                  <li>Analyzing your data to understand enrichment requirements</li>
                  <li>Using third-party AI services to generate enhanced data</li>
                  <li>Performing web searches to find relevant information</li>
                  <li>Storing processed results for your access and download</li>
                </ul>
                <p className="text-foreground font-sans leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your data during processing.
                </p>
              </section>

              <section>
                <h2 className="font-sans text-2xl font-semibold text-foreground mb-4">
                  4. Data Sharing and Disclosure
                </h2>
                <p className="text-foreground font-sans leading-relaxed mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties except as
                  described in this policy:
                </p>
                <h3 className="font-sans text-lg font-semibold text-foreground mb-2">Service Providers</h3>
                <p className="text-foreground font-sans leading-relaxed mb-4">
                  We may share your information with trusted third-party service providers who assist us in operating
                  our service, such as cloud hosting, payment processing, and AI services.
                </p>
                <h3 className="font-sans text-lg font-semibold text-foreground mb-2">Legal Requirements</h3>
                <p className="text-foreground font-sans leading-relaxed">
                  We may disclose your information if required by law or in response to valid legal requests from public
                  authorities.
                </p>
              </section>

              <section>
                <h2 className="font-sans text-2xl font-semibold text-foreground mb-4">5. Data Security</h2>
                <p className="text-foreground font-sans leading-relaxed mb-4">
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground font-sans">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication measures</li>
                  <li>Secure data centers and infrastructure</li>
                  <li>Employee training on data protection practices</li>
                </ul>
              </section>

              <section>
                <h2 className="font-sans text-2xl font-semibold text-foreground mb-4">6. Data Retention</h2>
                <p className="text-foreground font-sans leading-relaxed mb-4">
                  We retain your information for as long as necessary to provide our services and fulfill the purposes
                  outlined in this policy. Specifically:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground font-sans">
                  <li>Account information is retained while your account is active</li>
                  <li>Processed data is retained according to your subscription plan</li>
                  <li>Billing information is retained for tax and accounting purposes</li>
                  <li>Data is automatically deleted 30 days after account cancellation</li>
                </ul>
              </section>

              <section>
                <h2 className="font-sans text-2xl font-semibold text-foreground mb-4">7. Your Rights</h2>
                <p className="text-foreground font-sans leading-relaxed mb-4">
                  You have certain rights regarding your personal information:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground font-sans">
                  <li>
                    <strong>Access:</strong> Request access to your personal information
                  </li>
                  <li>
                    <strong>Correction:</strong> Request correction of inaccurate information
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your personal information
                  </li>
                  <li>
                    <strong>Portability:</strong> Request export of your data
                  </li>
                  <li>
                    <strong>Objection:</strong> Object to certain processing activities
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="font-sans text-2xl font-semibold text-foreground mb-4">8. Cookies and Tracking</h2>
                <p className="text-foreground font-sans leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to improve your experience on our service. These
                  technologies help us:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground font-sans">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze service usage and performance</li>
                  <li>Provide personalized content and features</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
              </section>

              <section>
                <h2 className="font-sans text-2xl font-semibold text-foreground mb-4">
                  9. International Data Transfers
                </h2>
                <p className="text-foreground font-sans leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. We ensure
                  appropriate safeguards are in place to protect your information in accordance with this privacy
                  policy.
                </p>
              </section>

              <section>
                <h2 className="font-sans text-2xl font-semibold text-foreground mb-4">10. Contact Us</h2>
                <p className="text-foreground font-sans leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at privacy@aidataenrich.com or
                  through our support channels.
                </p>
              </section>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between">
              <Link href="/legal/terms">
                <Button variant="outline" className="font-sans bg-transparent">
                  Terms of Service
                </Button>
              </Link>
              <Link href="/">
                <Button className="bg-primary hover:bg-primary/90 font-sans">Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
