import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),
  email: text("email"),
  bio: text("bio"),
  premium: boolean("premium").default(false).notNull(),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goalTypeEnum = pgEnum("goal_type", ["one-time", "recurring", "challenge"]);
export const goalStatusEnum = pgEnum("goal_status", ["active", "completed", "failed"]);

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: goalTypeEnum("type").notNull(),
  duration: integer("duration").notNull(),
  durationUnit: text("duration_unit").notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  status: goalStatusEnum("status").default("active").notNull(),
  progress: integer("progress").default(0).notNull(),
  category: text("category").default("general").notNull(),
  visibility: text("visibility").default("public").notNull(),
  twitterShare: boolean("twitter_share").default(false).notNull(),
  linkedinShare: boolean("linkedin_share").default(false).notNull(),
  bioUpdate: boolean("bio_update").default(false).notNull(),
  reminderFrequency: text("reminder_frequency").default("daily").notNull(),
  tags: text("tags").array().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const checkIns = pgTable("check_ins", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").references(() => goals.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  isCompleted: boolean("is_completed").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feedItemTypeEnum = pgEnum("feed_item_type", [
  "goal_created", 
  "goal_completed", 
  "goal_failed", 
  "check_in", 
  "streak_milestone", 
  "challenge_joined", 
  "challenge_completed",
  "custom"
]);

export const feedItems = pgTable("feed_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  goalId: integer("goal_id").references(() => goals.id).notNull(),
  checkInId: integer("check_in_id").references(() => checkIns.id),
  type: feedItemTypeEnum("type").default("custom").notNull(),
  content: text("content").notNull(),
  likes: integer("likes").default(0).notNull(),
  claps: integer("claps").default(0).notNull(),
  hearts: integer("hearts").default(0).notNull(),
  fires: integer("fires").default(0).notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  feedItemId: integer("feed_item_id").references(() => feedItems.id).notNull(),
  content: text("content").notNull(),
  likes: integer("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").references(() => users.id).notNull(),
  followingId: integer("following_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const challengeTypeEnum = pgEnum("challenge_type", ["one-time", "recurring"]);

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: challengeTypeEnum("type").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  maxParticipants: integer("max_participants"),
  tags: text("tags").array().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const challengeParticipants = pgTable("challenge_participants", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").references(() => challenges.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  goalId: integer("goal_id").references(() => goals.id).notNull(),
  progress: integer("progress").default(0).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const challengeUpdates = pgTable("challenge_updates", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").references(() => challenges.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  likes: integer("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const socialAccounts = pgTable("social_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  platform: text("platform").notNull(), // twitter, linkedin, etc.
  accountId: text("account_id").notNull(),
  username: text("username").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  avatarUrl: true,
  email: true,
  bio: true,
  premium: true,
});

export const insertGoalSchema = createInsertSchema(goals).pick({
  userId: true,
  title: true,
  description: true,
  type: true,
  duration: true,
  durationUnit: true,
  startDate: true,
  endDate: true,
  category: true,
  visibility: true,
  twitterShare: true,
  linkedinShare: true,
  bioUpdate: true,
  reminderFrequency: true,
  tags: true,
});

export const insertCheckInSchema = createInsertSchema(checkIns).pick({
  goalId: true,
  userId: true,
  isCompleted: true,
  note: true,
});

export const insertFeedItemSchema = createInsertSchema(feedItems).pick({
  userId: true,
  goalId: true,
  checkInId: true,
  type: true,
  content: true,
  isPublic: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  userId: true,
  feedItemId: true,
  content: true,
});

export const insertFollowSchema = createInsertSchema(follows).pick({
  followerId: true,
  followingId: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).pick({
  creatorId: true,
  title: true,
  description: true,
  type: true,
  startDate: true,
  endDate: true,
  isPublic: true,
  maxParticipants: true,
  tags: true,
});

export const insertChallengeParticipantSchema = createInsertSchema(challengeParticipants).pick({
  challengeId: true,
  userId: true,
  goalId: true,
});

export const insertChallengeUpdateSchema = createInsertSchema(challengeUpdates).pick({
  challengeId: true,
  userId: true,
  content: true,
});

export const insertSocialAccountSchema = createInsertSchema(socialAccounts).pick({
  userId: true,
  platform: true,
  accountId: true,
  username: true,
  accessToken: true,
  refreshToken: true,
});

// Types
export type User = typeof users.$inferSelect & {
  isOnline?: boolean;
  lastSeen?: string;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
};
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Goal = typeof goals.$inferSelect & {
  completed?: boolean;
  targetDate?: string;
};
export type InsertGoal = z.infer<typeof insertGoalSchema>;

export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;

export type FeedItem = typeof feedItems.$inferSelect;
export type InsertFeedItem = z.infer<typeof insertFeedItemSchema>;

export type Comment = typeof comments.$inferSelect & {
  user?: User;
};
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;

export type Challenge = typeof challenges.$inferSelect & {
  participantsCount?: number;
  isParticipating?: boolean;
};
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;
export type InsertChallengeParticipant = z.infer<typeof insertChallengeParticipantSchema>;

export type ChallengeUpdate = typeof challengeUpdates.$inferSelect;
export type InsertChallengeUpdate = z.infer<typeof insertChallengeUpdateSchema>;

export type SocialAccount = typeof socialAccounts.$inferSelect;
export type InsertSocialAccount = z.infer<typeof insertSocialAccountSchema>;

export interface ChallengeWithDetails extends Challenge {
  participants: User[];
  creator: User;
  progress?: number;
  streak?: number;
  completedAt?: string;
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly";
  userId: string;
  createdAt: string;
  updatedAt: string;
  streak: number;
  lastCompleted?: string;
}

export interface Post {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  user?: User;
}

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  goals: many(goals),
  checkIns: many(checkIns),
  feedItems: many(feedItems),
  comments: many(comments),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
  createdChallenges: many(challenges, { relationName: "creator" }),
  challengeParticipants: many(challengeParticipants),
  challengeUpdates: many(challengeUpdates),
  socialAccounts: many(socialAccounts),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
  checkIns: many(checkIns),
  feedItems: many(feedItems),
  challengeParticipants: many(challengeParticipants),
}));

export const checkInsRelations = relations(checkIns, ({ one, many }) => ({
  user: one(users, {
    fields: [checkIns.userId],
    references: [users.id],
  }),
  goal: one(goals, {
    fields: [checkIns.goalId],
    references: [goals.id],
  }),
  feedItems: many(feedItems),
}));

export const feedItemsRelations = relations(feedItems, ({ one, many }) => ({
  user: one(users, {
    fields: [feedItems.userId],
    references: [users.id],
  }),
  goal: one(goals, {
    fields: [feedItems.goalId],
    references: [goals.id],
  }),
  checkIn: one(checkIns, {
    fields: [feedItems.checkInId],
    references: [checkIns.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  feedItem: one(feedItems, {
    fields: [comments.feedItemId],
    references: [feedItems.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
  }),
}));

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  creator: one(users, {
    fields: [challenges.creatorId],
    references: [users.id],
  }),
  participants: many(challengeParticipants),
  updates: many(challengeUpdates),
}));

export const challengeParticipantsRelations = relations(challengeParticipants, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeParticipants.challengeId],
    references: [challenges.id],
  }),
  user: one(users, {
    fields: [challengeParticipants.userId],
    references: [users.id],
  }),
  goal: one(goals, {
    fields: [challengeParticipants.goalId],
    references: [goals.id],
  }),
}));

export const challengeUpdatesRelations = relations(challengeUpdates, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeUpdates.challengeId],
    references: [challenges.id],
  }),
  user: one(users, {
    fields: [challengeUpdates.userId],
    references: [users.id],
  }),
}));

export const socialAccountsRelations = relations(socialAccounts, ({ one }) => ({
  user: one(users, {
    fields: [socialAccounts.userId],
    references: [users.id],
  }),
}));
