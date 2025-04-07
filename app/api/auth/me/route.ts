import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const users = await executeQuery("SELECT id, name, email, role FROM users WHERE id = $1", [session.id])

    const user = users[0]

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get current user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

