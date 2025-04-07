import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

// GET /api/admin/users - Get all users (admin only)
export async function GET(req: NextRequest) {
  try {
    // Verify that the request is from an admin
    const adminUser = await requireAdmin(req)
    
    if (adminUser instanceof NextResponse) {
      return adminUser
    }

    // Fetch all users except their passwords
    const users = await executeQuery(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC",
      []
    )

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

