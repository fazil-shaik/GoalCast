import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FeedItemWithUser, FeedFilter } from "@/lib/types";
import { formatTimeAgo } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface FollowingFeedProps {
  filter?: FeedFilter;
  searchTerm?: string;
}

interface StreakUser {
  id: number;
  fullName: string;
  avatarUrl?: string;
  streak: number;
}

export function FollowingFeed({ filter = {}, searchTerm = "" }: FollowingFeedProps) {
  const [commentText, setCommentText] = useState("");
  const [activeFeedItem, setActiveFeedItem] = useState<FeedItemWithUser | null>(null);
  
  // Fetch following feed items
  const followingFeedQuery = useQuery({
    queryKey: ['/api/feed/following', filter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filter.sortBy) queryParams.append('sortBy', filter.sortBy);
      if (filter.timeRange) queryParams.append('timeRange', filter.timeRange);
      if (filter.type) queryParams.append('type', filter.type);
      if (filter.tags?.length) queryParams.append('tags', filter.tags.join(','));
      
      const response = await fetch(`/api/feed/following?${queryParams.toString()}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch following feed');
      }
      
      return response.json();
    }
  });
  
  // Fetch following users with streaks
  const followingUsersQuery = useQuery({
    queryKey: ['/api/users/following/streaks'],
    queryFn: async () => {
      const response = await fetch('/api/users/following/streaks', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch following users with streaks');
      }
      
      return response.json();
    }
  });
  
  const feedItems = followingFeedQuery.data?.feedItems as FeedItemWithUser[] || [];
  const followingUsers = followingFeedQuery.data?.followingUsers || [];
  const streakUsers = followingUsersQuery.data as StreakUser[] || [];
  
  // Filter feed items based on search
  const filteredFeedItems = feedItems.filter(item => 
    item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Like a feed item
  const likeMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: 'like' | 'unlike' }) => {
      const response = await fetch(`/api/feed/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to like post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed/following'] });
    },
  });
  
  // Clap for a feed item
  const clapMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: 'clap' | 'unclap' }) => {
      const response = await fetch(`/api/feed/${id}/clap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to clap for post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed/following'] });
    },
  });
  
  // Heart a feed item
  const heartMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: 'heart' | 'unheart' }) => {
      const response = await fetch(`/api/feed/${id}/heart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to heart post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed/following'] });
    },
  });
  
  // Fire a feed item
  const fireMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: 'fire' | 'unfire' }) => {
      const response = await fetch(`/api/feed/${id}/fire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fire post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed/following'] });
    },
  });
  
  // Add a comment
  const commentMutation = useMutation({
    mutationFn: async ({ feedItemId, content }: { feedItemId: number; content: string }) => {
      const response = await fetch(`/api/feed/${feedItemId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed/following'] });
      setCommentText("");
    },
  });
  
  const handleLike = (feedItem: FeedItemWithUser) => {
    likeMutation.mutate({
      id: feedItem.id,
      action: feedItem.hasLiked ? 'unlike' : 'like',
    });
  };
  
  const handleClap = (feedItem: FeedItemWithUser) => {
    clapMutation.mutate({
      id: feedItem.id,
      action: feedItem.hasClapped ? 'unclap' : 'clap',
    });
  };
  
  const handleHeart = (feedItem: FeedItemWithUser) => {
    heartMutation.mutate({
      id: feedItem.id,
      action: feedItem.hasHearted ? 'unheart' : 'heart',
    });
  };
  
  const handleFire = (feedItem: FeedItemWithUser) => {
    fireMutation.mutate({
      id: feedItem.id,
      action: feedItem.hasFired ? 'unfire' : 'fire',
    });
  };
  
  const handleComment = (feedItem: FeedItemWithUser) => {
    if (!commentText.trim()) return;
    
    commentMutation.mutate({
      feedItemId: feedItem.id,
      content: commentText,
    });
  };
  
  const openCommentDialog = (feedItem: FeedItemWithUser) => {
    setActiveFeedItem(feedItem);
  };
  
  if (followingFeedQuery.isLoading || followingUsersQuery.isLoading) {
    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Following Feed
            </h3>
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        
        <Card>
          <div className="divide-y divide-gray-200">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 sm:px-6">
                <div className="flex space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-3 w-24 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <div className="flex space-x-4">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }
  
  if (followingUsers.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mb-4">
          <i className="ri-user-follow-line text-xl text-primary-600"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Follow people to see their updates</h3>
        <p className="text-gray-500 mb-4">When you follow someone, their goal updates will appear here</p>
        <Button variant="outline">
          Discover People
        </Button>
      </Card>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Following Feed
          </h3>
        </div>
        
        {/* Streak Watch */}
        {streakUsers.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Streak Watch</h4>
            <div className="flex flex-wrap gap-2">
              {streakUsers.map((user: StreakUser) => (
                <div key={user.id} className="flex items-center space-x-2 bg-white rounded-full px-3 py-1 border border-gray-200">
                  <Avatar className="h-6 w-6">
                    <AvatarImage 
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`}
                      alt={user.fullName} 
                    />
                    <AvatarFallback>{user.fullName.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-700">{user.fullName}</span>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {user.streak} day streak
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Card>
        <div className="divide-y divide-gray-200">
          {filteredFeedItems.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No posts found from people you follow.</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your search or encourage your friends to post updates.</p>
            </div>
          ) : (
            filteredFeedItems.map((item) => (
              <div key={item.id} className="p-4 sm:px-6">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <Avatar>
                      <AvatarImage 
                        src={item.user.avatarUrl || `https://ui-avatars.com/api/?name=${item.user.fullName}&background=random`}
                        alt={item.user.fullName} 
                      />
                      <AvatarFallback>{item.user.fullName.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        <a href={`/profile/${item.user.id}`} className="hover:underline">{item.user.fullName}</a>
                      </p>
                      <p className="text-sm text-gray-500">
                        <time dateTime={new Date(item.createdAt).toISOString()}>{formatTimeAgo(item.createdAt)}</time>
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>{item.content}</p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-gray-500 hover:text-gray-600"
                        onClick={() => handleLike(item)}
                        disabled={likeMutation.isPending}
                      >
                        <i className={`${item.hasLiked ? 'ri-heart-filled' : 'ri-heart-line'} text-accent-500 mr-1.5`}></i>
                        <span className={item.hasLiked ? 'font-medium' : ''}>{item.likes}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-gray-500 hover:text-gray-600"
                        onClick={() => handleClap(item)}
                        disabled={clapMutation.isPending}
                      >
                        <i className={`${item.hasClapped ? 'ri-hand-2-fill' : 'ri-hand-2-line'} text-accent-500 mr-1.5`}></i>
                        <span className={item.hasClapped ? 'font-medium' : ''}>{item.claps}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-gray-500 hover:text-gray-600"
                        onClick={() => handleHeart(item)}
                        disabled={heartMutation.isPending}
                      >
                        <i className={`${item.hasHearted ? 'ri-heart-fill' : 'ri-heart-line'} text-pink-500 mr-1.5`}></i>
                        <span className={item.hasHearted ? 'font-medium' : ''}>{item.hearts}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-gray-500 hover:text-gray-600"
                        onClick={() => handleFire(item)}
                        disabled={fireMutation.isPending}
                      >
                        <i className={`${item.hasFired ? 'ri-fire-fill' : 'ri-fire-line'} text-orange-500 mr-1.5`}></i>
                        <span className={item.hasFired ? 'font-medium' : ''}>{item.fires}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-gray-500 hover:text-gray-600"
                        onClick={() => openCommentDialog(item)}
                      >
                        <i className="ri-chat-1-line mr-1.5"></i>
                        {item.commentCount || 0} Comments
                      </Button>
                    </div>
                    
                    {/* Comments section */}
                    {item.comments && item.comments.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {item.comments.slice(0, 2).map((comment) => (
                          <div key={comment.id} className="flex space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage 
                                src={comment.user.avatarUrl || `https://ui-avatars.com/api/?name=${comment.user.fullName}&background=random`}
                                alt={comment.user.fullName} 
                              />
                              <AvatarFallback>{comment.user.fullName.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-gray-50 rounded-lg p-2">
                              <p className="text-xs font-medium text-gray-900">{comment.user.fullName}</p>
                              <p className="text-xs text-gray-700">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                        {item.comments.length > 2 && (
                          <Button variant="link" size="sm" className="text-xs p-0 h-auto">
                            View all {item.comments.length} comments
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {filteredFeedItems.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 text-sm text-center">
            <Button variant="link" className="text-primary-600 hover:text-primary-500 font-medium">
              View more posts
            </Button>
          </div>
        )}
      </Card>
      
      {/* Comment Dialog */}
      <Dialog>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a comment</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Textarea
              placeholder="Write your comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={() => activeFeedItem && handleComment(activeFeedItem)}
                disabled={!commentText.trim() || commentMutation.isPending}
              >
                Post Comment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 