"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileSpreadsheet, Check, X } from "lucide-react"
import Link from "next/link"

const pricingTiers = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for individuals getting started with data enrichment",
    features: [
      { name: "Up to 100 rows per month", included: true },
      { name: "Basic AI enrichment", included: true },
      { name: "CSV import/export", included: true },
      { name: "Email support", included: true },
      { name: "Advanced enrichment models", included: false },
      { name: "API access", included: false },
      { name: "Team collaboration", included: false },
      { name: "Priority support", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    price: "$29",
    period: "/month",
    description: "For professionals and small teams who need more power",
    features: [
      { name: "Up to 10,000 rows per month", included: true },
      { name: "Advanced AI enrichment", included: true },
      { name: "CSV import/export", included: true },
      { name: "Priority email support", included: true },
      { name: "Advanced enrichment models", included: true },
      { name: "API access", included: true },
      { name: "Team collaboration (up to 5 users)", included: true },
      { name: "Priority support", included: false },
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For large teams and organizations with advanced needs",
    features: [
      { name: "Unlimited rows", included: true },
      { name: "Advanced AI enrichment", included: true },
      { name: "CSV import/export", included: true },
      { name: "24/7 priority support", included: true },
      { name: "Advanced enrichment models", included: true },
      { name: "Full API access", included: true },
      { name: "Unlimited team collaboration", included: true },
      { name: "Priority support", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export default function PricingPage() {
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
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="font-sans">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-primary hover:bg-primary/90 font-sans shadow-sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="font-sans text-5xl font-bold leading-tight tracking-tight text-foreground mb-6">
              Simple, transparent pricing
            </h1>
            <p className="font-sans text-xl leading-relaxed text-muted-foreground mb-8 max-w-3xl mx-auto">
              Choose the perfect plan for your data enrichment needs. Start free and scale as you grow.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {pricingTiers.map((tier, index) => (
              <Card
                key={tier.name}
                className={`relative border-border shadow-sm ${tier.popular ? "border-primary shadow-lg" : ""}`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground font-sans">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-sans font-semibold text-foreground mb-2">{tier.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-foreground font-sans">{tier.price}</span>
                    {tier.period && <span className="text-muted-foreground font-sans">{tier.period}</span>}
                  </div>
                  <CardDescription className="text-muted-foreground font-sans">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-foreground flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <span
                          className={`font-sans text-sm ${
                            feature.included ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link href={tier.name === "Enterprise" ? "/contact" : "/auth/signup"}>
                    <Button
                      className={`w-full font-sans ${
                        tier.popular
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                      }`}
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="text-center">
            <h2 className="font-sans text-3xl font-bold text-foreground mb-6">Frequently asked questions</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
              <div>
                <h3 className="font-sans text-lg font-semibold text-foreground mb-2">Can I change plans anytime?</h3>
                <p className="text-muted-foreground font-sans">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h3 className="font-sans text-lg font-semibold text-foreground mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-muted-foreground font-sans">
                  We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
                </p>
              </div>
              <div>
                <h3 className="font-sans text-lg font-semibold text-foreground mb-2">Is there a free trial?</h3>
                <p className="text-muted-foreground font-sans">
                  Yes, all paid plans come with a 14-day free trial. No credit card required.
                </p>
              </div>
              <div>
                <h3 className="font-sans text-lg font-semibold text-foreground mb-2">
                  What happens to my data if I cancel?
                </h3>
                <p className="text-muted-foreground font-sans">
                  You can export all your data anytime. We keep your data for 30 days after cancellation.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16 p-12 bg-muted rounded-lg">
            <h2 className="font-sans text-3xl font-bold text-foreground mb-4">Ready to transform your data?</h2>
            <p className="font-sans text-xl text-muted-foreground mb-8">
              Join thousands of professionals who trust AI DataEnrich with their data.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 font-sans shadow-sm">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="font-sans border-border hover:bg-background bg-transparent"
                >
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
