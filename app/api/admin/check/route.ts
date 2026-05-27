import { createClient } from "@supabase/supabase-js"
import { jwtDecode } from "jwt-decode"
import { NextRequest, NextResponse } from "next/server"

interface JWTPayload {
  email?: string
  sub?: string
}

export async function GET(req: NextRequest) {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7) // Remove "Bearer " prefix

    // Decode JWT to extract email
    let email: string | undefined
    try {
      const decoded = jwtDecode<JWTPayload>(token)
      email = decoded.email
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid JWT token" },
        { status: 401 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email not found in JWT token" },
        { status: 401 }
      )
    }

    // Create Supabase client and check if email is in public.admins
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ""
    )

    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("email", email)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: "Admin access denied" },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { message: "Admin access granted", admin: data },
      { status: 200 }
    )
  } catch (err: any) {
    console.error("Admin check error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
