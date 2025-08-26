"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileSpreadsheet, Mail, MessageCircle, Phone } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Contact form submitted:", formData)
    // Handle form submission
  }

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

      <div className="flex-1 overflow-auto">
        <main className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="font-sans text-5xl font-bold leading-tight tracking-tight text-foreground mb-6">
              Get in touch
            </h1>
            <p className="font-sans text-xl leading-relaxed text-muted-foreground mb-8">
              Have questions about Lighthouse AI? We're here to help.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-sans font-semibold text-foreground">Email Support</h3>
                      <p className="text-muted-foreground font-sans">Get help via email</p>
                    </div>
                  </div>
                  <p className="text-foreground font-sans">support@aidataenrich.com</p>
                  <p className="text-sm text-muted-foreground font-sans mt-2">Response within 24 hours</p>
                </CardContent>
              </Card>

              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <MessageCircle className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-sans font-semibold text-foreground">Live Chat</h3>
                      <p className="text-muted-foreground font-sans">Chat with our team</p>
                    </div>
                  </div>
                  <p className="text-foreground font-sans">Available in your dashboard</p>
                  <p className="text-sm text-muted-foreground font-sans mt-2">Monday-Friday, 9 AM - 6 PM EST</p>
                </CardContent>
              </Card>

              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Phone className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-sans font-semibold text-foreground">Enterprise Support</h3>
                      <p className="text-muted-foreground font-sans">Priority phone support</p>
                    </div>
                  </div>
                  <p className="text-foreground font-sans">Available for Enterprise plans</p>
                  <p className="text-sm text-muted-foreground font-sans mt-2">24/7 priority support</p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="font-sans text-2xl font-semibold text-foreground">Send us a message</CardTitle>
                  <CardDescription className="font-sans">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="font-sans">
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="font-sans"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-sans">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="font-sans"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company" className="font-sans">
                          Company
                        </Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleInputChange("company", e.target.value)}
                          className="font-sans"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="font-sans">
                          Subject *
                        </Label>
                        <Select onValueChange={(value) => handleInputChange("subject", value)}>
                          <SelectTrigger className="font-sans">
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="support">Technical Support</SelectItem>
                            <SelectItem value="billing">Billing Question</SelectItem>
                            <SelectItem value="enterprise">Enterprise Sales</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="font-sans">
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        className="font-sans min-h-32"
                        placeholder="Tell us how we can help you..."
                        required
                      />
                    </div>

                    <Button type="submit" className="bg-primary hover:bg-primary/90 font-sans">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
  )
}
