import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/lib/websocket";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { User } from "@shared/schema";

export function DiscoverPeople() {
  const [searchTerm, setSearchTerm] = useState("");
  const { onlineUsers } = useWebSocket();

  // Fetch all users
  const usersQuery = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      return response.json();
    }
  });

  const users = usersQuery.data as User[] || [];

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (usersQuery.isLoading) {
    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Discover People
            </h3>
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-10 w-full mb-4" />
        </div>
        
        <Card>
          <div className="divide-y divide-gray-200">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 sm:px-6">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20" />
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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Discover People
          </h3>
          <Badge variant="secondary" className="text-sm">
            {onlineUsers.length} online
          </Badge>
        </div>
        
        <Input
          type="text"
          placeholder="Search people..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      
      <Card>
        <div className="divide-y divide-gray-200">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-4 sm:px-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
                  <AvatarFallback>
                    {user.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.fullName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    @{user.username}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {onlineUsers.includes(user.id) && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      Online
                    </Badge>
                  )}
                  <Button variant="outline" size="sm">
                    Follow
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredUsers.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No people found matching your search.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 