import { Goal, CheckIn, FeedItem, User, Comment, Challenge, ChallengeParticipant, ChallengeUpdate } from "@shared/schema";

export type { User };

export interface GoalWithProgress extends Omit<Goal, 'status'> {
  checkIns: CheckIn[];
  progress: number; // 0-100
  daysCompleted: number;
  totalDays: number;
  status: "On Schedule" | "Catching Up" | "At Risk";
  streak: number;
  weeklyProgress: boolean[];
  originalStatus: Goal['status']; // Preserve the original status
}

export interface FeedItemWithUser extends FeedItem {
  user: User;
  hasLiked?: boolean;
  hasClapped?: boolean;
  hasHearted?: boolean;
  hasFired?: boolean;
  comments?: CommentWithUser[];
  commentCount?: number;
}

export interface CommentWithUser extends Comment {
  user: User;
  hasLiked?: boolean;
}

export interface ChallengeWithDetails extends Challenge {
  creator: User;
  participants: (ChallengeParticipant & { user: User })[];
  participantCount: number;
  isJoined?: boolean;
  userProgress?: number;
  type: "one-time" | "recurring";
  isParticipating: boolean;
}

export interface ChallengeUpdateWithUser extends ChallengeUpdate {
  user: User;
  hasLiked?: boolean;
}

export interface DashboardStats {
  activeGoals: {
    count: number;
    limit: number;
  };
  currentStreak: {
    days: number;
    isLongest: boolean;
  };
  socialEngagement: {
    count: number;
    percentChange: number;
  };
  checkInRate: {
    percentage: number;
    status: "On track" | "Falling behind" | "At risk";
  };
}

export interface FeedFilter {
  type?: string;
  tags?: string[];
  sortBy?: 'latest' | 'trending';
  timeRange?: 'today' | 'week' | 'month' | 'all';
}

export interface SpotlightUser {
  user: User;
  streak: number;
  completedGoals: number;
  totalGoals: number;
  checkInRate: number;
  isBuilderOfTheWeek?: boolean;
}
