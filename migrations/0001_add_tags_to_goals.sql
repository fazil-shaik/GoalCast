-- Add tags column to goals table
ALTER TABLE goals ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}' NOT NULL; 