import { useContext } from "react";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/lib/auth-context";
import { Twitter, Linkedin } from "lucide-react";
import { shareToTwitter, shareToLinkedIn } from "@/lib/social-share";

interface SocialSharePreviewProps {
  content: string;
}

export function SocialSharePreview({ content }: SocialSharePreviewProps) {
  const { user } = useContext(AuthContext);
  
  const handleTwitterShare = () => {
    shareToTwitter(content, ["BuildInPublic", "GoalCast"]);
  };
  
  const handleLinkedInShare = () => {
    const title = "Goal Progress Update";
    // Pass content as both title and summary to ensure it appears in the LinkedIn post
    shareToLinkedIn(title, content, window.location.href);
  };
  
  return (
    <div className="border border-gray-200 rounded-md p-3 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <img 
            className="h-10 w-10 rounded-full"
            src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=random`}
            alt={user?.fullName || 'User profile'}
          />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {user?.fullName || 'User'} <span className="text-gray-500 dark:text-gray-400">@{user?.username || 'username'}</span>
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {content}
          </p>
          <div className="mt-2 flex items-center space-x-4 text-xs">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={handleTwitterShare}
            >
              <Twitter className="h-4 w-4 mr-1" /> Share on Twitter
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-blue-700 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
              onClick={handleLinkedInShare}
            >
              <Linkedin className="h-4 w-4 mr-1" /> Share on LinkedIn
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
