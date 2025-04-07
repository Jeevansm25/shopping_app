import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

// GET /api/courses - Get all courses
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const category = searchParams.get("category")
    const query = searchParams.get("query")

    let sql = "SELECT * FROM courses WHERE 1=1"
    const params: any[] = []

    if (category) {
      sql += " AND category = $" + (params.length + 1)
      params.push(category)
    }

    if (query) {
      sql += " AND (title ILIKE $" + (params.length + 1) + " OR description ILIKE $" + (params.length + 1) + ")"
      params.push(`%${query}%`)
    }

    sql += " ORDER BY created_at DESC"

    const courses = await executeQuery(sql, params)

    return NextResponse.json({ courses })
  } catch (error) {
    console.error("Get courses error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/courses - Create a new course (admin only)
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdmin(req)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { title, description, category, price, imageUrl, available } = await req.json()

    if (!title || !description || !category || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await executeQuery(
      `INSERT INTO courses (title, description, category, price, image_url, available, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [title, description, category, price, imageUrl || null, available !== false, authResult.id],
    )

    return NextResponse.json({ course: result[0] }, { status: 201 })
  } catch (error) {
    console.error("Create course error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

