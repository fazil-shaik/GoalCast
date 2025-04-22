import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { z } from "zod";
import { insertUserSchema, insertGoalSchema, insertCheckInSchema, insertFeedItemSchema, insertChallengeSchema } from "../shared/schema";
import { fromZodError } from "zod-validation-error";
import MemoryStore from "memorystore";
import path from "path";
import { OpenAI } from 'openai';
import dotenv from 'dotenv'
import { sendForgotPasswordEmail, verifyResetToken, resetPassword } from './emailService';
dotenv.config();
// Extend the express-session types
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

// Create memory store for session
const MemoryStoreSession = MemoryStore(session);

// Create API router
const apiRouter = express.Router();

// API Middleware
function ensureAuthenticated(req: Request, res: Response, next: Function) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Authentication routes
  apiRouter.post("/auth/register", async (req, res) => {
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

  apiRouter.post("/auth/login", async (req, res) => {
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

  apiRouter.get("/auth/me", ensureAuthenticated, async (req, res) => {
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

  apiRouter.post("/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Goals routes
  apiRouter.get("/goals", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const goals = await storage.getGoalsByUserId(userId);
      res.json(goals);
    } catch (error) {
      console.error("Get goals error:", error);
      res.status(500).json({ message: "Failed to get goals" });
    }
  });

  apiRouter.get("/goals/active", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const goals = await storage.getActiveGoalsByUserId(userId);
      res.json(goals);
    } catch (error) {
      console.error("Get active goals error:", error);
      res.status(500).json({ message: "Failed to get active goals" });
    }
  });

  apiRouter.post("/goals", ensureAuthenticated, async (req, res) => {
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

  // Check-ins routes
  apiRouter.get("/checkins", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const checkIns = await storage.getCheckInsByUserId(userId);
      res.json(checkIns);
    } catch (error) {
      console.error("Get check-ins error:", error);
      res.status(500).json({ message: "Failed to get check-ins" });
    }
  });

  apiRouter.post("/checkins", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      // Add userId to check-in data
      const checkInData = { ...req.body, userId };
      
      try {
        const parsedData = insertCheckInSchema.parse(checkInData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ message: validationError.message });
        }
        throw error;
      }
      
      // Create check-in
      const checkIn = await storage.createCheckIn(checkInData);
      
      // If check-in has a note, create a feed item
      if (checkInData.note) {
        // Get the goal to reference in the feed item
        const goal = await storage.getGoal(checkInData.goalId);
        
        if (goal) {
          // Create content for feed item
          const daysCompleted = await storage.getCompletedCheckInsCount(goal.id);
          
          // Generate content based on check-in and goal
          const content = checkInData.isCompleted
            ? `Day ${daysCompleted}/${goal.duration}: ${checkInData.note} #${goal.title.replace(/\s+/g, '')}`
            : `Missed a day on my ${goal.title} goal, but getting back on track! ${checkInData.note}`;
          
          // Create feed item
          await storage.createFeedItem({
            userId,
            goalId: checkInData.goalId,
            checkInId: checkIn.id,
            content,
          });
        }
      }
      
      res.status(201).json(checkIn);
    } catch (error) {
      console.error("Create check-in error:", error);
      res.status(500).json({ message: "Failed to create check-in" });
    }
  });

  // Feed routes
  apiRouter.get("/feed", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const feedItems = await storage.getFeedItemsWithUser();
      
      // Add user interaction data (likes, claps)
      const enhancedFeedItems = feedItems.map(item => ({
        ...item,
        hasLiked: Math.random() < 0.3, // Mock data, would be from a user_likes table in real implementation
        hasClapped: Math.random() < 0.2, // Mock data, would be from a user_claps table
      }));
      
      res.json(enhancedFeedItems);
    } catch (error) {
      console.error("Get feed error:", error);
      res.status(500).json({ message: "Failed to get feed" });
    }
  });

  // Online users route
  apiRouter.get("/users/online", ensureAuthenticated, async (req, res) => {
    try {
      // In a real implementation, this would track user sessions and last activity
      // For now, we'll return mock data
      const onlineUsers = {
        count: 42,
        users: [
          { id: 1, name: "John Doe", avatarUrl: "https://ui-avatars.com/api/?name=John+Doe&background=random" },
          { id: 2, name: "Jane Smith", avatarUrl: "https://ui-avatars.com/api/?name=Jane+Smith&background=random" },
          { id: 3, name: "Mike Johnson", avatarUrl: "https://ui-avatars.com/api/?name=Mike+Johnson&background=random" },
          { id: 4, name: "Sarah Wilson", avatarUrl: "https://ui-avatars.com/api/?name=Sarah+Wilson&background=random" },
          { id: 5, name: "Alex Brown", avatarUrl: "https://ui-avatars.com/api/?name=Alex+Brown&background=random" },
        ]
      };
      
      res.json(onlineUsers);
    } catch (error) {
      console.error("Get online users error:", error);
      res.status(500).json({ message: "Failed to get online users" });
    }
  });

  // Challenge routes
  apiRouter.post("/challenges", ensureAuthenticated, async (req, res) => {
    try {
      const creatorId = req.session.userId as number;
      
      // Add creatorId to challenge data
      const challengeData = { ...req.body, creatorId };
      
      try {
        const parsedData = insertChallengeSchema.parse(challengeData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ message: validationError.message });
        }
        throw error;
      }
      
      const challenge = await storage.createChallenge(challengeData);
      res.status(201).json(challenge);
    } catch (error) {
      console.error("Create challenge error:", error);
      res.status(500).json({ message: "Failed to create challenge" });
    }
  });

  apiRouter.get("/challenges", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const challenges = await storage.getChallenges(userId);
      res.json(challenges);
    } catch (error) {
      console.error("Get challenges error:", error);
      res.status(500).json({ message: "Failed to get challenges" });
    }
  });

  apiRouter.get("/challenges/:id", ensureAuthenticated, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const userId = req.session.userId as number;
      
      const challenge = await storage.getChallengeWithDetails(challengeId, userId);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      res.json(challenge);
    } catch (error) {
      console.error("Get challenge error:", error);
      res.status(500).json({ message: "Failed to get challenge" });
    }
  });

  apiRouter.post("/challenges/:id/join", ensureAuthenticated, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const userId = req.session.userId as number;
      
      // Check if challenge exists
      const challenge = await storage.getChallenge(challengeId);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      // Check if already participating
      const existingParticipation = await storage.getChallengeParticipant(challengeId, userId);
      if (existingParticipation) {
        return res.status(400).json({ message: "Already participating in this challenge" });
      }
      
      // Check if challenge is full
      if (challenge.maxParticipants) {
        const participantsCount = await storage.getChallengeParticipantsCount(challengeId);
        if (participantsCount >= challenge.maxParticipants) {
          return res.status(400).json({ message: "Challenge is full" });
        }
      }
      
      // Create a goal for the challenge
      const goalData = {
        userId,
        title: `Complete ${challenge.title}`,
        description: challenge.description,
        type: "challenge" as const,
        duration: Math.ceil((new Date(challenge.endDate).getTime() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24)),
        durationUnit: "days",
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        category: "challenge",
        visibility: "public"
      };
      
      const goal = await storage.createGoal(goalData);
      
      // Join the challenge
      await storage.createChallengeParticipant({
        challengeId,
        userId,
        goalId: goal.id
      });
      
      res.status(201).json({ message: "Successfully joined challenge" });
    } catch (error) {
      console.error("Join challenge error:", error);
      res.status(500).json({ message: "Failed to join challenge" });
    }
  });

  apiRouter.post("/challenges/:id/updates", ensureAuthenticated, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const userId = req.session.userId as number;
      
      // Check if participating in the challenge
      const participation = await storage.getChallengeParticipant(challengeId, userId);
      if (!participation) {
        return res.status(403).json({ message: "Must be participating in the challenge to post updates" });
      }
      
      // Create challenge update
      const update = await storage.createChallengeUpdate({
        challengeId,
        userId,
        content: req.body.content
      });
      
      res.status(201).json(update);
    } catch (error) {
      console.error("Create challenge update error:", error);
      res.status(500).json({ message: "Failed to create challenge update" });
    }
  });

  apiRouter.get("/challenges/:id/updates", ensureAuthenticated, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const updates = await storage.getChallengeUpdates(challengeId);
      res.json(updates);
    } catch (error) {
      console.error("Get challenge updates error:", error);
      res.status(500).json({ message: "Failed to get challenge updates" });
    }
  });

  apiRouter.get("/challenges/spotlight", ensureAuthenticated, async (req, res) => {
    try {
      const spotlightChallenges = await storage.getSpotlightChallenges();
      res.json(spotlightChallenges);
    } catch (error) {
      console.error("Get spotlight challenges error:", error);
      res.status(500).json({ message: "Failed to get spotlight challenges" });
    }
  });

  apiRouter.post("/feed/:id/like", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const feedItemId = parseInt(req.params.id);
      const { action } = req.body;
      
      if (action !== 'like' && action !== 'unlike') {
        return res.status(400).json({ message: "Invalid action" });
      }
      
      // Update like count (in real app, would insert/delete from user_likes table)
      const feedItem = await storage.updateFeedItemLikes(
        feedItemId, 
        action === 'like' ? 1 : -1
      );
      
      res.json(feedItem);
    } catch (error) {
      console.error("Like feed item error:", error);
      res.status(500).json({ message: "Failed to like feed item" });
    }
  });

  apiRouter.post("/feed/:id/clap", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const feedItemId = parseInt(req.params.id);
      const { action } = req.body;
      
      if (action !== 'clap' && action !== 'unclap') {
        return res.status(400).json({ message: "Invalid action" });
      }
      
      // Update clap count (in real app, would insert/delete from user_claps table)
      const feedItem = await storage.updateFeedItemClaps(
        feedItemId, 
        action === 'clap' ? 1 : -1
      );
      
      res.json(feedItem);
    } catch (error) {
      console.error("Clap feed item error:", error);
      res.status(500).json({ message: "Failed to clap feed item" });
    }
  });

  // Stats routes
  apiRouter.get("/stats", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      // Get active goals count
      const activeGoals = await storage.getActiveGoalsByUserId(userId);
      
      // Get check-in data
      const checkIns = await storage.getCheckInsByUserId(userId);
      const completedCheckIns = checkIns.filter(ci => ci.isCompleted);
      
      // Calculate check-in rate
      const checkInRate = checkIns.length > 0 
        ? Math.round((completedCheckIns.length / checkIns.length) * 100) 
        : 0;
      
      // Calculate current streak (consecutive completed check-ins)
      const streak = await storage.getCurrentStreak(userId);
      
      // Simple mock data for social engagement
      const socialEngagement = {
        count: 42, // Total likes + claps received
        percentChange: 24, // % change from last week
      };
      
      const stats = {
        activeGoals: {
          count: activeGoals.length,
          limit: 2, // Free tier limit
        },
        currentStreak: {
          days: streak,
          isLongest: streak > 0, // Would compare to user's record in real implementation
        },
        socialEngagement,
        checkInRate: {
          percentage: checkInRate,
          status: checkInRate >= 80 ? "On track" : checkInRate >= 50 ? "Falling behind" : "At risk",
        },
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  // Analytics route
  apiRouter.get("/analytics", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      
      // In a real implementation, this would return detailed analytics data
      // For MVP, we'll return a success message
      res.json({ success: true });
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({ message: "Failed to get analytics" });
    }
  });

  // AI Enhancement endpoint
  apiRouter.post("/ai/enhance-note", ensureAuthenticated, async (req, res) => {
    try {
      const { note } = req.body;

      if (!note) {
        return res.status(400).json({ error: 'Note is required' });
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that enhances daily check-in notes for goals. Make the notes more detailed, professional, and motivating while maintaining the original meaning. Keep the enhancement concise and natural."
          },
          {
            role: "user",
            content: note
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      const enhancedNote = completion.choices[0]?.message?.content || note;

      return res.status(200).json({ enhancedNote });
    } catch (error) {
      console.error('Error enhancing note:', error);
      return res.status(500).json({ error: 'Failed to enhance note' });
    }
  });

  // Test route
  app.get("/api/ping", (req, res) => {
    res.json({ message: "pong", timestamp: new Date().toISOString() });
  });

  // Serve test HTML
  app.get("/test", (req, res) => {
    res.sendFile(path.resolve(process.cwd(), "test.html"));
  });

  // Following routes
  apiRouter.post("/users/follow/:userId", ensureAuthenticated, async (req, res) => {
    try {
      const followerId = req.session.userId as number;
      const followingId = parseInt(req.params.userId);

      if (followerId === followingId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }

      // Check if user exists
      const userToFollow = await storage.getUser(followingId);
      if (!userToFollow) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if already following
      const existingFollow = await storage.getFollow(followerId, followingId);
      if (existingFollow) {
        return res.status(400).json({ message: "Already following this user" });
      }

      // Create follow relationship
      await storage.createFollow({ followerId, followingId });
      
      res.status(201).json({ message: "Successfully followed user" });
    } catch (error) {
      console.error("Follow user error:", error);
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  apiRouter.delete("/users/follow/:userId", ensureAuthenticated, async (req, res) => {
    try {
      const followerId = req.session.userId as number;
      const followingId = parseInt(req.params.userId);

      // Remove follow relationship
      await storage.deleteFollow(followerId, followingId);
      
      res.json({ message: "Successfully unfollowed user" });
    } catch (error) {
      console.error("Unfollow user error:", error);
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  apiRouter.get("/users/following", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const following = await storage.getFollowing(userId);
      res.json(following);
    } catch (error) {
      console.error("Get following error:", error);
      res.status(500).json({ message: "Failed to get following list" });
    }
  });

  apiRouter.get("/users/followers", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const followers = await storage.getFollowers(userId);
      res.json(followers);
    } catch (error) {
      console.error("Get followers error:", error);
      res.status(500).json({ message: "Failed to get followers list" });
    }
  });

  apiRouter.get("/users/following/streaks", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const followingStreaks = await storage.getFollowingStreaks(userId);
      res.json(followingStreaks);
    } catch (error) {
      console.error("Get following streaks error:", error);
      res.status(500).json({ message: "Failed to get following streaks" });
    }
  });

  // Forgot Password routes
  apiRouter.post("/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      console.log(`Processing password reset request for email: ${email}`);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log(`No user found with email: ${email}`);
        return res.status(404).json({ message: "No account found with this email" });
      }
      
      console.log(`User found: ${user.username}, sending reset email...`);
      
      const result = await sendForgotPasswordEmail(email, user.username);
      console.log(`Email send result:`, result);
      
      if (!result.success) {
        console.error(`Failed to send reset email: ${result.message}`);
        return res.status(500).json({ message: result.message });
      }
      
      console.log(`Reset email sent successfully to: ${email}`);
      res.json({ message: "Password reset instructions sent to your email" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process forgot password request" });
    }
  });

  apiRouter.post("/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      
      const result = await resetPassword(token, newPassword);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  apiRouter.get("/auth/verify-reset-token/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }
      
      const result = await verifyResetToken(token);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.json({ valid: true });
    } catch (error) {
      console.error("Verify reset token error:", error);
      res.status(500).json({ message: "Failed to verify reset token" });
    }
  });

  // Mount API router
  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}
