/**
 * Copyright 2019 IBM
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 **/

const express = require("express")
const path = require("path")
const fs = require("fs")
const session = require("express-session")
const bodyParser = require("body-parser")
const message = require("./utils")

// Set up port
const PORT = process.env.PORT || 8080

// Initialize express app
const app = express()

// Set up session
app.use(
  session({
    secret: "ibm-courses-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set to true if using https
  }),
)

// Parse JSON bodies
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Serve static files
app.use(express.static(path.join(__dirname, "public")))

// Load courses data
let coursesData = []
try {
  const data = fs.readFileSync(path.join(__dirname, "data", "courses.json"), "utf8")
  coursesData = JSON.parse(data)
} catch (err) {
  console.log("No courses data found, using default empty array")
  // Create default courses
  coursesData = [
    {
      id: "1",
      title: "Introduction to Cloud Computing",
      details: "Learn the fundamentals of cloud computing and its applications in modern IT infrastructure.",
      category: "Cloud",
      available: true,
    },
    {
      id: "2",
      title: "DevOps Fundamentals",
      details: "Master the principles and practices of DevOps to streamline software development and deployment.",
      category: "DevOps",
      available: true,
    },
    {
      id: "3",
      title: "Kubernetes for Beginners",
      details: "Get started with container orchestration using Kubernetes.",
      category: "Container",
      available: true,
    },
  ]

  // Create data directory if it doesn't exist
  if (!fs.existsSync(path.join(__dirname, "data"))) {
    fs.mkdirSync(path.join(__dirname, "data"))
  }

  // Write default courses to file
  fs.writeFileSync(path.join(__dirname, "data", "courses.json"), JSON.stringify(coursesData, null, 2))
}

// API Routes

// GET /api/items - Get all courses
app.get("/api/items", (req, res) => {
  res.json(coursesData)
})

// GET /api/item/:id - Get a specific course
app.get("/api/item/:id", (req, res) => {
  const id = req.params.id
  const course = coursesData.find((c) => c.id === id)

  if (!course) {
    return res.status(404).json({ error: "Course not found" })
  }

  res.json(course)
})

// POST /api/item - Add a new course
app.post("/api/item", (req, res) => {
  const { title, details, category, available } = req.body

  if (!title || !details || !category) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  const newCourse = {
    id: Date.now().toString(),
    title,
    details,
    category,
    available: available !== undefined ? available : true,
  }

  coursesData.push(newCourse)

  // Save to file
  fs.writeFileSync(path.join(__dirname, "data", "courses.json"), JSON.stringify(coursesData, null, 2))

  // Add to session
  if (!req.session.myCourses) {
    req.session.myCourses = []
  }
  req.session.myCourses.push(newCourse)

  res.status(201).json(newCourse)
})

// PUT /api/item/:id - Update a course
app.put("/api/item/:id", (req, res) => {
  const id = req.params.id
  const { title, details, category, available } = req.body

  const courseIndex = coursesData.findIndex((c) => c.id === id)

  if (courseIndex === -1) {
    return res.status(404).json({ error: "Course not found" })
  }

  const updatedCourse = {
    ...coursesData[courseIndex],
    title: title || coursesData[courseIndex].title,
    details: details || coursesData[courseIndex].details,
    category: category || coursesData[courseIndex].category,
    available: available !== undefined ? available : coursesData[courseIndex].available,
  }

  coursesData[courseIndex] = updatedCourse

  // Save to file
  fs.writeFileSync(path.join(__dirname, "data", "courses.json"), JSON.stringify(coursesData, null, 2))

  // Update in session if exists
  if (req.session.myCourses) {
    const sessionIndex = req.session.myCourses.findIndex((c) => c.id === id)
    if (sessionIndex !== -1) {
      req.session.myCourses[sessionIndex] = updatedCourse
    }
  }

  res.json(updatedCourse)
})

// DELETE /api/item/:id - Delete a course
app.delete("/api/item/:id", (req, res) => {
  const id = req.params.id

  const courseIndex = coursesData.findIndex((c) => c.id === id)

  if (courseIndex === -1) {
    return res.status(404).json({ error: "Course not found" })
  }

  coursesData.splice(courseIndex, 1)

  // Save to file
  fs.writeFileSync(path.join(__dirname, "data", "courses.json"), JSON.stringify(coursesData, null, 2))

  // Remove from session if exists
  if (req.session.myCourses) {
    req.session.myCourses = req.session.myCourses.filter((c) => c.id !== id)
  }

  res.json({ success: true })
})

// Serve the main page for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Start the server
app.listen(PORT, () => {
  console.log(message.getPortMessage() + PORT)
})

