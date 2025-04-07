"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string, role: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  googleLogin: () => Promise<void>
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" }
      }

      setUser(data.user)
      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  const register = async (name: string, email: string, password: string, role: string = "user") => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed" }
      }

      setUser(data.user)
      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Mock Google login for demo purposes
  const googleLogin = async () => {
    try {
      // In a real app, this would redirect to Google OAuth
      // For demo, we'll simulate a successful login
      setUser({
        id: 999,
        name: "Google User",
        email: "google@example.com",
        role: "user",
      })
      router.push("/courses")
    } catch (error) {
      console.error("Google login error:", error)
    }
  }

  const adminLogin = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.error || "Admin login failed" }
      }

      setUser(data.user)
      return { success: true }
    } catch (error) {
      console.error("Admin login error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, googleLogin, adminLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

