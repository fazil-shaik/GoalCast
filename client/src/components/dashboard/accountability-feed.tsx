import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FeedItemWithUser } from "@/lib/types";
import { formatTimeAgo } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function AccountabilityFeed() {
  const feedQuery = useQuery({
    queryKey: ['/api/feed'],
  });
  
  const feedItems = feedQuery.data as FeedItemWithUser[] || [];
  
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
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
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
  
  if (feedQuery.isLoading) {
    return (
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Accountability Feed
        </h3>
        
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
  
  return (
    <div>
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
        Accountability Feed
      </h3>
      
      <Card>
        <div className="divide-y divide-gray-200">
          {feedItems.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No activity in your feed yet.</p>
              <p className="text-sm text-gray-400 mt-2">Start following people or completing goals to see updates here.</p>
            </div>
          ) : (
            feedItems.map((item) => (
              <div key={item.id} className="p-4 sm:px-6">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <img 
                      className="h-10 w-10 rounded-full" 
                      src={item.user.avatarUrl || `https://ui-avatars.com/api/?name=${item.user.fullName}&background=random`}
                      alt={item.user.fullName} 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      <a href="#" className="hover:underline">{item.user.fullName}</a>
                    </p>
                    <p className="text-sm text-gray-500">
                      <a href="#" className="hover:underline">
                        <time dateTime={new Date(item.createdAt).toISOString()}>{formatTimeAgo(item.createdAt)}</time>
                      </a>
                    </p>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>{item.content}</p>
                    </div>
                    <div className="mt-2 flex space-x-4">
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
                        <span className={item.hasClapped ? 'font-medium' : ''}>{item.claps} Claps</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {feedItems.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 text-sm text-center">
            <Button variant="link" className="text-primary-600 hover:text-primary-500 font-medium">
              View more updates
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
