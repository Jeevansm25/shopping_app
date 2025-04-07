import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

// Define the CartItem type
type CartItem = {
  id: number
  quantity: number
  course_id: number
  title: string
  price: number
}

// GET /api/admin/users/[id] - Get user details (admin only)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireAdmin(req)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const id = params.id

    // Get user details
    const users = await executeQuery("SELECT id, name, email, role, created_at FROM users WHERE id = $1", [id])

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user's orders
    const orders = await executeQuery(
      `SELECT o.id, o.total_amount, o.status, o.created_at,
              COUNT(oi.id) as item_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [id],
    )

    // Get user's cart
    const carts = await executeQuery("SELECT id FROM carts WHERE user_id = $1", [id])

    let cartItems: CartItem[] = []

    if (carts.length > 0) {
      cartItems = (await executeQuery(
        `SELECT ci.id, ci.quantity, c.id as course_id, c.title, c.price
         FROM cart_items ci
         JOIN courses c ON ci.course_id = c.id
         WHERE ci.cart_id = $1`,
        [carts[0].id],
      )) as CartItem[]
    }

    return NextResponse.json({
      user: users[0],
      orders,
      cart: {
        items: cartItems,
        total: cartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
      },
    })
  } catch (error) {
    console.error("Get user details error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

