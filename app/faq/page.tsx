"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FileSpreadsheet, Search, MessageCircle, Mail } from "lucide-react"
import Link from "next/link"

const faqCategories = [
  {
    title: "Getting Started",
    questions: [
      {
        question: "How do I upload my first CSV file?",
        answer:
          "Simply drag and drop your CSV file onto the upload area on the homepage, or click to browse and select your file. We support files up to 100MB in size.",
      },
      {
        question: "What file formats are supported?",
        answer:
          "Currently, we support CSV files. We're working on adding support for Excel (.xlsx), Google Sheets, and other formats in the near future.",
      },
      {
        question: "How does AI enrichment work?",
        answer:
          "Our AI analyzes your data and can add missing information like company websites, email addresses, industry classifications, and more. You simply specify what type of information you want to enrich and our AI does the rest.",
      },
    ],
  },
  {
    title: "Account & Billing",
    questions: [
      {
        question: "How do I upgrade my plan?",
        answer:
          "Go to your account settings and click on 'Billing'. You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
      },
      {
        question: "Can I cancel my subscription anytime?",
        answer:
          "Yes, you can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your current billing period.",
      },
      {
        question: "Do you offer refunds?",
        answer:
          "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team for a full refund.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for Enterprise plans.",
      },
    ],
  },
  {
    title: "Data & Privacy",
    questions: [
      {
        question: "Is my data secure?",
        answer:
          "Yes, we take data security seriously. All data is encrypted in transit and at rest. We're SOC 2 compliant and follow industry best practices for data protection.",
      },
      {
        question: "Do you store my data permanently?",
        answer:
          "We store your data securely for as long as you have an active account. You can delete your data at any time, and we automatically delete data 30 days after account cancellation.",
      },
      {
        question: "Can I export my enriched data?",
        answer:
          "Yes, you can export your enriched data as CSV files at any time. There are no restrictions on data export for any plan.",
      },
      {
        question: "Do you share my data with third parties?",
        answer:
          "No, we never share your data with third parties. Your data is yours, and we only use it to provide our enrichment services to you.",
      },
    ],
  },
  {
    title: "Technical Support",
    questions: [
      {
        question: "What browsers are supported?",
        answer:
          "We support all modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using the latest version of your browser.",
      },
      {
        question: "Is there an API available?",
        answer:
          "Yes, we offer a REST API for Professional and Enterprise plans. You can find the API documentation in your account dashboard.",
      },
      {
        question: "How do I contact support?",
        answer:
          "You can contact our support team via email at support@aidataenrich.com or through the chat widget in your dashboard. Enterprise customers have access to priority support.",
      },
      {
        question: "What are your support hours?",
        answer:
          "Our support team is available Monday-Friday, 9 AM - 6 PM EST. Enterprise customers have access to 24/7 priority support.",
      },
    ],
  },
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0)

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
              <Link href="/help">
                <Button variant="ghost" size="sm" className="font-sans">
                  Help Center
                </Button>
              </Link>
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
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="font-sans text-5xl font-bold leading-tight tracking-tight text-foreground mb-6">
              Frequently Asked Questions
            </h1>
            <p className="font-sans text-xl leading-relaxed text-muted-foreground mb-8">
              Find answers to common questions about AI DataEnrich
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-sans"
              />
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {filteredCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="border-border shadow-sm">
                <CardContent className="p-6">
                  <h2 className="font-sans text-2xl font-semibold text-foreground mb-6">{category.title}</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                        <AccordionTrigger className="font-sans text-left hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="font-sans text-muted-foreground">{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Support */}
          <div className="text-center mt-16 p-12 bg-muted rounded-lg">
            <h2 className="font-sans text-3xl font-bold text-foreground mb-4">Still have questions?</h2>
            <p className="font-sans text-xl text-muted-foreground mb-8">
              Our support team is here to help you get the most out of AI DataEnrich.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="bg-primary hover:bg-primary/90 font-sans shadow-sm">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact Support
                </Button>
              </Link>
              <Link href="mailto:support@aidataenrich.com">
                <Button
                  variant="outline"
                  size="lg"
                  className="font-sans border-border hover:bg-background bg-transparent"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Email Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
