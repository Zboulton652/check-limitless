"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  Calendar,
  Zap,
  CreditCard,
  Banknote,
  Calculator,
  Info,
  Crown,
  Sparkles,
} from "lucide-react"
import ScrollReveal from "@/components/scroll-reveal"
import Link from "next/link"

export default function DividendsPage() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-luxury-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                <DollarSign className="h-10 w-10 text-luxury-black" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-luxury-white mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                Revolutionary
              </span>{" "}
              Dividends
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              We share our success with you. Earn dividends from our profits just by participating in competitions.
            </p>
            <div className="mt-8">
              <Badge className="bg-gradient-to-r from-violet-500 to-violet-600 text-white border-none px-4 py-2 text-lg font-bold">
                <Crown className="w-5 h-5 mr-2" />
                Industry First: Up to 90% Profit Share
              </Badge>
            </div>
          </div>
        </ScrollReveal>

        {/* Key Benefits */}
        <ScrollReveal delay={100}>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: TrendingUp,
                title: "Growing Returns",
                description: "Starting at 50% profit share, scaling to 90% over time",
                color: "from-green-400 to-green-600",
              },
              {
                icon: Zap,
                title: "Immediate Rewards",
                description: "30% of your dividend paid within 24 hours of each draw",
                color: "from-yellow-400 to-yellow-500",
              },
              {
                icon: Users,
                title: "Fair Distribution",
                description: "Your share based on your participation level",
                color: "from-violet-400 to-violet-600",
              },
            ].map((benefit, index) => (
              <Card
                key={index}
                className="bg-luxury-grey/30 backdrop-blur-xl border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-500 hover:scale-105 group"
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-luxury-white mb-4 group-hover:text-yellow-400 transition-colors duration-300">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-300">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollReveal>

        {/* How It Works */}
        <ScrollReveal delay={150}>
          <Card className="bg-luxury-grey/30 backdrop-blur-xl border border-violet-400/30 mb-16">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-luxury-white flex items-center">
                <Sparkles className="h-8 w-8 mr-3 text-yellow-400" />
                How Dividends Work
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-yellow-400 mb-4">The Simple Formula</h3>
                  <div className="space-y-4 text-gray-300">
                    <p className="text-lg">
                      <strong className="text-luxury-white">Step 1:</strong> We calculate our net profit (gross revenue
                      minus running costs)
                    </p>
                    <p className="text-lg">
                      <strong className="text-luxury-white">Step 2:</strong> We share 50% of net profit with all players
                      (scaling to 90% over time)
                    </p>
                    <p className="text-lg">
                      <strong className="text-luxury-white">Step 3:</strong> Your share = (your spending ÷ total
                      spending) × dividend pool
                    </p>
                    <p className="text-lg">
                      <strong className="text-luxury-white">Step 4:</strong> You receive 30% immediately, 70% monthly
                    </p>
                  </div>
                </div>
                <div className="bg-luxury-black/50 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-yellow-400 mb-4 flex items-center">
                    <Calculator className="h-5 w-5 mr-2" />
                    Example Calculation
                  </h4>
                  <div className="space-y-3 text-gray-300">
                    <div className="flex justify-between">
                      <span>Gross Revenue:</span>
                      <span className="text-luxury-white font-semibold">£20,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Running Costs:</span>
                      <span className="text-red-400">-£8,000</span>
                    </div>
                    <Separator className="bg-luxury-grey" />
                    <div className="flex justify-between">
                      <span>Net Profit:</span>
                      <span className="text-green-400 font-semibold">£12,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dividend Pool (50%):</span>
                      <span className="text-yellow-400 font-bold">£6,000</span>
                    </div>
                    <Separator className="bg-luxury-grey" />
                    <div className="text-sm text-gray-400 mt-4">
                      If you spent £100 out of £10,000 total spending, your share would be £60 (1% of the pool)
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Payout Structure */}
        <ScrollReveal delay={200}>
          <Card className="bg-luxury-grey/30 backdrop-blur-xl border border-yellow-400/30 mb-16">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-luxury-white flex items-center">
                <Clock className="h-8 w-8 mr-3 text-violet-400" />
                Payout Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Immediate Payout */}
                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-xl p-6 border border-yellow-400/20">
                  <div className="flex items-center mb-4">
                    <Zap className="h-8 w-8 text-yellow-400 mr-3" />
                    <div>
                      <h3 className="text-2xl font-bold text-yellow-400">Immediate Payout</h3>
                      <p className="text-gray-300">30% of your dividend share</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Timing:</span>
                      <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">Within 24 hours</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Trigger:</span>
                      <span className="text-luxury-white">After each competition draw</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Purpose:</span>
                      <span className="text-luxury-white">Quick engagement reward</span>
                    </div>
                  </div>
                </div>

                {/* Monthly Payout */}
                <div className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 rounded-xl p-6 border border-violet-400/20">
                  <div className="flex items-center mb-4">
                    <Calendar className="h-8 w-8 text-violet-400 mr-3" />
                    <div>
                      <h3 className="text-2xl font-bold text-violet-400">Monthly Payout</h3>
                      <p className="text-gray-300">70% of your dividend share</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Timing:</span>
                      <Badge className="bg-violet-400/20 text-violet-400 border-violet-400/30">1st of each month</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Accrual Period:</span>
                      <span className="text-luxury-white">Full previous month</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Amount:</span>
                      <span className="text-luxury-white">Larger cumulative reward</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Payment Methods */}
        <ScrollReveal delay={250}>
          <Card className="bg-luxury-grey/30 backdrop-blur-xl border border-violet-400/30 mb-16">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-luxury-white flex items-center">
                <CreditCard className="h-8 w-8 mr-3 text-green-400" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Bank Transfer */}
                <div className="bg-luxury-black/50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Banknote className="h-8 w-8 text-green-400 mr-3" />
                    <h3 className="text-2xl font-bold text-green-400">Bank Transfer</h3>
                  </div>
                  <div className="space-y-3 text-gray-300">
                    <p>Direct transfer to your bank account</p>
                    <div className="space-y-2">
                      <p>
                        <strong className="text-luxury-white">Required:</strong> Sort code & account number
                      </p>
                      <p>
                        <strong className="text-luxury-white">Processing:</strong> 3-5 business days
                      </p>
                      <p>
                        <strong className="text-luxury-white">Minimum:</strong> £5 per payout
                      </p>
                    </div>
                  </div>
                </div>

                {/* Competition Credit */}
                <div className="bg-luxury-black/50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <CreditCard className="h-8 w-8 text-yellow-400 mr-3" />
                    <h3 className="text-2xl font-bold text-yellow-400">Competition Credit</h3>
                  </div>
                  <div className="space-y-3 text-gray-300">
                    <p>Auto-applied at your next checkout</p>
                    <div className="space-y-2">
                      <p>
                        <strong className="text-luxury-white">Processing:</strong> Instant
                      </p>
                      <p>
                        <strong className="text-luxury-white">Validity:</strong> 12 months
                      </p>
                      <p>
                        <strong className="text-luxury-white">Default:</strong> For unclaimed dividends
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-xl border border-blue-400/20">
                <div className="flex items-start">
                  <Info className="h-6 w-6 text-blue-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-bold text-blue-400 mb-2">Important Notes</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• Minimum payout threshold: £5 per payment type</li>
                      <li>• Change payment method by contacting support 3+ days before cutoff</li>
                      <li>• Unclaimed dividends automatically convert to competition credit</li>
                      <li>• Both immediate and monthly payouts use your selected method</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Growing Profit Share */}
        <ScrollReveal delay={300}>
          <Card className="bg-gradient-to-br from-yellow-500/10 to-violet-500/10 backdrop-blur-xl border border-yellow-400/30 mb-16">
            <CardContent className="p-8 text-center">
              <TrendingUp className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-luxury-white mb-4">
                <span className="bg-gradient-to-r from-yellow-400 to-violet-400 bg-clip-text text-transparent">
                  Growing Profit Share
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-6 max-w-3xl mx-auto">
                We start by sharing 50% of our net profits with players, but this percentage will grow over time,
                eventually reaching up to 90% as our platform matures and scales.
              </p>
              <div className="flex justify-center items-center space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">50%</div>
                  <div className="text-gray-400">Starting Share</div>
                </div>
                <div className="text-4xl text-violet-400">→</div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-violet-400">90%</div>
                  <div className="text-gray-400">Future Target</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* CTA Section */}
        <ScrollReveal delay={350}>
          <div className="text-center">
            <Card className="bg-gradient-to-br from-luxury-grey/40 to-luxury-black/60 backdrop-blur-xl border border-yellow-400/30">
              <CardContent className="p-12">
                <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
                <h2 className="text-4xl font-bold text-luxury-white mb-6">Ready to Start Earning Dividends?</h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join thousands of players already earning from our revolutionary profit-sharing system.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/register" onClick={scrollToTop}>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-luxury-black font-bold px-12 py-4 text-xl rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/25 hover:scale-105"
                    >
                      Start Earning Now
                    </Button>
                  </Link>
                  <Link href="/competitions" onClick={scrollToTop}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-violet-400 text-violet-400 hover:bg-violet-400 hover:text-luxury-black font-bold px-12 py-4 text-xl rounded-xl bg-transparent backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-violet-400/25"
                    >
                      View Competitions
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
