"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Mock password reset for demo:", email)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center justify-center gap-2 mb-8">
            <Image 
              src="/arconic-logo.svg" 
              alt="Arconic" 
              width={160} 
              height={40}
              className="h-10 w-auto mb-2"
            />
            <h1 className="text-2xl font-sans font-semibold text-foreground">Lighthouse AI</h1>
          </div>

          <Card className="border-border shadow-sm">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-sans font-semibold text-foreground">Check your email</CardTitle>
              <CardDescription className="text-muted-foreground font-sans">
                Password reset email sent to {email} (Demo mode - no actual email sent)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground font-sans">
                  This is a demo version. In production, you would receive an actual reset email.{" "}
                  <button onClick={() => setIsSubmitted(false)} className="text-foreground hover:underline font-medium">
                    Try again
                  </button>
                </p>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full font-sans bg-transparent">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center gap-2 mb-8">
          <Image 
            src="/arconic-logo.svg" 
            alt="Arconic" 
            width={160} 
            height={40}
            className="h-10 w-auto mb-2"
          />
          <h1 className="text-2xl font-sans font-semibold text-foreground">Lighthouse AI</h1>
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-sans font-semibold text-foreground">Reset password</CardTitle>
            <CardDescription className="text-muted-foreground font-sans">
              Enter your email and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground font-sans">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="font-sans"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 font-sans">
                Send Reset Link
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground font-sans">
                <ArrowLeft className="h-4 w-4 inline mr-1" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
