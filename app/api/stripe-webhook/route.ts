import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  // If Stripe is not configured, return a demo response
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.log("Stripe not configured - webhook endpoint in demo mode")
    return NextResponse.json({
      message: "Stripe webhook endpoint ready (demo mode)",
      configured: false,
    })
  }

  try {
    // Dynamic import of Stripe to avoid build-time issues
    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-06-20",
    })

    const body = await request.text()
    const sig = request.headers.get("stripe-signature")!

    let event: any

    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message)
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
    }

    const supabase = createServerClient()

    if (event.type === "checkout.session.completed") {
      const session = event.data.object
      const { competitionId, userId, amount } = session.metadata!

      try {
        // Create entry record
        const { error: entryError } = await supabase.from("entries").insert({
          user_id: userId,
          competition_id: competitionId,
          stripe_payment_intent_id: session.payment_intent as string,
          amount_paid: Number.parseFloat(amount),
        })

        if (entryError) {
          console.error("Error creating entry:", entryError)
          return NextResponse.json({ error: "Failed to create entry" }, { status: 500 })
        }

        console.log("Entry created successfully for user:", userId)
      } catch (error) {
        console.error("Error processing webhook:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error in stripe webhook:", error)
    return NextResponse.json({ error: "Stripe not available" }, { status: 500 })
  }
}
