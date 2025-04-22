import { 
  users, 
  type User, 
  type InsertUser, 
  goals, 
  type Goal, 
  type InsertGoal, 
  checkIns, 
  type CheckIn, 
  type InsertCheckIn, 
  feedItems, 
  type FeedItem, 
  type InsertFeedItem, 
  socialAccounts, 
  type SocialAccount, 
  type InsertSocialAccount, 
  follows, 
  type Follow, 
  type InsertFollow, 
  challenges, 
  type Challenge, 
  type InsertChallenge, 
  challengeParticipants, 
  type ChallengeParticipant, 
  type InsertChallengeParticipant, 
  challengeUpdates, 
  type ChallengeUpdate, 
  type InsertChallengeUpdate, 
  type ChallengeWithDetails 
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, count, sql, asc, or } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserResetToken(userId: number, resetToken: string | null, resetTokenExpiry: Date | null): Promise<void>;
  updateUserPassword(userId: number, newPassword: string): Promise<void>;
  
  // Goal operations
  getGoal(id: number): Promise<Goal | undefined>;
  getGoalsByUserId(userId: number): Promise<Goal[]>;
  getActiveGoalsByUserId(userId: number): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<Goal>): Promise<Goal>;
  
  // Check-in operations
  getCheckIn(id: number): Promise<CheckIn | undefined>;
  getCheckInsByUserId(userId: number): Promise<CheckIn[]>;
  getCheckInsByGoalId(goalId: number): Promise<CheckIn[]>;
  getCompletedCheckInsCount(goalId: number): Promise<number>;
  createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn>;
  
  // Feed item operations
  getFeedItem(id: number): Promise<FeedItem | undefined>;
  getFeedItems(): Promise<FeedItem[]>;
  getFeedItemsWithUser(): Promise<(FeedItem & { user: User })[]>;
  createFeedItem(feedItem: InsertFeedItem): Promise<FeedItem>;
  updateFeedItemLikes(id: number, change: number): Promise<FeedItem>;
  updateFeedItemClaps(id: number, change: number): Promise<FeedItem>;
  
  // Social account operations
  getSocialAccount(id: number): Promise<SocialAccount | undefined>;
  getSocialAccountsByUserId(userId: number): Promise<SocialAccount[]>;
  createSocialAccount(socialAccount: InsertSocialAccount): Promise<SocialAccount>;
  
  // Analytics operations
  getCurrentStreak(userId: number): Promise<number>;
  
  // Following operations
  getFollow(followerId: number, followingId: number): Promise<Follow | undefined>;
  createFollow(follow: InsertFollow): Promise<Follow>;
  deleteFollow(followerId: number, followingId: number): Promise<void>;
  getFollowing(userId: number): Promise<User[]>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowingStreaks(userId: number): Promise<{ user: User; streak: number }[]>;
  
  // Challenge operations
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getChallenge(id: number): Promise<Challenge | undefined>;
  getChallenges(userId: number): Promise<Challenge[]>;
  getChallengeWithDetails(id: number, userId: number): Promise<ChallengeWithDetails | undefined>;
  getChallengeParticipant(challengeId: number, userId: number): Promise<ChallengeParticipant | undefined>;
  getChallengeParticipantsCount(challengeId: number): Promise<number>;
  createChallengeParticipant(participant: InsertChallengeParticipant): Promise<ChallengeParticipant>;
  createChallengeUpdate(update: InsertChallengeUpdate): Promise<ChallengeUpdate>;
  getChallengeUpdates(challengeId: number): Promise<(ChallengeUpdate & { user: User })[]>;
  getSpotlightChallenges(): Promise<Challenge[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserResetToken(userId: number, resetToken: string | null, resetTokenExpiry: Date | null): Promise<void> {
    await db.update(users)
      .set({
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry
      })
      .where(eq(users.id, userId));
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    await db.update(users)
      .set({
        password: newPassword
      })
      .where(eq(users.id, userId));
  }

  // Goal operations
  async getGoal(id: number): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal;
  }

  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    return db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.createdAt));
  }

  async getActiveGoalsByUserId(userId: number): Promise<Goal[]> {
    return db.select().from(goals).where(
      and(
        eq(goals.userId, userId),
        eq(goals.status, 'active')
      )
    ).orderBy(desc(goals.createdAt));
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const [goal] = await db.insert(goals).values(insertGoal).returning();
    return goal;
  }

  async updateGoal(id: number, goalUpdate: Partial<Goal>): Promise<Goal> {
    const [updatedGoal] = await db
      .update(goals)
      .set(goalUpdate)
      .where(eq(goals.id, id))
      .returning();
    return updatedGoal;
  }

  // Check-in operations
  async getCheckIn(id: number): Promise<CheckIn | undefined> {
    const [checkIn] = await db.select().from(checkIns).where(eq(checkIns.id, id));
    return checkIn;
  }

  async getCheckInsByUserId(userId: number): Promise<CheckIn[]> {
    return db.select().from(checkIns).where(eq(checkIns.userId, userId)).orderBy(desc(checkIns.date));
  }

  async getCheckInsByGoalId(goalId: number): Promise<CheckIn[]> {
    return db.select().from(checkIns).where(eq(checkIns.goalId, goalId)).orderBy(asc(checkIns.date));
  }

  async getCompletedCheckInsCount(goalId: number): Promise<number> {
    const [result] = await db.select({
      count: count()
    }).from(checkIns).where(
      and(
        eq(checkIns.goalId, goalId),
        eq(checkIns.isCompleted, true)
      )
    );
    return result?.count || 0;
  }

  async createCheckIn(insertCheckIn: InsertCheckIn): Promise<CheckIn> {
    const [checkIn] = await db.insert(checkIns).values(insertCheckIn).returning();
    return checkIn;
  }

  // Feed item operations
  async getFeedItem(id: number): Promise<FeedItem | undefined> {
    const [feedItem] = await db.select().from(feedItems).where(eq(feedItems.id, id));
    return feedItem;
  }

  async getFeedItems(): Promise<FeedItem[]> {
    return db.select().from(feedItems).orderBy(desc(feedItems.createdAt));
  }

  async getFeedItemsWithUser(): Promise<(FeedItem & { user: User })[]> {
    const results = await db.select({
      id: feedItems.id,
      userId: feedItems.userId,
      goalId: feedItems.goalId,
      checkInId: feedItems.checkInId,
      type: feedItems.type,
      content: feedItems.content,
      likes: feedItems.likes,
      claps: feedItems.claps,
      hearts: feedItems.hearts,
      fires: feedItems.fires,
      isPublic: feedItems.isPublic,
      createdAt: feedItems.createdAt,
      user: users
    }).from(feedItems)
      .innerJoin(users, eq(feedItems.userId, users.id))
      .orderBy(desc(feedItems.createdAt));
    
    return results.map(result => ({
      ...result,
      user: result.user
    }));
  }

  async createFeedItem(insertFeedItem: InsertFeedItem): Promise<FeedItem> {
    const [feedItem] = await db.insert(feedItems).values(insertFeedItem).returning();
    return feedItem;
  }

  async updateFeedItemLikes(id: number, change: number): Promise<FeedItem> {
    const [feedItem] = await db.select().from(feedItems).where(eq(feedItems.id, id));
    if (!feedItem) {
      throw new Error(`Feed item with ID ${id} not found`);
    }
    
    const [updatedFeedItem] = await db
      .update(feedItems)
      .set({ likes: feedItem.likes + change })
      .where(eq(feedItems.id, id))
      .returning();
    
    return updatedFeedItem;
  }

  async updateFeedItemClaps(id: number, change: number): Promise<FeedItem> {
    const [feedItem] = await db.select().from(feedItems).where(eq(feedItems.id, id));
    if (!feedItem) {
      throw new Error(`Feed item with ID ${id} not found`);
    }
    
    const [updatedFeedItem] = await db
      .update(feedItems)
      .set({ claps: feedItem.claps + change })
      .where(eq(feedItems.id, id))
      .returning();
    
    return updatedFeedItem;
  }

  // Social account operations
  async getSocialAccount(id: number): Promise<SocialAccount | undefined> {
    const [socialAccount] = await db.select().from(socialAccounts).where(eq(socialAccounts.id, id));
    return socialAccount;
  }

  async getSocialAccountsByUserId(userId: number): Promise<SocialAccount[]> {
    return db.select().from(socialAccounts).where(eq(socialAccounts.userId, userId));
  }

  async createSocialAccount(insertSocialAccount: InsertSocialAccount): Promise<SocialAccount> {
    const [socialAccount] = await db.insert(socialAccounts).values(insertSocialAccount).returning();
    return socialAccount;
  }

  // Analytics operations
  async getCurrentStreak(userId: number): Promise<number> {
    // Get the latest check-ins for the user
    const recentCheckIns = await db.select()
      .from(checkIns)
      .where(
        and(
          eq(checkIns.userId, userId),
          eq(checkIns.isCompleted, true)
        )
      )
      .orderBy(desc(checkIns.date));

    if (recentCheckIns.length === 0) {
      return 0;
    }

    // Calculate streak by checking consecutive days
    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneDayMs = 24 * 60 * 60 * 1000;
    let lastDate = new Date(recentCheckIns[0].date);
    lastDate.setHours(0, 0, 0, 0);

    // If the most recent check-in is not from today or yesterday, streak is broken
    const timeDiff = today.getTime() - lastDate.getTime();
    if (timeDiff > oneDayMs) {
      return 0;
    }

    // Count consecutive days
    for (let i = 1; i < recentCheckIns.length; i++) {
      const currentDate = new Date(recentCheckIns[i].date);
      currentDate.setHours(0, 0, 0, 0);
      
      const previousDate = new Date(recentCheckIns[i-1].date);
      previousDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.round((previousDate.getTime() - currentDate.getTime()) / oneDayMs);
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // Following operations
  async getFollow(followerId: number, followingId: number): Promise<Follow | undefined> {
    const [follow] = await db.select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );
    return follow;
  }

  async createFollow(insertFollow: InsertFollow): Promise<Follow> {
    const [follow] = await db.insert(follows).values(insertFollow).returning();
    return follow;
  }

  async deleteFollow(followerId: number, followingId: number): Promise<void> {
    await db.delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );
  }

  async getFollowing(userId: number): Promise<User[]> {
    const results = await db.select({
      user: users
    })
    .from(follows)
    .innerJoin(users, eq(follows.followingId, users.id))
    .where(eq(follows.followerId, userId));
    
    return results.map(result => result.user);
  }

  async getFollowers(userId: number): Promise<User[]> {
    const results = await db.select({
      user: users
    })
    .from(follows)
    .innerJoin(users, eq(follows.followerId, users.id))
    .where(eq(follows.followingId, userId));
    
    return results.map(result => result.user);
  }

  async getFollowingStreaks(userId: number): Promise<{ user: User; streak: number }[]> {
    // Get all users the current user is following
    const following = await this.getFollowing(userId);
    
    // Get streaks for each following user
    const followingStreaks = await Promise.all(
      following.map(async (user) => {
        const streak = await this.getCurrentStreak(user.id);
        return { user, streak };
      })
    );
    
    // Sort by streak (highest first)
    return followingStreaks.sort((a, b) => b.streak - a.streak);
  }

  // Challenge operations
  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const [challenge] = await db.insert(challenges).values(insertChallenge).returning();
    return challenge;
  }

  async getChallenge(id: number): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
    return challenge;
  }

  async getChallenges(userId: number): Promise<Challenge[]> {
    // Get all public challenges and challenges the user is participating in
    const results = await db.select({
      challenge: challenges,
      isParticipating: sql<boolean>`EXISTS (
        SELECT 1 FROM ${challengeParticipants}
        WHERE ${challengeParticipants.challengeId} = ${challenges.id}
        AND ${challengeParticipants.userId} = ${userId}
      )`
    })
    .from(challenges)
    .where(
      or(
        eq(challenges.isPublic, true),
        eq(challenges.creatorId, userId)
      )
    )
    .orderBy(desc(challenges.createdAt));

    return results.map(result => ({
      ...result.challenge,
      isParticipating: result.isParticipating
    }));
  }

  async getChallengeWithDetails(id: number, userId: number): Promise<ChallengeWithDetails | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
    if (!challenge) return undefined;

    // Get participants
    const participants = await db.select({
      user: users
    })
    .from(challengeParticipants)
    .innerJoin(users, eq(challengeParticipants.userId, users.id))
    .where(eq(challengeParticipants.challengeId, id));

    // Get creator
    const [creator] = await db.select().from(users).where(eq(users.id, challenge.creatorId));

    // Get user's participation status
    const [participation] = await db.select()
      .from(challengeParticipants)
      .where(
        and(
          eq(challengeParticipants.challengeId, id),
          eq(challengeParticipants.userId, userId)
        )
      );

    return {
      ...challenge,
      participants: participants.map(p => p.user),
      creator,
      isParticipating: !!participation,
      progress: participation?.progress || 0
    };
  }

  async getChallengeParticipant(challengeId: number, userId: number): Promise<ChallengeParticipant | undefined> {
    const [participant] = await db.select()
      .from(challengeParticipants)
      .where(
        and(
          eq(challengeParticipants.challengeId, challengeId),
          eq(challengeParticipants.userId, userId)
        )
      );
    return participant;
  }

  async getChallengeParticipantsCount(challengeId: number): Promise<number> {
    const [result] = await db.select({
      count: count()
    }).from(challengeParticipants).where(eq(challengeParticipants.challengeId, challengeId));
    return result?.count || 0;
  }

  async createChallengeParticipant(insertParticipant: InsertChallengeParticipant): Promise<ChallengeParticipant> {
    const [participant] = await db.insert(challengeParticipants).values(insertParticipant).returning();
    return participant;
  }

  async createChallengeUpdate(insertUpdate: InsertChallengeUpdate): Promise<ChallengeUpdate> {
    const [update] = await db.insert(challengeUpdates).values(insertUpdate).returning();
    return update;
  }

  async getChallengeUpdates(challengeId: number): Promise<(ChallengeUpdate & { user: User })[]> {
    const results = await db.select({
      id: challengeUpdates.id,
      challengeId: challengeUpdates.challengeId,
      userId: challengeUpdates.userId,
      content: challengeUpdates.content,
      likes: challengeUpdates.likes,
      createdAt: challengeUpdates.createdAt,
      user: users
    })
    .from(challengeUpdates)
    .innerJoin(users, eq(challengeUpdates.userId, users.id))
    .where(eq(challengeUpdates.challengeId, challengeId))
    .orderBy(desc(challengeUpdates.createdAt));

    return results.map(result => ({
      ...result,
      user: result.user
    }));
  }

  async getSpotlightChallenges(): Promise<Challenge[]> {
    // Get challenges with the most participants in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const results = await db.select({
      challenge: challenges,
      participantsCount: count(challengeParticipants.id)
    })
    .from(challenges)
    .leftJoin(challengeParticipants, eq(challenges.id, challengeParticipants.challengeId))
    .where(
      and(
        eq(challenges.isPublic, true),
        gte(challenges.createdAt, sevenDaysAgo)
      )
    )
    .groupBy(challenges.id)
    .orderBy(desc(sql`participantsCount`))
    .limit(5);

    return results.map(result => result.challenge);
  }
}

export const storage = new DatabaseStorage();