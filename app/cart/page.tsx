"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { formatPrice } from "@/lib/utils"
import { ShoppingCart, Trash2, ArrowLeft, Plus, Minus } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface CartItem {
  id: number
  course_id: number
  quantity: number
  title: string
  description: string
  category: string
  price: number
  image_url: string | null
  available: boolean
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartTotal, setCartTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (!user && !localStorage.getItem("isLoggedIn")) {
      router.push("/login")
      return
    }

    fetchCart()
  }, [user, router])

  const fetchCart = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/cart")
      const data = await response.json()

      if (response.ok) {
        setCartItems(data.cart.items)
        setCartTotal(data.cart.total)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch cart",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
      toast({
        title: "Error",
        description: "Failed to fetch cart",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      })

      if (response.ok) {
        fetchCart()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to update quantity",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating quantity:", error)
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      })
    }
  }

  const handleRemoveItem = async (itemId: number) => {
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
      console.error("Error removing item:", error)
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      })
    }
  }

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true)
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
        router.push("/courses")
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
    } finally {
      setIsCheckingOut(false)
    }
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
            <h1 className="ml-4 text-xl font-semibold">IBM My Courses - Cart</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-white hover:bg-blue-700" onClick={() => router.push("/courses")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Shopping Cart</h2>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-muted-foreground">Loading your cart...</p>
            </CardContent>
          </Card>
        ) : cartItems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-xl font-medium">Your cart is empty</h3>
              <p className="mt-2 text-muted-foreground">Explore our courses and add some to your cart</p>
              <Button className="mt-6 bg-[#0f62fe] hover:bg-[#0353e9]" onClick={() => router.push("/courses")}>
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>{formatPrice(item.price)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>{formatPrice(item.price * item.quantity)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{formatPrice(cartTotal * 0.1)}</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatPrice(cartTotal * 1.1)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-[#0f62fe] hover:bg-[#0353e9]"
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? "Processing..." : "Checkout"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
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

