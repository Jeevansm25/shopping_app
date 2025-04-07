import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    // Verify that the request is from an admin
    const adminUser = await requireAdmin(req)
    
    if (adminUser instanceof NextResponse) {
      return adminUser
    }

    // Fetch recent orders
    const orders = await executeQuery(
      `SELECT o.id, o.user_id, o.total, o.status, o.created_at 
       FROM orders o 
       ORDER BY o.created_at DESC 
       LIMIT 5`,
      []
    )

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Error fetching recent orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 