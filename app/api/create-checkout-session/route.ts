import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { competitionId, amount, userId } = await request.json()

    if (!competitionId || !amount || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Verify competition exists and is active
    const { data: competition, error: competitionError } = await supabase
      .from("competitions")
      .select("*")
      .eq("id", competitionId)
      .eq("status", "active")
      .single()

    if (competitionError || !competition) {
      return NextResponse.json({ error: "Competition not found or inactive" }, { status: 404 })
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      // Demo mode - return success URL without actual payment
      const demoSuccessUrl = `${request.nextUrl.origin}/competitions/${competitionId}?demo=true&success=true`

      return NextResponse.json({
        url: demoSuccessUrl,
        message: "Demo mode - Stripe integration pending",
        demo: true,
      })
    }

    try {
      // Dynamic import of Stripe to avoid build-time issues
      const Stripe = (await import("stripe")).default
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2024-06-20",
      })

      // TODO: Add actual Stripe checkout session creation here when ready
      const demoSuccessUrl = `${request.nextUrl.origin}/competitions/${competitionId}?demo=true&success=true`

      return NextResponse.json({
        url: demoSuccessUrl,
        message: "Demo mode - Stripe integration pending",
        demo: true,
      })
    } catch (error) {
      console.error("Stripe initialization error:", error)
      // Fallback to demo mode if Stripe fails
      const demoSuccessUrl = `${request.nextUrl.origin}/competitions/${competitionId}?demo=true&success=true`

      return NextResponse.json({
        url: demoSuccessUrl,
        message: "Demo mode - Stripe integration pending",
        demo: true,
      })
    }
  } catch (error: any) {
    console.error("Error in checkout session creation:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
