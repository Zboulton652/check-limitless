import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables:", {
      url: supabaseUrl ? "present" : "missing",
      key: supabaseAnonKey ? "present" : "missing",
    })

    // If accessing protected routes without proper config, redirect to login
    if (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/admin")) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = "/auth/login"
      return NextResponse.redirect(redirectUrl)
    }

    return supabaseResponse
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    })

    // This will refresh session if expired - required for Server Components
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    // Protected routes that require authentication
    const protectedRoutes = ["/dashboard", "/admin", "/competitions", "/dividends"]
    const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

    // If accessing protected route without authentication, redirect to login
    if (isProtectedRoute && (!user || error)) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = "/auth/login"
      redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Admin-only routes
    if (request.nextUrl.pathname.startsWith("/admin") && user) {
      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single()

        if (userError || userData?.role !== "admin") {
          const redirectUrl = request.nextUrl.clone()
          redirectUrl.pathname = "/dashboard"
          return NextResponse.redirect(redirectUrl)
        }
      } catch (adminCheckError) {
        console.error("Error checking admin status:", adminCheckError)
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = "/dashboard"
        return NextResponse.redirect(redirectUrl)
      }
    }

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (user && request.nextUrl.pathname.startsWith("/auth/")) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = "/dashboard"
      return NextResponse.redirect(redirectUrl)
    }
  } catch (middlewareError) {
    console.error("Middleware error:", middlewareError)

    // If there's an error and user is trying to access protected routes, redirect to login
    if (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/admin")) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = "/auth/login"
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
