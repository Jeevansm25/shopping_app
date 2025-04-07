"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Search, ShoppingCart, LogOut, User } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { formatPrice } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Course {
  id: number
  title: string
  description: string
  category: string
  price: number
  image_url: string | null
  available: boolean
}

interface CartItem {
  id: number
  course_id: number
  quantity: number
  title: string
  price: number
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartTotal, setCartTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { user, logout } = useAuth()

  useEffect(() => {
    if (!user && !localStorage.getItem("isLoggedIn")) {
      router.push("/login")
      return
    }

    fetchCourses()
    fetchCart()
  }, [user, router])

  const fetchCourses = async () => {
    try {
      setIsLoading(true)
      let url = "/api/courses"

      const params = new URLSearchParams()
      if (searchQuery) params.append("query", searchQuery)
      if (selectedCategory) params.append("category", selectedCategory)

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setCourses(data.courses)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch courses",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart")
      const data = await response.json()

      if (response.ok) {
        setCartItems(data.cart.items)
        setCartTotal(data.cart.total)
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
    }
  }

  const handleAddToCart = async (courseId: number) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Course added to cart",
        })
        fetchCart()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add course to cart",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add course to cart",
        variant: "destructive",
      })
    }
  }

  const handleRemoveFromCart = async (itemId: number) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Item removed from cart",
        })
        fetchCart()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to remove item from cart",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error removing from cart:", error)
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      })
    }
  }

  const handleCheckout = async () => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Checkout successful! Your order has been placed.",
        })
        fetchCart()
      } else {
        toast({
          title: "Error",
          description: data.error || "Checkout failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error during checkout:", error)
      toast({
        title: "Error",
        description: "Checkout failed",
        variant: "destructive",
      })
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCourses()
  }

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category)
    setTimeout(() => fetchCourses(), 0)
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
            <h1 className="ml-4 text-xl font-semibold">IBM My Courses</h1>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name || "User"}</span>
                    <span className="text-xs text-muted-foreground">{user?.email || ""}</span>
                    <span className="text-xs font-medium mt-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full inline-block w-fit">
                      {user?.role || "user"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/cart")}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Cart ({cartItems.length})
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem onClick={() => router.push("/admin")}>Admin Dashboard</DropdownMenuItem>
                )}
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
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-1/4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search courses..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#0f62fe] hover:bg-[#0353e9]">
                    Search
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleCategoryChange(null)}
                  >
                    All Categories
                  </Button>
                  <Button
                    variant={selectedCategory === "Cloud" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleCategoryChange("Cloud")}
                  >
                    Cloud Computing
                  </Button>
                  <Button
                    variant={selectedCategory === "DevOps" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleCategoryChange("DevOps")}
                  >
                    DevOps
                  </Button>
                  <Button
                    variant={selectedCategory === "AI" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleCategoryChange("AI")}
                  >
                    Artificial Intelligence
                  </Button>
                  <Button
                    variant={selectedCategory === "Container" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleCategoryChange("Container")}
                  >
                    Containers
                  </Button>
                  <Button
                    variant={selectedCategory === "Blockchain" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleCategoryChange("Blockchain")}
                  >
                    Blockchain
                  </Button>
                  <Button
                    variant={selectedCategory === "Quantum" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleCategoryChange("Quantum")}
                  >
                    Quantum Computing
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Cart</CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Your cart is empty</p>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.price)} x {item.quantity}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveFromCart(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}

                    <div className="pt-4 border-t">
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>{formatPrice(cartTotal)}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-[#0f62fe] hover:bg-[#0353e9]"
                      onClick={handleCheckout}
                      disabled={cartItems.length === 0}
                    >
                      Checkout
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="w-full md:w-3/4">
            <h2 className="text-2xl font-bold mb-6">Available Courses</h2>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-40 bg-gray-200 animate-pulse" />
                    <CardHeader>
                      <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-1/4" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-full mb-2" />
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-full mb-2" />
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                    </CardContent>
                    <CardFooter>
                      <div className="h-10 bg-gray-200 animate-pulse rounded w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <Card className="p-8 text-center">
                <h3 className="text-xl font-medium mb-2">No courses found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="overflow-hidden flex flex-col">
                    <div className="h-40 bg-[#edf5ff] flex items-center justify-center">
                      {course.image_url ? (
                        <img
                          src={course.image_url || "/placeholder.svg"}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-[#0f62fe] text-4xl font-bold opacity-30">IBM</div>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-[#161616] text-lg">{course.title}</CardTitle>
                        <Badge
                          variant={course.available ? "default" : "secondary"}
                          className={course.available ? "bg-[#24a148]" : "bg-[#da1e28]"}
                        >
                          {course.available ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="mt-2 bg-[#e0e0e0] text-[#525252] hover:bg-[#e0e0e0]">
                        {course.category}
                      </Badge>
                    </CardHeader>
                    <CardContent className="pt-4 flex-grow">
                      <p className="text-[#525252]">{course.description}</p>
                      <p className="mt-4 text-xl font-bold text-[#0f62fe]">{formatPrice(course.price)}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end bg-[#f2f4f8]">
                      <Button
                        onClick={() => handleAddToCart(course.id)}
                        disabled={!course.available}
                        className="bg-[#0f62fe] hover:bg-[#0353e9] disabled:bg-[#8d8d8d]"
                      >
                        Add to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
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

