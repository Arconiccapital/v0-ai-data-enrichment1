"use client"

import { Button } from "@/components/ui/button"
import { FileSpreadsheet } from "lucide-react"
import Link from "next/link"

export default function TermsOfServicePage() {
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <FileSpreadsheet className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-sans font-semibold text-foreground">Lighthouse AI</h1>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/legal/privacy">
                <Button variant="ghost" size="sm" className="font-sans">
                  Privacy Policy
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

      <div className="flex-1 overflow-auto">
        <main className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-12">
            <h1 className="font-sans text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
            <p className="text-muted-foreground font-sans text-lg">Last updated: January 20, 2025</p>
          </div>

          <div className="prose prose-gray max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="font-sans text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
                <p className="text-foreground font-sans leading-relaxed mb-4">
                  By accessing and using Lighthouse AI ("the Service"), you accept and agree to be bound by the terms
                  and provision of this agreement. If you do not agree to abide by the above, please do not use this
                  service.
                </p>
                <p className="text-foreground font-sans leading-relaxed">
                  These Terms of Service ("Terms") govern your use of our website located at aidataenrich.com (the
                  "Service") operated by Lighthouse AI ("us", "we", or "our").
                </p>
              </section>

              <section>
                <h2 className="font-sans text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
                <p className="text-foreground font-sans leading-relaxed mb-4">
                  Lighthouse AI provides AI-powered data enrichment services that allow users to upload CSV files and
                  enhance them with additional information using artificial intelligence and web search capabilities.
                </p>
                <p className="text-foreground font-sans leading-relaxed">
                  The Service includes but is not limited to data processing, AI-powered enrichment, data export
                  capabilities, and collaboration tools.
                </p>
              </section>

              <section>
                <h2 className="font-sans text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
                <p className="text-foreground font-sans leading-relaxed mb-4">
                  When you create an account with us, you must provide information that is accurate, complete, and
                  current at all times. You are responsible for safeguarding the password and for all activities that
                  occur under your account.
                </p>
                <p className="text-foreground font-sans leading-relaxed">
                  You agree not to disclose your password to any third party. You must notify us immediately upon
                  becoming aware of any breach of security or unauthorized use of your account.
                </p>
              </section>

              <section>
                <h2 className="font-sans text-2xl font-semibold text-foreground mb-4">4. Acceptable Use</h2>
                <p className="text-foreground font-sans leading-relaxed mb-4">
                  You may use our Service only for lawful purposes and in accordance with these Terms. You agree not to
                  use the Service:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground font-sans">
                  <li>To violate any applicable local, state, national, or international law or regulation</li>
                  <li>To upload, process, or enrich data that you do not have the right to use</li>
                  <li>To engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
                  <li>To attempt to gain unauthorized access to any portion of the Service</li>
                  <li>To use the Service for any commercial purpose without our express written consent</li>
                </ul>
              </section>

              <section>
                <h2 className="font-sans text-2xl font-semibold text-foreground mb-4">5. Data and Privacy</h2>
                <p className="text-foreground font-sans leading-relaxed mb-4">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the
                  Service, to understand our practices.
                </p>
                <p className="text-foreground font-sans leading-relaxed">
                  You retain all rights to your data. We process your data solely to provide the Service and will not
                  share your data with third parties except as described in our Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="font-sans text-2xl font-semibold text-foreground mb-4">6. Subscription and Billing</h2>
                <p className="text-foreground font-sans leading-relaxed mb-4">
                  Some parts of the Service are billed on a subscription basis. You will be billed in advance on a
                  recurring basis. Billing cycles are set on a monthly or annual basis, depending on the type of
                  subscription plan you select.
                </p>
                <p className="text-foreground font-sans leading-relaxed">
                  A valid payment method is required to process the payment for your subscription. You shall provide
                  accurate and complete billing information.
                </p>
              </section>

              <section>
                <h2 className="font-sans text-2xl font-semibold text-foreground mb-4">7. Limitation of Liability</h2>
                <p className="text-foreground font-sans leading-relaxed mb-4">
                  In no event shall Lighthouse AI, nor its directors, employees, partners, agents, suppliers, or
                  affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages,
                  including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
                  resulting from your use of the Service.
                </p>
              </section>

              <section>
                <h2 className="font-sans text-2xl font-semibold text-foreground mb-4">8. Termination</h2>
                <p className="text-foreground font-sans leading-relaxed mb-4">
                  We may terminate or suspend your account immediately, without prior notice or liability, for any
                  reason whatsoever, including without limitation if you breach the Terms.
                </p>
                <p className="text-foreground font-sans leading-relaxed">
                  Upon termination, your right to use the Service will cease immediately. If you wish to terminate your
                  account, you may simply discontinue using the Service.
                </p>
              </section>

              <section>
                <h2 className="font-sans text-2xl font-semibold text-foreground mb-4">9. Changes to Terms</h2>
                <p className="text-foreground font-sans leading-relaxed mb-4">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a
                  revision is material, we will try to provide at least 30 days notice prior to any new terms taking
                  effect.
                </p>
              </section>

              <section>
                <h2 className="font-sans text-2xl font-semibold text-foreground mb-4">10. Contact Information</h2>
                <p className="text-foreground font-sans leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at legal@aidataenrich.com.
                </p>
              </section>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between">
              <Link href="/legal/privacy">
                <Button variant="outline" className="font-sans bg-transparent">
                  Privacy Policy
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
    </div>
  )
}
