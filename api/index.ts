import express from 'express';
import { storage } from './storage.js';
import session from 'express-session';
import MemoryStore from 'memorystore';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { insertUserSchema, insertGoalSchema, insertCheckInSchema } from '../shared/schema';
import dotenv from 'dotenv';

dotenv.config();

// Extend the express-session types
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

// Create memory store for session
const MemoryStoreSession = MemoryStore(session);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware
app.use(
  session({
    store: new MemoryStoreSession({
      checkPeriod: 86400000, // Cleanup every 24 hours
    }),
    secret: process.env.SESSION_SECRET || "goalcast-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// API Middleware
function ensureAuthenticated(req: express.Request, res: express.Response, next: Function) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Authentication routes
app.post("/api/auth/register", async (req, res) => {
  try {
    try {
      const parsedData = insertUserSchema.parse(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      throw error;
    }

    // Check if username is already taken
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Create user
    const user = await storage.createUser(req.body);
    
    // Set user in session
    req.session.userId = user.id;
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Failed to register" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // Set user in session
    req.session.userId = user.id;
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to login" });
  }
});

app.get("/api/auth/me", ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId as number;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to get user" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to logout" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

// Goals routes
app.get("/api/goals", ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId as number;
    const goals = await storage.getGoalsByUserId(userId);
    res.json(goals);
  } catch (error) {
    console.error("Get goals error:", error);
    res.status(500).json({ message: "Failed to get goals" });
  }
});

app.post("/api/goals", ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId as number;
    
    // Add userId to goal data
    const goalData = { ...req.body, userId };
    
    try {
      const parsedData = insertGoalSchema.parse(goalData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      throw error;
    }
    
    // Check freemium limits for active goals
    const activeGoals = await storage.getActiveGoalsByUserId(userId);
    if (activeGoals.length >= 2) {
      return res.status(403).json({ message: "Free tier limit reached. Upgrade to create more goals." });
    }
    
    const goal = await storage.createGoal(goalData);
    res.status(201).json(goal);
  } catch (error) {
    console.error("Create goal error:", error);
    res.status(500).json({ message: "Failed to create goal" });
  }
});

// Export the Express app as a serverless function
export default app; 