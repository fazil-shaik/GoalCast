import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import { eq, and } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

export const storage = {
  async getUserByUsername(username: string) {
    const users = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return users[0];
  },

  async createUser(userData: any) {
    const users = await db.insert(schema.users).values(userData).returning();
    return users[0];
  },

  async getUser(id: number) {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return users[0];
  },

  async getGoalsByUserId(userId: number) {
    return await db.select().from(schema.goals).where(eq(schema.goals.userId, userId));
  },

  async getActiveGoalsByUserId(userId: number) {
    return await db.select()
      .from(schema.goals)
      .where(and(
        eq(schema.goals.userId, userId),
        eq(schema.goals.status, 'active')
      ));
  },

  async createGoal(goalData: any) {
    const goals = await db.insert(schema.goals).values(goalData).returning();
    return goals[0];
  },

  async getGoal(id: number) {
    const goals = await db.select().from(schema.goals).where(eq(schema.goals.id, id));
    return goals[0];
  },

  async getCheckInsByUserId(userId: number) {
    return await db.select().from(schema.checkIns).where(eq(schema.checkIns.userId, userId));
  },

  async createCheckIn(checkInData: any) {
    const checkIns = await db.insert(schema.checkIns).values(checkInData).returning();
    return checkIns[0];
  },

  async getCompletedCheckInsCount(goalId: number) {
    const checkIns = await db.select()
      .from(schema.checkIns)
      .where(and(
        eq(schema.checkIns.goalId, goalId),
        eq(schema.checkIns.isCompleted, true)
      ));
    return checkIns.length;
  },

  async createFeedItem(feedItemData: any) {
    const feedItems = await db.insert(schema.feedItems).values(feedItemData).returning();
    return feedItems[0];
  }
}; 