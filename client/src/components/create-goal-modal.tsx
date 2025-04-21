import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InsertGoal } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";
import { Twitter, Linkedin, Share2 } from "lucide-react";
import { 
  generateGoalUpdateContent, 
  connectSocialAccount, 
  isSocialAccountConnected,
  shareToTwitter,
  shareToLinkedIn
} from "@/lib/social-share";

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGoalModal({ isOpen, onClose }: CreateGoalModalProps) {
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalType, setGoalType] = useState<"one-time" | "recurring" | "challenge">("one-time");
  const [duration, setDuration] = useState("30");
  const [durationUnit, setDurationUnit] = useState("days");
  const [category, setCategory] = useState("general");
  const [visibility, setVisibility] = useState("public");
  const [twitterShare, setTwitterShare] = useState(false);
  const [linkedinShare, setLinkedinShare] = useState(false);
  const [bioUpdate, setBioUpdate] = useState(false);
  const [reminderFrequency, setReminderFrequency] = useState("daily");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: Partial<InsertGoal>) => {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create goal');
      }
      
      return response.json();
    },
    onSuccess: () => {
      resetForm();
      onClose();
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/goals/active'] });
      
      toast({
        title: "Goal created!",
        description: "Your new goal has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating goal",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setGoalType("one-time");
    setDuration("30");
    setDurationUnit("days");
    setCategory("general");
    setVisibility("public");
    setTwitterShare(false);
    setLinkedinShare(false);
    setBioUpdate(false);
    setReminderFrequency("daily");
    setTags([]);
    setTagInput("");
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your goal",
        variant: "destructive",
      });
      return;
    }
    
    createGoalMutation.mutate({
      title,
      description,
      type: goalType,
      duration: parseInt(duration),
      durationUnit,
      category,
      visibility,
      twitterShare,
      linkedinShare,
      bioUpdate,
      reminderFrequency,
      tags,
    });
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[600px] lg:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-4 sm:px-6">
          <DialogTitle className="text-xl sm:text-2xl">Create New Goal</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Set up your new goal and start tracking your progress.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="px-4 sm:px-6">
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="goal-title" className="text-sm sm:text-base">Goal Title</Label>
              <Input
                id="goal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Launch MVP, Learn Spanish"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goal-description">Description</Label>
              <Textarea
                id="goal-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your goal in more detail (optional)"
                className="resize-none h-20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goal-type">Goal Type</Label>
              <Select 
                value={goalType} 
                onValueChange={(value) => setGoalType(value as typeof goalType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select goal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">One-time goal</SelectItem>
                  <SelectItem value="recurring">Recurring goal</SelectItem>
                  <SelectItem value="challenge">Challenge</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goal-duration">Duration</Label>
              <div className="flex space-x-2">
                <Input
                  id="goal-duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-20"
                />
                <Select 
                  value={durationUnit} 
                  onValueChange={setDurationUnit}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">days</SelectItem>
                    <SelectItem value="weeks">weeks</SelectItem>
                    <SelectItem value="months">months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:space-x-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="goal-category" className="text-sm sm:text-base">Category</Label>
                <Select 
                  value={category} 
                  onValueChange={setCategory}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="health">Health & Fitness</SelectItem>
                    <SelectItem value="career">Career & Business</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="personal">Personal Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 flex-1 mt-4 sm:mt-0">
                <Label htmlFor="goal-visibility" className="text-sm sm:text-base">Visibility</Label>
                <Select 
                  value={visibility} 
                  onValueChange={setVisibility}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="connections">Connections Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Social Sharing</Label>
              <div className="rounded-lg border border-gray-200 p-4 space-y-4 mt-2 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="twitter-share" 
                    checked={twitterShare}
                    onCheckedChange={(checked) => setTwitterShare(!!checked)}
                  />
                  <div className="flex items-center">
                    <Twitter className="h-4 w-4 text-blue-400 mr-2" />
                    <Label htmlFor="twitter-share" className="font-normal">
                      Share updates to Twitter
                    </Label>
                  </div>
                  {twitterShare && !isSocialAccountConnected("twitter") && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="ml-auto text-xs h-7 px-2"
                      onClick={() => connectSocialAccount("twitter")}
                    >
                      Connect
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="linkedin-share" 
                    checked={linkedinShare}
                    onCheckedChange={(checked) => setLinkedinShare(!!checked)}
                  />
                  <div className="flex items-center">
                    <Linkedin className="h-4 w-4 text-blue-700 mr-2" />
                    <Label htmlFor="linkedin-share" className="font-normal">
                      Share updates to LinkedIn
                    </Label>
                  </div>
                  {linkedinShare && !isSocialAccountConnected("linkedin") && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="ml-auto text-xs h-7 px-2"
                      onClick={() => connectSocialAccount("linkedin")}
                    >
                      Connect
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="bio-update" 
                    checked={bioUpdate}
                    onCheckedChange={(checked) => setBioUpdate(!!checked)}
                  />
                  <div className="flex items-center">
                    <Share2 className="h-4 w-4 text-gray-600 dark:text-gray-300 mr-2" />
                    <Label htmlFor="bio-update" className="font-normal">
                      Update bio with progress
                    </Label>
                  </div>
                </div>
                
                {(twitterShare || linkedinShare) && (
                  <div className="mt-3 bg-white dark:bg-gray-700 rounded-md p-3 border border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Example post when checking in:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {generateGoalUpdateContent(title || "your goal", "Day 1/30", "")}
                    </p>
                    <div className="flex mt-2 space-x-2">
                      {twitterShare && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs flex items-center text-blue-500"
                          onClick={() => shareToTwitter(generateGoalUpdateContent(title || "your goal", "Day 0/30", "Making progress on my launch MVP!"), ["BuildInPublic", "GoalCast"])}
                        >
                          <Twitter className="h-3 w-3 mr-1" /> Preview Tweet
                        </Button>
                      )}
                      {linkedinShare && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs flex items-center text-blue-700"
                          onClick={() => shareToLinkedIn("Goal Progress Update", generateGoalUpdateContent(title || "your goal", "Day 0/30", "Making progress on my launch MVP!"), window.location.href)}
                        >
                          <Linkedin className="h-3 w-3 mr-1" /> Preview LinkedIn
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Reminder Frequency</Label>
              <RadioGroup 
                value={reminderFrequency} 
                onValueChange={setReminderFrequency}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="reminder-daily" />
                  <Label htmlFor="reminder-daily" className="font-normal">Daily</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="reminder-weekly" />
                  <Label htmlFor="reminder-weekly" className="font-normal">Weekly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="reminder-none" />
                  <Label htmlFor="reminder-none" className="font-normal">No reminders</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-tags">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <div key={tag} className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm flex items-center">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  id="goal-tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags (e.g., fitness, work)"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-4 sm:mt-6 px-4 sm:px-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={createGoalMutation.isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createGoalMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
