// Import the schema from the shared directory
import * as sharedSchema from '../shared/schema.js';

// Re-export the schema
export const schema = sharedSchema;
export const { insertUserSchema, insertGoalSchema, insertCheckInSchema } = sharedSchema; 