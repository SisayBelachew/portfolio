
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const Profile = require("./models/Profile");
const Project = require("./models/Project");
const Message = require("./models/Message");
const app = express();

app.use(helmet());
// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://portfolio-lac-rho-78.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again later.",
  },
});
const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many messages. Please try again later.",
  },
});
// Admin Login
app.post("/api/auth/login", loginLimiter, async (req, res) => {
  try {
    // Validate request body
    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        message: "Invalid request data.",
      });
    }

    const { email, password } = req.body;

    // Validate input
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    // Reject unsupported fields
    const allowedFields = ["email", "password"];

    const unexpectedFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (unexpectedFields.length > 0) {
      return res.status(400).json({
        message: "Request contains unsupported fields.",
      });
    }

    // Read environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;
    const jwtSecret = process.env.JWT_SECRET;

    // Check environment variables
    if (!adminEmail || !passwordHash || !jwtSecret) {
      console.error("Admin authentication environment variables are missing.");

      return res.status(500).json({
        message: "Authentication is not configured correctly.",
      });
    }

    // Validate email
    const emailMatches =
      email.trim().toLowerCase() === adminEmail.trim().toLowerCase();

    // Validate password
    const passwordMatches = await bcrypt.compare(
      password,
      passwordHash
    );

    if (!emailMatches || !passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        role: "admin",
        email: adminEmail.trim().toLowerCase(),
      },
      jwtSecret,
      {
        expiresIn: "1h",
        algorithm: "HS256",
      }
    );

  // Set authentication cookie
   res.cookie("adminToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
    process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 60 * 60 * 1000,
    path: "/",
   });

    return res.status(200).json({
      message: "Admin login successful.",
      user: {
        email: adminEmail,
        role: "admin",
      },
    });

  } catch (error) {
    console.error("Admin login failed:", error.message);

    return res.status(500).json({
      message: "An error occurred during login.",
    });
  }
});

// Submit Contact Message
app.post("/api/messages", messageLimiter, async (req, res) => {
  try {
    // Validate request body
    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        message: "Invalid request data.",
      });
    }

    const { name, email, subject, message } = req.body;

    // Validate required fields and data types
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof subject !== "string" ||
      typeof message !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !subject.trim() ||
      !message.trim()
    ) {
      return res.status(400).json({
        message: "All contact fields are required.",
      });
    }

    // Reject unsupported fields
    const allowedFields = ["name", "email", "subject", "message"];

    const unexpectedFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (unexpectedFields.length > 0) {
      return res.status(400).json({
        message: "Request contains unsupported fields.",
      });
    }

    // Validate maximum lengths
    if (
      name.trim().length > 100 ||
      email.trim().length > 254 ||
      subject.trim().length > 150 ||
      message.trim().length > 5000
    ) {
      return res.status(400).json({
        message: "One or more fields exceed the allowed length.",
      });
    }

    // Save message to MongoDB
    const newMessage = await Message.create({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    return res.status(201).json({
      message: "Contact message submitted successfully.",
      contactMessage: newMessage,
    });

  } catch (error) {
    console.error("Contact message error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Please check your contact information.",
      });
    }

    return res.status(500).json({
      message: "Unable to submit your message.",
    });
  }
});

// Admin Logout
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({
    message: "Admin logged out successfully.",
  });
});
// Admin Authentication Middleware
function requireAdmin(req, res, next) {
  const token = req.cookies?.adminToken;
  const jwtSecret = process.env.JWT_SECRET;

  // Check JWT configuration
  if (!jwtSecret) {
    console.error("JWT_SECRET is not configured.");

    return res.status(500).json({
      message: "Server authentication configuration error.",
    });
  }

  // Check authentication cookie
  if (!token) {
    return res.status(401).json({
      message: "Admin session cookie is missing. Please sign in again.",
    });
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: ["HS256"],
    });

    // Verify admin role
    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required.",
      });
    }

    // Attach authenticated admin information
    req.admin = decoded;

    return next();

  } catch (error) {
    return res.status(401).json({
      message: "Your session is invalid or has expired. Please sign in again.",
    });
  }
}

// Check Admin Session
app.get("/api/auth/check", requireAdmin, (req, res) => {
  return res.status(200).json({
    authenticated: true,
    user: {
      email: req.admin.email,
      role: req.admin.role,
    },
  });
});
// Get All Contact Messages (Admin Only)
app.get("/api/messages", requireAdmin, async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      count: messages.length,
      messages,
    });

  } catch (error) {
    console.error("Get messages error:", error);

    return res.status(500).json({
      message: "Unable to retrieve contact messages.",
    });
  }
});
// Delete Contact Message (Admin Only)
app.delete("/api/messages/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate message ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid message ID.",
      });
    }

    // Find and delete message
    const deletedMessage = await Message.findByIdAndDelete(id);

    // Check if message exists
    if (!deletedMessage) {
      return res.status(404).json({
        message: "Contact message not found.",
      });
    }

    return res.status(200).json({
      message: "Contact message deleted successfully.",
    });

  } catch (error) {
    console.error("Delete message error:", error);

    return res.status(500).json({
      message: "Unable to delete contact message.",
    });
  }
});

// Profile Setup (Admin Only)
app.post("/api/profile/setup", requireAdmin, async (req, res) => {
  try {
    // Check whether a profile already exists
    const existingProfile = await Profile.findOne();

    if (existingProfile) {
      return res.status(200).json({
        message: "Profile already exists.",
        profile: existingProfile,
      });
    }

    // Create the initial profile
    const profile = await Profile.create({
      name: "Sisay Belachew",
      department: "Electrical and Computer Engineering",
      skills: [
        "React",
        "Node.js",
        "MongoDB",
        "Python",
        "MySQL",
      ],
    });

    return res.status(201).json({
      message: "Profile saved successfully.",
      profile,
    });

  } catch (error) {
    console.error("Profile setup error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Profile validation failed.",
      });
    }

    return res.status(500).json({
      message: "Unable to save profile.",
    });
  }
});
app.get("/", (req, res) => {
  res.send("Sisay Portfolio Backend is Running!");
});
// Create a new project
app.post("/api/projects", requireAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      technologies,
      liveUrl,
      githubUrl,
    } = req.body;

    // Validate required fields
    if (
      typeof title !== "string" ||
      typeof description !== "string" ||
      !title.trim() ||
      !description.trim()
    ) {
      return res.status(400).json({
        message: "Project title and description are required.",
      });
    }

    // Validate technologies
    if (
      technologies !== undefined &&
      (!Array.isArray(technologies) ||
        !technologies.every((item) => typeof item === "string"))
    ) {
      return res.status(400).json({
        message: "Technologies must be an array of text values.",
      });
    }

    // Validate URLs
    if (
      (liveUrl !== undefined && typeof liveUrl !== "string") ||
      (githubUrl !== undefined && typeof githubUrl !== "string")
    ) {
      return res.status(400).json({
        message: "Project URLs must be text values.",
      });
    }

    // Reject unsupported fields
    const allowedFields = [
      "title",
      "description",
      "technologies",
      "liveUrl",
      "githubUrl",
    ];

    const unexpectedFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (unexpectedFields.length > 0) {
      return res.status(400).json({
        message: "Request contains unsupported fields.",
      });
    }

    const project = await Project.create({
      title,
      description,
      technologies,
      liveUrl,
      githubUrl,
    });

    return res.status(201).json({
      message: "Project created successfully.",
      project,
    });

  } catch (error) {
    console.error("Create project error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Project validation failed. Please check your information.",
      });
    }

    return res.status(500).json({
      message: "Unable to create project.",
    });
  }
});
app.get("/api/profile", async (req, res) => {
  try {
    const profile = await Profile.findOne();

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found in database",
      });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message,
    });
  }
});
// Get all projects
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find();

    res.json(projects);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching projects",
      error: error.message,
    });
  }
});
// Update a project (Admin Only)
app.put("/api/projects/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate project ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid project ID.",
      });
    }

    // Allow only these fields
    const allowedFields = [
      "title",
      "description",
      "technologies",
      "liveUrl",
      "githubUrl",
    ];

    // Reject unsupported fields
    const unexpectedFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (unexpectedFields.length > 0) {
      return res.status(400).json({
        message: "Request contains unsupported fields.",
      });
    }

    // Validate title
    if (
      req.body.title !== undefined &&
      typeof req.body.title !== "string"
    ) {
      return res.status(400).json({
        message: "Project title must be text.",
      });
    }

    // Validate description
    if (
      req.body.description !== undefined &&
      typeof req.body.description !== "string"
    ) {
      return res.status(400).json({
        message: "Project description must be text.",
      });
    }

    // Validate technologies
    if (
      req.body.technologies !== undefined &&
      (!Array.isArray(req.body.technologies) ||
        !req.body.technologies.every(
          (item) => typeof item === "string"
        ))
    ) {
      return res.status(400).json({
        message: "Technologies must be an array of text values.",
      });
    }

    // Validate URLs
    if (
      (req.body.liveUrl !== undefined &&
        typeof req.body.liveUrl !== "string") ||
      (req.body.githubUrl !== undefined &&
        typeof req.body.githubUrl !== "string")
    ) {
      return res.status(400).json({
        message: "Project URLs must be text values.",
      });
    }

    // Build safe update object
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "No valid project fields provided.",
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProject) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    return res.json({
      message: "Project updated successfully.",
      project: updatedProject,
    });

  } catch (error) {
    console.error("Update project error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        message: "Project update validation failed.",
      });
    }

    return res.status(500).json({
      message: "Unable to update project.",
    });
  }
});
// Delete a project (Admin Only)
app.delete("/api/projects/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate project ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid project ID.",
      });
    }

    // Delete project
    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    return res.json({
      message: "Project deleted successfully.",
      project: deletedProject,
    });

  } catch (error) {
    console.error("Delete project error:", error);

    return res.status(500).json({
      message: "Unable to delete project.",
    });
  }
});
// Update profile (Admin Only)
app.put("/api/profile", requireAdmin, async (req, res) => {
  try {
    // Allow only these fields
    const allowedFields = ["name", "department", "skills"];

    // Reject unsupported fields
    const unexpectedFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (unexpectedFields.length > 0) {
      return res.status(400).json({
        message: "Request contains unsupported fields.",
      });
    }

    // Validate name
    if (
      req.body.name !== undefined &&
      (typeof req.body.name !== "string" ||
        !req.body.name.trim())
    ) {
      return res.status(400).json({
        message: "Name must be valid text.",
      });
    }

    // Validate department
    if (
      req.body.department !== undefined &&
      (typeof req.body.department !== "string" ||
        !req.body.department.trim())
    ) {
      return res.status(400).json({
        message: "Department must be valid text.",
      });
    }

    // Validate skills
    if (
      req.body.skills !== undefined &&
      (!Array.isArray(req.body.skills) ||
        !req.body.skills.every(
          (skill) =>
            typeof skill === "string" &&
            skill.trim().length > 0
        ))
    ) {
      return res.status(400).json({
        message: "Skills must be an array of valid text values.",
      });
    }

    // Reject empty updates
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "No profile information provided.",
      });
    }

    const profile = await Profile.findOne();

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found.",
      });
    }

    // Update only permitted fields
    if (req.body.name !== undefined) {
      profile.name = req.body.name.trim();
    }

    if (req.body.department !== undefined) {
      profile.department = req.body.department.trim();
    }

    if (req.body.skills !== undefined) {
      profile.skills = req.body.skills.map(
        (skill) => skill.trim()
      );
    }

    await profile.save();

    return res.json({
      message: "Profile updated successfully.",
      profile,
    });

  } catch (error) {
    console.error("Update profile error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Profile validation failed. Please check your information.",
      });
    }

    return res.status(500).json({
      message: "Unable to update profile.",
    });
  }
});
// Start Server
async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully!");

    // Get port from environment
    const PORT = process.env.PORT || 5000;

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on("error", (error) => {
      console.error("Express server error:", error);
      process.exit(1);
    });

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();