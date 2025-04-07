import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

// GET /api/cart - Get user's cart
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    // Get user's cart
    const carts = await executeQuery("SELECT id FROM carts WHERE user_id = $1", [authResult.id])

    let cart = carts[0]

    // Create cart if it doesn't exist
    if (!cart) {
      const newCart = await executeQuery("INSERT INTO carts (user_id) VALUES ($1) RETURNING id", [authResult.id])
      cart = newCart[0]
    }

    // Get cart items with course details
    const cartItems = await executeQuery(
      `SELECT ci.id, ci.quantity, c.id as course_id, c.title, c.description, 
              c.category, c.price, c.image_url, c.available
       FROM cart_items ci
       JOIN courses c ON ci.course_id = c.id
       WHERE ci.cart_id = $1`,
      [cart.id],
    )

    // Calculate total
    const total = cartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

    return NextResponse.json({
      cart: {
        id: cart.id,
        items: cartItems,
        total,
      },
    })
  } catch (error) {
    console.error("Get cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/cart - Add item to cart
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { courseId, quantity = 1 } = await req.json()

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // Check if course exists and is available
    const courses = await executeQuery("SELECT * FROM courses WHERE id = $1 AND available = true", [courseId])

    if (courses.length === 0) {
      return NextResponse.json({ error: "Course not found or not available" }, { status: 404 })
    }

    // Get user's cart
    const carts = await executeQuery("SELECT id FROM carts WHERE user_id = $1", [authResult.id])

    let cartId

    // Create cart if it doesn't exist
    if (carts.length === 0) {
      const newCart = await executeQuery("INSERT INTO carts (user_id) VALUES ($1) RETURNING id", [authResult.id])
      cartId = newCart[0].id
    } else {
      cartId = carts[0].id
    }

    // Check if item already exists in cart
    const existingItems = await executeQuery(
      "SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND course_id = $2",
      [cartId, courseId],
    )

    if (existingItems.length > 0) {
      // Update quantity
      const newQuantity = existingItems[0].quantity + quantity

      await executeQuery("UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
        newQuantity,
        existingItems[0].id,
      ])
    } else {
      // Add new item
      await executeQuery("INSERT INTO cart_items (cart_id, course_id, quantity) VALUES ($1, $2, $3)", [
        cartId,
        courseId,
        quantity,
      ])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Add to cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

