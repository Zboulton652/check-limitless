"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send } from "lucide-react"

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm here to help with any questions about Limitless X Competitions. Ask me about dividends, payouts, referrals, or anything else!",
      isBot: true,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const faqResponses: Record<string, string> = {
    dividends:
      "Dividends are calculated from 50% of our net profits and distributed monthly to all users based on their participation and spending.",
    payouts:
      "Payouts happen monthly on the 1st of each month. You can choose between bank transfer or site credit in your dashboard.",
    referrals:
      "You earn 10% of your referees' total spending as referral income. Share your unique referral link to start earning!",
    claim: "If you don't claim a payout within 90 days, it will be automatically converted to site credit.",
    "payout method": "You can change your payout method anytime in your dashboard under Payout Preferences.",
  }

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()

    for (const [key, response] of Object.entries(faqResponses)) {
      if (message.includes(key)) {
        return response
      }
    }

    return "I'm not sure about that specific question. For detailed support, please contact us at supportlimxcomps@outlook.com and our team will help you!"
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        isBot: true,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Chat Bubble */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gold-500 hover:bg-gold-600 text-luxury-black shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-luxury-white border border-luxury-grey rounded-lg shadow-xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-luxury-grey bg-luxury-black rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-gold-500" />
              <span className="font-semibold text-luxury-white">Support Chat</span>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-luxury-white hover:text-gold-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.isBot ? "bg-luxury-grey text-luxury-white" : "bg-gold-500 text-luxury-black"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-luxury-grey text-luxury-white px-3 py-2 rounded-lg text-sm">Typing...</div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-luxury-grey">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-gold-500 hover:bg-gold-600 text-luxury-black"
                disabled={isLoading || !inputValue.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
