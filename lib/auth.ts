import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "./db"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-at-least-32-characters")

export interface UserJwtPayload {
  id: number
  email: string
  name: string
  role: string
}

export async function signToken(payload: UserJwtPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET)

  return token
}

export async function verifyToken(token: string): Promise<UserJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as UserJwtPayload
  } catch (error) {
    return null
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) return null

  const payload = await verifyToken(token)
  return payload
}

export async function getUserFromSession() {
  const session = await getSession()

  if (!session) return null

  try {
    const user = await executeQuery("SELECT id, name, email, role FROM users WHERE id = $1", [session.id])

    return user[0] || null
  } catch (error) {
    console.error("Error getting user from session:", error)
    return null
  }
}

export async function requireAuth(req: NextRequest) {
  const token = req.cookies.get("token")?.value

  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const payload = await verifyToken(token)

  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  return payload
}

export async function requireAdmin(req: NextRequest) {
  const payload = await requireAuth(req)

  if (payload instanceof NextResponse) {
    return payload
  }

  if (payload.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }

  return payload
}

