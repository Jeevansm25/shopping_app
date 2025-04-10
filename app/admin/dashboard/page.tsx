"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, BarChart, Loader2, LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle authentication
  useEffect(() => {
    if (mounted && !loading && (!user || user.role !== "admin")) {
      router.push("/login?type=admin")
    }
  }, [user, loading, router, mounted])

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login?type=admin")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  // Show loading state during SSR or loading
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  // Handle unauthorized access
  if (!user || user.role !== "admin") {
    return null
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.02, transition: { duration: 0.3 } }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white">
            <span className="text-primary">Admin</span> Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-gray-300 font-medium">
              Welcome, <span className="text-primary">{user.name}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Cards Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          {/* User Management Card */}
          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300 border-none rounded-xl">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Manage user accounts and permissions effortlessly.
                </p>
                <Button
                  onClick={() => mounted && router.push("/admin/users")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors duration-300"
                >
                  Manage Users
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Course Management Card */}
          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300 border-none rounded-xl">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <BookOpen className="h-5 w-5" />
                  Course Management
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Add, edit, and remove courses with ease.
                </p>
                <Button
                  onClick={() => mounted && router.push("/admin/courses")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors duration-300"
                >
                  Manage Courses
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Analytics Card */}
          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300 border-none rounded-xl">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <BarChart className="h-5 w-5" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  View detailed site analytics and statistics.
                </p>
                <Button
                  onClick={() => mounted && router.push("/admin/analytics")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors duration-300"
                >
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}