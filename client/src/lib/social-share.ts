// Social media sharing service

/**
 * Share content to Twitter
 * @param text The text to share (limited to 280 characters)
 * @param hashtags Optional array of hashtags to append to the tweet
 */
export const shareToTwitter = (text: string, hashtags: string[] = []): void => {
  console.log("Sharing to twitter:", text);
  
  // Trim text to 280 characters if needed
  const trimmedText = text.length > 280 ? text.substring(0, 277) + '...' : text;
  
  // Format hashtags
  const formattedHashtags = hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ');
  
  // Construct the tweet text with hashtags
  const tweetText = `${trimmedText} ${formattedHashtags}`.trim();
  
  // Create the Twitter share URL
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
  
  // Open the Twitter share dialog in a new window
  window.open(twitterUrl, '_blank', 'width=550,height=420');
};

/**
 * Share content to LinkedIn
 * @param title The post title
 * @param summary The post summary/content
 * @param url Optional URL to share (defaults to current page)
 */
export const shareToLinkedIn = (title: string, summary: string, url?: string): void => {
  console.log("Sharing to linkedin:", summary);
  
  // Use current URL if none provided
  const shareUrl = url || window.location.href;
  
  // LinkedIn needs both a title and summary to properly display text
  // If summary is empty, use title as summary
  const shareTitle = title || "Goal Progress Update";
  const shareSummary = summary || title;
  
  // Create the LinkedIn share URL
  const linkedInUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}&summary=${encodeURIComponent(shareSummary)}`;
  
  // Open the LinkedIn share dialog in a new window
  window.open(linkedInUrl, '_blank', 'width=550,height=420');
};

/**
 * Generate social share content for a goal update
 * @param goalTitle Title of the goal
 * @param progress Progress information (e.g., "Day 5/30")
 * @param message Optional additional message
 */
export const generateGoalUpdateContent = (
  goalTitle: string, 
  progress: string, 
  message?: string
): string => {
  const baseContent = `${progress}: ${goalTitle}`;
  const fullContent = message ? `${baseContent}\n${message}` : baseContent;
  return fullContent + " 🚀 #BuildInPublic #GoalCast";
};

/**
 * Update bio on social media platforms
 * Currently a mock implementation
 */
export const updateSocialBio = async (
  platforms: ("twitter" | "linkedin")[],
  bioText: string
): Promise<{success: boolean, message: string}> => {
  console.log(`Updating bio on ${platforms.join(", ")} to: ${bioText}`);
  
  // Mock implementation - in a real app, this would call the API
  // to update the bio on the specified platforms
  return {
    success: true,
    message: `Successfully updated bio on ${platforms.length} platform(s)`
  };
};

/**
 * Check if social account is connected
 * @param platform The social media platform to check
 */
export const isSocialAccountConnected = (platform: "twitter" | "linkedin"): boolean => {
  // This is a mock implementation
  // In a real app, this would check if the user has connected their account
  return false;
};

/**
 * Connect social account
 * @param platform The social media platform to connect
 */
export const connectSocialAccount = (platform: "twitter" | "linkedin"): void => {
  console.log(`Connecting ${platform} account`);
  
  // This is a mock implementation
  // In a real app, this would initiate the OAuth flow to connect the account
  alert(`To connect your ${platform} account, you would be redirected to ${platform} for authorization.`);
};