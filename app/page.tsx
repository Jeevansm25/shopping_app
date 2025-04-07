"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    let mounted = true

    const handleNavigation = async () => {
      if (!loading && !isNavigating && mounted) {
        setIsNavigating(true)
        try {
          if (user) {
            if (user.role === 'admin') {
              await router.push("/admin/dashboard")
            } else {
              await router.push("/courses")
            }
          } else {
            await router.push("/login")
          }
        } catch (error) {
          console.error('Navigation error:', error)
        }
      }
    }

    handleNavigation()

    return () => {
      mounted = false
    }
  }, [user, loading, router, isNavigating])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f4f4]">
      <div className="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="40" viewBox="0 0 50 20" className="mx-auto mb-4">
          <path
            fill="#0f62fe"
            d="M13.1,11.2 L13.1,1.5 L15.9,1.5 L15.9,11.2 L13.1,11.2 Z M16.8,11.2 L16.8,9.3 L18.6,9.3 L18.6,11.2 L16.8,11.2 Z M10.3,11.2 L10.3,9.3 L12.2,9.3 L12.2,11.2 L10.3,11.2 Z M5.7,11.2 L5.7,1.5 L8.5,1.5 L8.5,11.2 L5.7,11.2 Z M0,11.2 L0,1.5 L2.8,1.5 L2.8,11.2 L0,11.2 Z M21.4,11.2 L21.4,1.5 L24.2,1.5 L24.2,11.2 L21.4,11.2 Z M26.9,11.2 L26.9,1.5 L29.7,1.5 L29.7,11.2 L26.9,11.2 Z M32.5,11.2 L32.5,1.5 L35.3,1.5 L35.3,11.2 L32.5,11.2 Z M38.1,11.2 L38.1,1.5 L40.9,1.5 L40.9,11.2 L38.1,11.2 Z M43.6,11.2 L43.6,1.5 L46.4,1.5 L46.4,11.2 L43.6,11.2 Z M0,18.5 L0,13.2 L2.8,13.2 L2.8,18.5 L0,18.5 Z M5.7,18.5 L5.7,13.2 L8.5,13.2 L8.5,18.5 L5.7,18.5 Z M10.3,18.5 L10.3,13.2 L13.1,13.2 L13.1,18.5 L10.3,18.5 Z M21.4,18.5 L21.4,13.2 L24.2,13.2 L24.2,18.5 L21.4,18.5 Z M26.9,18.5 L26.9,13.2 L35.3,13.2 L35.3,18.5 L26.9,18.5 Z M38.1,18.5 L38.1,13.2 L46.4,13.2 L46.4,18.5 L38.1,18.5 Z M16.8,18.5 L16.8,13.2 L18.6,13.2 L18.6,18.5 L16.8,18.5 Z"
          />
        </svg>
        <h1 className="text-2xl font-bold text-[#161616]">IBM My Courses</h1>
        <p className="text-[#6f6f6f] mt-2">Redirecting...</p>
        <div className="mt-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#0f62fe] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
      </div>
    </div>
  )
}

