"use client"

import { Badge } from "@/components/ui/badge"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { formatPrice } from "@/lib/utils"
import { Users, BookOpen, ShoppingCart, DollarSign, LogOut, Plus, Home } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AdminStats {
  userCount: number
  courseCount: number
  orderCount: number
  totalRevenue: number
}

interface RecentOrder {
  id: number
  total_amount: number
  status: string
  created_at: string
  user_name: string
}

interface PopularCourse {
  id: number
  title: string
  order_count: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [popularCourses, setPopularCourses] = useState<PopularCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { user, logout } = useAuth()

  useEffect(() => {
    if (!user) {
      // Check localStorage as fallback
      const isLoggedIn = localStorage.getItem("isLoggedIn")
      const role = localStorage.getItem("role")

      if (!isLoggedIn || role !== "admin") {
        router.push("/login")
        return
      }
    } else if (user.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard",
        variant: "destructive",
      })
      router.push("/courses")
      return
    }

    fetchAdminStats()
  }, [user, router, toast])

  const fetchAdminStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/stats")
      const data = await response.json()

      if (response.ok) {
        setStats(data.stats)
        setRecentOrders(data.recentOrders)
        setPopularCourses(data.popularCourses)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch admin stats",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error)
      toast({
        title: "Error",
        description: "Failed to fetch admin stats",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4f4]">
      <header className="bg-[#0f62fe] text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="20" viewBox="0 0 50 20">
              <path
                fill="white"
                d="M13.1,11.2 L13.1,1.5 L15.9,1.5 L15.9,11.2 L13.1,11.2 Z M16.8,11.2 L16.8,9.3 L18.6,9.3 L18.6,11.2 L16.8,11.2 Z M10.3,11.2 L10.3,9.3 L12.2,9.3 L12.2,11.2 L10.3,11.2 Z M5.7,11.2 L5.7,1.5 L8.5,1.5 L8.5,11.2 L5.7,11.2 Z M0,11.2 L0,1.5 L2.8,1.5 L2.8,11.2 L0,11.2 Z M21.4,11.2 L21.4,1.5 L24.2,1.5 L24.2,11.2 L21.4,11.2 Z M26.9,11.2 L26.9,1.5 L29.7,1.5 L29.7,11.2 L26.9,11.2 Z M32.5,11.2 L32.5,1.5 L35.3,1.5 L35.3,11.2 L32.5,11.2 Z M38.1,11.2 L38.1,1.5 L40.9,1.5 L40.9,11.2 L38.1,11.2 Z M43.6,11.2 L43.6,1.5 L46.4,1.5 L46.4,11.2 L43.6,11.2 Z M0,18.5 L0,13.2 L2.8,13.2 L2.8,18.5 L0,18.5 Z M5.7,18.5 L5.7,13.2 L8.5,13.2 L8.5,18.5 L5.7,18.5 Z M10.3,18.5 L10.3,13.2 L13.1,13.2 L13.1,18.5 L10.3,18.5 Z M21.4,18.5 L21.4,13.2 L24.2,13.2 L24.2,18.5 L21.4,18.5 Z M26.9,18.5 L26.9,13.2 L35.3,13.2 L35.3,18.5 L26.9,18.5 Z M38.1,18.5 L38.1,13.2 L46.4,13.2 L46.4,18.5 L38.1,18.5 Z M16.8,18.5 L16.8,13.2 L18.6,13.2 L18.6,18.5 L16.8,18.5 Z"
              />
            </svg>
            <h1 className="ml-4 text-xl font-semibold">IBM Admin Dashboard</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-white hover:bg-blue-700" onClick={() => router.push("/courses")}>
              <Home className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>{user?.name ? getInitials(user.name) : "A"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name || "Admin"}</span>
                    <span className="text-xs text-muted-foreground">{user?.email || ""}</span>
                    <span className="text-xs font-medium mt-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full inline-block w-fit">
                      Admin
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/admin/users")}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin/courses")}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Manage Courses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin/orders")}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Manage Orders
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <div className="space-x-2">
            <Button onClick={() => router.push("/admin/courses/new")} className="bg-[#0f62fe] hover:bg-[#0353e9]">
              <Plus className="mr-2 h-4 w-4" />
              Add New Course
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="h-5 bg-gray-200 animate-pulse rounded w-1/2 mb-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.userCount || 0}</div>
                <p className="text-xs text-muted-foreground">Registered users on the platform</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.courseCount || 0}</div>
                <p className="text-xs text-muted-foreground">Available courses in the catalog</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.orderCount || 0}</div>
                <p className="text-xs text-muted-foreground">Completed orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(stats?.totalRevenue || 0)}</div>
                <p className="text-xs text-muted-foreground">Lifetime revenue</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 animate-pulse rounded w-32" />
                        <div className="h-3 bg-gray-200 animate-pulse rounded w-24" />
                      </div>
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-16" />
                    </div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent orders</p>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.user_name} • {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Badge
                          className={
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {order.status}
                        </Badge>
                        <span className="ml-2 font-medium">{formatPrice(order.total_amount)}</span>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full" onClick={() => router.push("/admin/orders")}>
                    View All Orders
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Popular Courses</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-48" />
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-8" />
                    </div>
                  ))}
                </div>
              ) : popularCourses.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No course data available</p>
              ) : (
                <div className="space-y-4">
                  {popularCourses.map((course) => (
                    <div key={course.id} className="flex justify-between items-center border-b pb-3">
                      <p className="font-medium truncate max-w-[70%]">{course.title}</p>
                      <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {course.order_count} orders
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full" onClick={() => router.push("/admin/courses")}>
                    Manage Courses
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-[#262626] text-white p-4 text-center text-sm">
        <div className="container mx-auto">
          <p>© IBM Corporation {new Date().getFullYear()}. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}

