"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronDown, Send, MessageCircle } from "lucide-react"

const faqs = [
  {
    question: "How are dividends calculated?",
    answer:
      "Dividends are calculated from 50% of our net profits each month. The distribution is based on your participation level and total spending on the platform. The more active you are, the larger your share of the dividend pool.",
  },
  {
    question: "When do payouts happen?",
    answer:
      "Payouts are processed monthly on the 1st of each month. You can choose to receive payouts via bank transfer or as site credit in your dashboard settings. Bank transfers may take 3-5 business days to process.",
  },
  {
    question: "How do referrals work?",
    answer:
      "When someone signs up using your unique referral link, you earn 10% of their total spending on competitions as referral income. There's no limit to how much you can earn from referrals - the more people you refer, the more you earn!",
  },
  {
    question: "What happens if I don't claim a payout?",
    answer:
      "If you don't claim a payout within 90 days of it being available, it will be automatically converted to site credit in your account. Site credit never expires and can be used to enter competitions.",
  },
  {
    question: "Can I change my payout method?",
    answer:
      "Yes, you can change your payout method at any time in your dashboard under 'Payout Settings'. Changes will take effect for the next payout cycle. If you switch from bank transfer to site credit, any pending bank transfers will still be processed.",
  },
  {
    question: "How are competition winners selected?",
    answer:
      "All competition winners are selected using a provably fair random number generator. Each entry receives a unique number, and the winning number is drawn randomly. The process is transparent and auditable.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards through our secure Stripe payment system. All transactions are encrypted and secure. We do not store your payment information on our servers.",
  },
  {
    question: "How do I know if I've won a competition?",
    answer:
      "Winners are notified via email within 24 hours of the competition ending. You can also check your dashboard for any winning entries. Prize delivery details will be provided in the winner notification email.",
  },
  {
    question: "Is there a limit to how many competitions I can enter?",
    answer:
      "There's no limit to how many different competitions you can enter. However, some competitions may have a maximum number of entries per person, which will be clearly stated in the competition details.",
  },
  {
    question: "How do I contact support?",
    answer:
      "You can contact our support team at supportlimxcomps@outlook.com. We aim to respond to all inquiries within 24 hours. You can also use the contact form below for quick questions.",
  },
]

export default function HelpPage() {
  const [openItems, setOpenItems] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  // Contact form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  })

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setMessage("")

    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    try {
      // TODO: Replace with actual email service integration
      // For now, simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setMessage("Thank you for your message! We'll get back to you within 24 hours.")
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "",
        message: "",
      })
    } catch (error) {
      setError("Failed to send message. Please try again or email us directly.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-luxury-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-luxury-white mb-4">Help Center</h1>
          <p className="text-xl text-gray-300">Find answers to common questions or get in touch with our team</p>
        </div>

        <div className="space-y-4 mb-16">
          {faqs.map((faq, index) => (
            <Card key={index} className="bg-luxury-grey border-luxury-grey">
              <Collapsible open={openItems.includes(index)} onOpenChange={() => toggleItem(index)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-luxury-black/50 transition-colors">
                    <CardTitle className="text-luxury-white flex items-center justify-between">
                      <span className="text-left">{faq.question}</span>
                      <ChevronDown
                        className={`h-5 w-5 text-gold-500 transition-transform ${
                          openItems.includes(index) ? "rotate-180" : ""
                        }`}
                      />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {/* Contact Form Section */}
        <div className="mt-12">
          <Card className="bg-luxury-grey border-luxury-grey">
            <CardHeader>
              <CardTitle className="text-luxury-white flex items-center">
                <MessageCircle className="h-6 w-6 mr-3 text-gold-500" />
                Still have questions?
              </CardTitle>
              <p className="text-gray-300">Our support team is here to help you with any questions or concerns.</p>
            </CardHeader>
            <CardContent className="p-8">
              {message && (
                <Alert className="mb-6 border-green-500 bg-green-500/10">
                  <AlertDescription className="text-green-400">{message}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert className="mb-6 border-red-500 bg-red-500/10">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-luxury-white">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                      className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-luxury-white">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="category" className="text-luxury-white">
                      Category
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-luxury-black border-luxury-grey">
                        <SelectItem value="general" className="text-luxury-white">
                          General Question
                        </SelectItem>
                        <SelectItem value="competitions" className="text-luxury-white">
                          Competitions
                        </SelectItem>
                        <SelectItem value="dividends" className="text-luxury-white">
                          Dividends & Payouts
                        </SelectItem>
                        <SelectItem value="referrals" className="text-luxury-white">
                          Referrals
                        </SelectItem>
                        <SelectItem value="technical" className="text-luxury-white">
                          Technical Issue
                        </SelectItem>
                        <SelectItem value="account" className="text-luxury-white">
                          Account Support
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-luxury-white">
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      required
                      className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                      placeholder="Brief description of your question"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message" className="text-luxury-white">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    required
                    rows={6}
                    className="mt-1 bg-luxury-black border-luxury-grey text-luxury-white"
                    placeholder="Please provide as much detail as possible about your question or issue..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <p className="text-sm text-gray-400">
                    We typically respond within 24 hours. For urgent matters, email us directly at{" "}
                    <a href="mailto:supportlimxcomps@outlook.com" className="text-gold-500 hover:text-gold-400">
                      supportlimxcomps@outlook.com
                    </a>
                  </p>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gold-500 hover:bg-gold-600 text-luxury-black font-semibold px-8 py-3 min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-luxury-black mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
