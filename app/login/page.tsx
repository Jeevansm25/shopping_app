"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { ArrowRight, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isAdminLogin, setIsAdminLogin] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { login, googleLogin, adminLogin } = useAuth()

  useEffect(() => {
    setIsAdminLogin(searchParams.get("type") === "admin")
  }, [searchParams])

  const handleRegularLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    const result = await login(email, password)

    if (result.success) {
      toast({
        title: "Success",
        description: "Login successful!",
      })
      router.push("/courses")
    } else {
      toast({
        title: "Error",
        description: result.error || "Login failed",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    const result = await adminLogin(email, password)

    if (result.success) {
      toast({
        title: "Success",
        description: "Admin login successful!",
      })
      router.push("/admin/dashboard")
    } else {
      toast({
        title: "Error",
        description: result.error || "Admin login failed",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    try {
      await googleLogin()
      toast({
        title: "Success",
        description: "Google login successful!",
      })
      router.push("/courses")
    } catch (error) {
      toast({
        title: "Error",
        description: "Google login failed",
        variant: "destructive",
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Content and Illustration */}
      <div className="hidden md:flex md:w-1/2 bg-[#0f62fe] relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0f62fe] opacity-90"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl font-bold mb-6">
            {isAdminLogin ? "Admin Portal" : "Welcome to IBM My Courses"}
          </h1>
          <div className="space-y-6">
            {isAdminLogin ? (
              <>
                <p className="text-xl">
                  Access the administrative dashboard to manage users, courses, and platform analytics.
                </p>
                <ul className="space-y-4 text-lg">
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Manage user accounts and permissions
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Create and update course content
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Monitor platform analytics
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Track user progress and engagement
                  </li>
                </ul>
              </>
            ) : (
              <>
                <p className="text-xl">
                  Your gateway to professional development and learning excellence.
                </p>
                <ul className="space-y-4 text-lg">
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Access world-class courses
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Learn at your own pace
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Track your progress
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Earn certifications
                  </li>
                </ul>
              </>
            )}
          </div>
          <div className="mt-12">
            <p className="text-sm opacity-80">
              {isAdminLogin
                ? "Secure access for authorized administrators only."
                : "Join thousands of learners advancing their careers with IBM My Courses."}
            </p>
          </div>
        </div>
        {/* Abstract background pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-opacity-20 bg-white"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }}
        ></div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 flex flex-col">
        <header className="bg-[#0f62fe] md:bg-transparent text-white md:text-[#0f62fe] p-4 md:pt-8 md:px-8">
          {/* ... existing header code ... */}
        </header>

        <main className="flex-grow flex items-center justify-center p-4 md:p-8 bg-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#161616]">
                {isAdminLogin ? "Admin Login" : "Welcome Back"}
              </h2>
              <p className="text-[#6f6f6f] mt-2">
                {isAdminLogin ? "Sign in to admin dashboard" : "Sign in to access your courses"}
              </p>
            </div>

            <Card className="border-none shadow-lg">
              <CardContent className="pt-6">
                <form onSubmit={isAdminLogin ? handleAdminLogin : handleRegularLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#393939]">
                      {isAdminLogin ? "Admin Email" : "Email"}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={`Enter your ${isAdminLogin ? "admin " : ""}email`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 border-[#c6c6c6] focus:border-[#0f62fe] focus:ring-[#0f62fe]"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-[#393939]">
                        Password
                      </Label>
                      <a href="#" className="text-sm text-[#0f62fe] hover:underline">
                        Forgot password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 border-[#c6c6c6] focus:border-[#0f62fe] focus:ring-[#0f62fe]"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="data-[state=checked]:bg-[#0f62fe] data-[state=checked]:border-[#0f62fe]"
                    />
                    <Label htmlFor="remember" className="text-sm font-medium leading-none text-[#525252]">
                      Remember me
                    </Label>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full h-12 bg-[#0f62fe] hover:bg-[#0353e9] transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          {isAdminLogin ? "Sign in as Admin" : "Sign in"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {!isAdminLogin && (
                  <>
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#e0e0e0]"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-[#6f6f6f]">Or continue with</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-[#c6c6c6] hover:bg-[#f4f4f4] transition-colors flex items-center justify-center"
                      onClick={handleGoogleLogin}
                      disabled={isGoogleLoading}
                    >
                      {/* ... existing Google button code ... */}
                    </Button>
                  </>
                )}

                <div className="mt-6 text-center text-sm text-[#6f6f6f]">
                  {isAdminLogin ? (
                    <Link href="/login" className="text-[#0f62fe] hover:underline">
                      Login as regular user
                    </Link>
                  ) : (
                    <>
                      Don't have an account?{" "}
                      <Link href="/register" className="text-[#0f62fe] hover:underline">
                        Sign up
                      </Link>
                      {" | "}
                      <Link href="/login?type=admin" className="text-[#0f62fe] hover:underline">
                        Admin Login
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>

        <footer className="bg-[#262626] text-white p-4 text-center text-sm">
          {/* ... existing footer code ... */}
        </footer>
      </div>
    </div>
  )
}