import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

// PUT /api/cart/[itemId] - Update cart item quantity
export async function PUT(req: NextRequest, { params }: { params: { itemId: string } }) {
  try {
    const authResult = await requireAuth(req)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const itemId = params.itemId
    const { quantity } = await req.json()

    if (quantity === undefined || quantity < 1) {
      return NextResponse.json({ error: "Valid quantity is required" }, { status: 400 })
    }

    // Verify the item belongs to the user's cart
    const cartItems = await executeQuery(
      `SELECT ci.id FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = $1 AND c.user_id = $2`,
      [itemId, authResult.id],
    )

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    // Update quantity
    await executeQuery("UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
      quantity,
      itemId,
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update cart item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/cart/[itemId] - Remove item from cart
export async function DELETE(req: NextRequest, { params }: { params: { itemId: string } }) {
  try {
    const authResult = await requireAuth(req)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const itemId = params.itemId

    // Verify the item belongs to the user's cart
    const cartItems = await executeQuery(
      `SELECT ci.id FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = $1 AND c.user_id = $2`,
      [itemId, authResult.id],
    )

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    // Delete item
    await executeQuery("DELETE FROM cart_items WHERE id = $1", [itemId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete cart item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

