"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Course {
  id: number
  title: string
  description: string
  category: string
  price: number
  image_url: string | null
  available: boolean
}

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<Course | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [available, setAvailable] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const isNewCourse = params.id === "new"

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

    if (!isNewCourse) {
      fetchCourse()
    } else {
      setIsLoading(false)
    }
  }, [user, router, toast, isNewCourse, params.id])

  const fetchCourse = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/courses/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setCourse(data.course)
        setTitle(data.course.title)
        setDescription(data.course.description)
        setCategory(data.course.category)
        setPrice(data.course.price.toString())
        setImageUrl(data.course.image_url || "")
        setAvailable(data.course.available)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch course",
          variant: "destructive",
        })
        router.push("/admin/courses")
      }
    } catch (error) {
      console.error("Error fetching course:", error)
      toast({
        title: "Error",
        description: "Failed to fetch course",
        variant: "destructive",
      })
      router.push("/admin/courses")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    // Validate form
    if (!title.trim() || !description.trim() || !category || !price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const priceValue = Number.parseFloat(price)
    if (isNaN(priceValue) || priceValue < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      const courseData = {
        title,
        description,
        category,
        price: priceValue,
        imageUrl: imageUrl || null,
        available,
      }

      const url = isNewCourse ? "/api/courses" : `/api/courses/${params.id}`
      const method = isNewCourse ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: isNewCourse ? "Course created successfully" : "Course updated successfully",
        })
        router.push("/admin/courses")
      } else {
        toast({
          title: "Error",
          description: data.error || (isNewCourse ? "Failed to create course" : "Failed to update course"),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving course:", error)
      toast({
        title: "Error",
        description: isNewCourse ? "Failed to create course" : "Failed to update course",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/courses/${params.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Course deleted successfully",
        })
        router.push("/admin/courses")
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to delete course",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting course:", error)
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
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
            <h1 className="ml-4 text-xl font-semibold">IBM Admin - {isNewCourse ? "New Course" : "Edit Course"}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-blue-700"
              onClick={() => router.push("/admin/courses")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{isNewCourse ? "Create New Course" : "Edit Course"}</h2>
          <div className="space-x-2">
            {!isNewCourse && (
              <Button
                variant="outline"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            <Button onClick={handleSave} className="bg-[#0f62fe] hover:bg-[#0353e9]" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-muted-foreground">Loading course...</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Course Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter course title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter course description"
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cloud">Cloud Computing</SelectItem>
                        <SelectItem value="DevOps">DevOps</SelectItem>
                        <SelectItem value="AI">Artificial Intelligence</SelectItem>
                        <SelectItem value="Container">Containers</SelectItem>
                        <SelectItem value="Blockchain">Blockchain</SelectItem>
                        <SelectItem value="Quantum">Quantum Computing</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                        <SelectItem value="Data">Data Science</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Price ($) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Enter course price"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL (optional)"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="available" checked={available} onCheckedChange={setAvailable} />
                  <Label htmlFor="available">Available for enrollment</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="bg-[#262626] text-white p-4 text-center text-sm">
        <div className="container mx-auto">
          <p>© IBM Corporation {new Date().getFullYear()}. All Rights Reserved.</p>
        </div>
      </footer>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

