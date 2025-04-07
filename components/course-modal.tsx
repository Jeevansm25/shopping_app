"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { Course } from "@/types/course"

interface CourseModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (course: Course) => void
  course: Course | null
  mode: "create" | "edit"
}

export default function CourseModal({ isOpen, onClose, onSave, course, mode }: CourseModalProps) {
  const [title, setTitle] = useState("")
  const [details, setDetails] = useState("")
  const [category, setCategory] = useState("")
  const [available, setAvailable] = useState(true)
  const [errors, setErrors] = useState({
    title: false,
    details: false,
    category: false,
  })

  useEffect(() => {
    if (course) {
      setTitle(course.title)
      setDetails(course.details)
      setCategory(course.category)
      setAvailable(course.available)
    } else {
      // Reset form for new course
      setTitle("")
      setDetails("")
      setCategory("")
      setAvailable(true)
    }

    // Reset errors
    setErrors({
      title: false,
      details: false,
      category: false,
    })
  }, [course, isOpen])

  const handleSave = () => {
    // Validate form
    const newErrors = {
      title: !title.trim(),
      details: !details.trim(),
      category: !category,
    }

    setErrors(newErrors)

    if (newErrors.title || newErrors.details || newErrors.category) {
      return
    }

    const updatedCourse: Course = {
      id: course?.id || "",
      title: title.trim(),
      details: details.trim(),
      category,
      available,
    }

    onSave(updatedCourse)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[#0f62fe]">{mode === "create" ? "Add New Course" : "Edit Course"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className={errors.title ? "text-[#da1e28]" : ""}>
              Course Title {errors.title && <span className="text-[#da1e28]">*</span>}
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? "border-[#da1e28]" : ""}
            />
            {errors.title && <p className="text-[#da1e28] text-sm">Title is required</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="details" className={errors.details ? "text-[#da1e28]" : ""}>
              Course Details {errors.details && <span className="text-[#da1e28]">*</span>}
            </Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className={errors.details ? "border-[#da1e28]" : ""}
              rows={4}
            />
            {errors.details && <p className="text-[#da1e28] text-sm">Details are required</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category" className={errors.category ? "text-[#da1e28]" : ""}>
              Category {errors.category && <span className="text-[#da1e28]">*</span>}
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className={errors.category ? "border-[#da1e28]" : ""}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cloud">Cloud</SelectItem>
                <SelectItem value="DevOps">DevOps</SelectItem>
                <SelectItem value="AI">AI</SelectItem>
                <SelectItem value="Container">Container</SelectItem>
                <SelectItem value="Blockchain">Blockchain</SelectItem>
                <SelectItem value="Quantum">Quantum</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Data">Data</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-[#da1e28] text-sm">Category is required</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="available" checked={available} onCheckedChange={setAvailable} />
            <Label htmlFor="available">Available for enrollment</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#0f62fe] hover:bg-[#0353e9]">
            {mode === "create" ? "Create Course" : "Update Course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

