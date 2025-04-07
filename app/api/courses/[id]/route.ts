import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

// GET /api/courses/[id] - Get a specific course
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const courses = await executeQuery("SELECT * FROM courses WHERE id = $1", [id])

    if (courses.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ course: courses[0] })
  } catch (error) {
    console.error("Get course error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/courses/[id] - Update a course (admin only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireAdmin(req)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const id = params.id
    const { title, description, category, price, imageUrl, available } = await req.json()

    // Check if course exists
    const existingCourses = await executeQuery("SELECT * FROM courses WHERE id = $1", [id])

    if (existingCourses.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Update course
    const result = await executeQuery(
      `UPDATE courses 
       SET title = $1, description = $2, category = $3, price = $4, 
           image_url = $5, available = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [
        title || existingCourses[0].title,
        description || existingCourses[0].description,
        category || existingCourses[0].category,
        price !== undefined ? price : existingCourses[0].price,
        imageUrl !== undefined ? imageUrl : existingCourses[0].image_url,
        available !== undefined ? available : existingCourses[0].available,
        id,
      ],
    )

    return NextResponse.json({ course: result[0] })
  } catch (error) {
    console.error("Update course error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/courses/[id] - Delete a course (admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireAdmin(req)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const id = params.id

    // Check if course exists
    const existingCourses = await executeQuery("SELECT * FROM courses WHERE id = $1", [id])

    if (existingCourses.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Delete course
    await executeQuery("DELETE FROM courses WHERE id = $1", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete course error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

