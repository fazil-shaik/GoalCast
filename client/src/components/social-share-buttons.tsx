import { Button } from "@/components/ui/button";
import { Twitter, Linkedin, Share } from "lucide-react";
import { shareToTwitter, shareToLinkedIn, connectSocialAccount, isSocialAccountConnected } from "@/lib/social-share";
import { useState } from "react";

interface SocialShareButtonsProps {
  content: string;
  title?: string;
  summary?: string;
  url?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  showConnect?: boolean;
}

export function SocialShareButtons({
  content,
  title = "My Goal Update",
  summary = "",
  url,
  className = "",
  size = "default",
  showConnect = true,
}: SocialShareButtonsProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  const handleTwitterShare = () => {
    shareToTwitter(content);
  };
  
  const handleLinkedInShare = () => {
    shareToLinkedIn(title, summary || content, url);
  };
  
  const handleConnectTwitter = () => {
    connectSocialAccount("twitter");
  };
  
  const handleConnectLinkedIn = () => {
    connectSocialAccount("linkedin");
  };
  
  const isTwitterConnected = isSocialAccountConnected("twitter");
  const isLinkedInConnected = isSocialAccountConnected("linkedin");
  
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size={size} 
          className="flex items-center gap-2 text-blue-500 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
          onClick={handleTwitterShare}
        >
          <Twitter className="h-4 w-4" />
          <span>Twitter</span>
        </Button>
        
        <Button 
          variant="outline" 
          size={size} 
          className="flex items-center gap-2 text-blue-700 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
          onClick={handleLinkedInShare}
        >
          <Linkedin className="h-4 w-4" />
          <span>LinkedIn</span>
        </Button>
        
        <Button 
          variant="outline" 
          size={size} 
          className="flex items-center gap-2"
          onClick={() => setShowShareMenu(!showShareMenu)}
        >
          <Share className="h-4 w-4" />
          <span>More</span>
        </Button>
      </div>
      
      {showShareMenu && (
        <div className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="text-sm font-medium mb-1">Copy this link to share:</div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={url || window.location.href} 
              readOnly 
              className="flex-1 bg-white dark:bg-gray-700 px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600" 
            />
            <Button 
              size="sm" 
              onClick={() => navigator.clipboard.writeText(url || window.location.href)}
            >
              Copy
            </Button>
          </div>
        </div>
      )}
      
      {showConnect && !isTwitterConnected && !isLinkedInConnected && (
        <div className="mt-2 flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="text-sm font-medium mb-1">Connect accounts for auto-sharing:</div>
          <div className="flex gap-2">
            {!isTwitterConnected && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 text-blue-500"
                onClick={handleConnectTwitter}
              >
                <Twitter className="h-4 w-4" />
                <span>Connect Twitter</span>
              </Button>
            )}
            
            {!isLinkedInConnected && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 text-blue-700"
                onClick={handleConnectLinkedIn}
              >
                <Linkedin className="h-4 w-4" />
                <span>Connect LinkedIn</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}