import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

// POST /api/checkout - Create an order from cart
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    // Get user's cart
    const carts = await executeQuery("SELECT id FROM carts WHERE user_id = $1", [authResult.id])

    if (carts.length === 0) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 })
    }

    const cartId = carts[0].id

    // Get cart items with course details
    const cartItems = await executeQuery(
      `SELECT ci.id, ci.quantity, c.id as course_id, c.price
       FROM cart_items ci
       JOIN courses c ON ci.course_id = c.id
       WHERE ci.cart_id = $1`,
      [cartId],
    )

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Calculate total
    const total = cartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

    // Start transaction
    await executeQuery("BEGIN")

    try {
      // Create order
      const orderResult = await executeQuery(
        "INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING id",
        [authResult.id, total, "completed"],
      )

      const orderId = orderResult[0].id

      // Create order items
      for (const item of cartItems) {
        await executeQuery("INSERT INTO order_items (order_id, course_id, price, quantity) VALUES ($1, $2, $3, $4)", [
          orderId,
          item.course_id,
          item.price,
          item.quantity,
        ])
      }

      // Clear cart
      await executeQuery("DELETE FROM cart_items WHERE cart_id = $1", [cartId])

      // Commit transaction
      await executeQuery("COMMIT")

      return NextResponse.json({
        success: true,
        order: {
          id: orderId,
          total,
        },
      })
    } catch (error) {
      // Rollback transaction on error
      await executeQuery("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

