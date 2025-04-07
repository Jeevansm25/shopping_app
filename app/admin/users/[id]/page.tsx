"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { ArrowLeft, ShoppingCart, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface User {
  id: number
  name: string
  email: string
  role: string
  created_at: string
}

interface Order {
  id: number
  total_amount: number
  status: string
  created_at: string
  item_count: number
}

interface CartItem {
  id: number
  course_id: number
  quantity: number
  title: string
  price: number
}

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartTotal, setCartTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { user: currentUser } = useAuth()

  useEffect(() => {
    if (!currentUser) {
      // Check localStorage as fallback
      const isLoggedIn = localStorage.getItem("isLoggedIn")
      const role = localStorage.getItem("role")

      if (!isLoggedIn || role !== "admin") {
        router.push("/login")
        return
      }
    } else if (currentUser.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard",
        variant: "destructive",
      })
      router.push("/courses")
      return
    }

    fetchUserDetails()
  }, [currentUser, router, toast, params.id])

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/users/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setOrders(data.orders)
        setCartItems(data.cart.items)
        setCartTotal(data.cart.total)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch user details",
          variant: "destructive",
        })
        router.push("/admin/users")
      }
    } catch (error) {
      console.error("Error fetching user details:", error)
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      })
      router.push("/admin/users")
    } finally {
      setIsLoading(false)
    }
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
            <h1 className="ml-4 text-xl font-semibold">IBM Admin - User Details</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-blue-700"
              onClick={() => router.push("/admin/users")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="ml-2 text-muted-foreground">Loading user details...</p>
          </div>
        ) : user ? (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                    <p className="text-lg font-medium">{user.name}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p className="text-lg font-medium">{user.email}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                    <Badge
                      variant={user.role === "admin" ? "default" : "outline"}
                      className={user.role === "admin" ? "bg-[#0f62fe]" : ""}
                    >
                      {user.role}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Joined</h3>
                    <p className="text-lg font-medium">{formatDate(user.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="orders">
              <TabsList className="mb-4">
                <TabsTrigger value="orders" className="flex items-center">
                  <Package className="mr-2 h-4 w-4" />
                  Orders
                </TabsTrigger>
                <TabsTrigger value="cart" className="flex items-center">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Cart
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                        <p className="mt-2 text-muted-foreground">No orders found</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">#{order.id}</TableCell>
                              <TableCell>{formatDate(order.created_at)}</TableCell>
                              <TableCell>{order.item_count}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    order.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }
                                >
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatPrice(order.total_amount)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cart">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Cart</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cartItems.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                        <p className="mt-2 text-muted-foreground">Cart is empty</p>
                      </div>
                    ) : (
                      <>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Course</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cartItems.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.title}</TableCell>
                                <TableCell>{formatPrice(item.price)}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell className="text-right">{formatPrice(item.price * item.quantity)}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={3} className="text-right font-bold">
                                Total
                              </TableCell>
                              <TableCell className="text-right font-bold">{formatPrice(cartTotal)}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">User not found</p>
              <Button className="mt-4 bg-[#0f62fe] hover:bg-[#0353e9]" onClick={() => router.push("/admin/users")}>
                Back to Users
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="bg-[#262626] text-white p-4 text-center text-sm">
        <div className="container mx-auto">
          <p>© IBM Corporation {new Date().getFullYear()}. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}

