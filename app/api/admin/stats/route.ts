import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

// GET /api/admin/stats - Get admin dashboard stats
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdmin(req)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    // Get user count
    const userCountResult = await executeQuery("SELECT COUNT(*) as count FROM users")
    const userCount = Number.parseInt(userCountResult[0].count)

    // Get course count
    const courseCountResult = await executeQuery("SELECT COUNT(*) as count FROM courses")
    const courseCount = Number.parseInt(courseCountResult[0].count)

    // Get order count
    const orderCountResult = await executeQuery("SELECT COUNT(*) as count FROM orders")
    const orderCount = Number.parseInt(orderCountResult[0].count)

    // Get total revenue
    const revenueResult = await executeQuery("SELECT SUM(total_amount) as total FROM orders")
    const totalRevenue = Number.parseFloat(revenueResult[0].total || 0)

    return NextResponse.json({
      stats: {
        userCount,
        courseCount,
        orderCount,
        totalRevenue,
      },
    })
  } catch (error) {
    console.error("Get admin stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

