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

    // Fetch recent orders with user information
    const orders = await executeQuery(
      `SELECT o.id, o.user_id, o.total, o.status, o.created_at, u.name as user_name 
       FROM orders o 
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC 
       LIMIT 5`,
      []
    )

    if (!orders) {
      return NextResponse.json({ orders: [] })
    }

    // Format the orders to ensure proper date handling
    const formattedOrders = orders.map((order: any) => ({
      ...order,
      created_at: order.created_at.toISOString(),
    }))

    return NextResponse.json({ orders: formattedOrders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 