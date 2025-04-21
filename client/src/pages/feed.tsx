import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CommunityFeed } from "@/components/feed/community-feed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChallengeList } from "../components/feed/challenge-list";
import { SpotlightSection } from "../components/feed/spotlight-section";
import { FollowingFeed } from "../components/feed/following-feed";
import { DiscoverPeople } from "../components/feed/discover-people";
import { FeedFilter } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

export default function Feed() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filter, setFilter] = useState<FeedFilter>({
    sortBy: 'latest',
    timeRange: 'all'
  });
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch challenges data
  const challengesQuery = useQuery({
    queryKey: ['/api/challenges'],
  });
  
  // Fetch online users
  const onlineUsersQuery = useQuery({
    queryKey: ['/api/users/online'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  // Fetch search results when search term changes
  const searchQuery = useQuery({
    queryKey: ['/api/users/search', searchTerm],
    enabled: searchTerm.length > 0,
    staleTime: 60000, // Cache for 1 minute
  });
  
  const challenges = (challengesQuery.data as any[]) || [];
  const onlineUsers = Array.isArray(onlineUsersQuery.data) ? onlineUsersQuery.data as User[] : [];
  const searchResults = (searchQuery.data as User[]) || [];
  
  // Follow user mutation
  const followMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to follow user');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/online'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/search'] });
    },
  });
  
  // Handle filter changes
  const handleFilterChange = (key: keyof FeedFilter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle follow user
  const handleFollowUser = (userId: number) => {
    followMutation.mutate(userId);
  };
  
  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Community Feed
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Connect with others, share your progress, and join challenges
        </p>
      </div>
      
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search challenges, people, and goals..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select 
              value={filter.sortBy} 
              onValueChange={(value) => handleFilterChange('sortBy', value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={filter.timeRange} 
              onValueChange={(value) => handleFilterChange('timeRange', value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <i className="ri-filter-3-line mr-1"></i>
              More Filters
            </Button>
          </div>
        </div>
      </div>
      
      {/* Search Results */}
      {searchTerm.length > 0 && (
        <Card className="mb-6 p-4">
          <h3 className="text-lg font-semibold mb-4">Search Results</h3>
          {searchQuery.isLoading ? (
            <div className="text-sm text-gray-500">Searching...</div>
          ) : searchResults.length === 0 ? (
            <div className="text-sm text-gray-500">No results found</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.map((result) => (
                <div key={result.id} className="flex items-center space-x-3 p-2 border rounded-md">
                  <Avatar>
                    <AvatarImage 
                      src={result.avatarUrl || `https://ui-avatars.com/api/?name=${result.fullName}&background=random`}
                      alt={result.fullName} 
                    />
                    <AvatarFallback>{result.fullName.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{result.fullName}</p>
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-1 ${onlineUsers.some(u => u.id === result.id) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-xs text-gray-500">{onlineUsers.some(u => u.id === result.id) ? 'Online' : 'Offline'}</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-1 w-full"
                      onClick={() => handleFollowUser(result.id)}
                      disabled={followMutation.isPending}
                    >
                      Follow
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
      
      {/* Online Users */}
      <Card className="mb-6 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Online Now</h3>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {onlineUsers.length} online
          </Badge>
        </div>
        {onlineUsersQuery.isLoading ? (
          <div className="text-sm text-gray-500">Loading online users...</div>
        ) : onlineUsers.length === 0 ? (
          <div className="text-sm text-gray-500">No users online</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {onlineUsers.map((onlineUser) => (
              <div key={onlineUser.id} className="flex items-center space-x-2 bg-white rounded-full px-3 py-1 border border-gray-200">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <Avatar className="h-6 w-6">
                  <AvatarImage 
                    src={onlineUser.avatarUrl || `https://ui-avatars.com/api/?name=${onlineUser.fullName}&background=random`}
                    alt={onlineUser.fullName} 
                  />
                  <AvatarFallback>{onlineUser.fullName.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-700">{onlineUser.fullName}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">
            All Activities
            <Badge variant="secondary" className="ml-2">New</Badge>
          </TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="discover">
            Discover People
            <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">New</Badge>
          </TabsTrigger>
          <TabsTrigger value="challenges">
            Challenges
            {challenges.length > 0 && (
              <Badge variant="secondary" className="ml-2">{challenges.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="spotlight">Spotlight</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CommunityFeed filter={filter} searchTerm={searchTerm} />
            </div>
            <div>
              <SpotlightSection />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="following">
          <FollowingFeed filter={filter} searchTerm={searchTerm} />
        </TabsContent>
        
        <TabsContent value="discover">
          <DiscoverPeople />
        </TabsContent>
        
        <TabsContent value="challenges">
          <ChallengeList searchTerm={searchTerm} />
        </TabsContent>
        
        <TabsContent value="spotlight">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SpotlightSection fullWidth />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
