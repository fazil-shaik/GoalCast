import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function addResetTokenColumns() {
  try {
    console.log('Adding reset_token and reset_token_expiry columns to users table...');
    
    // Check if columns already exist
    const checkColumnsQuery = sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('reset_token', 'reset_token_expiry')
    `;
    
    const existingColumns = await db.execute(checkColumnsQuery);
    
    // Check if any columns were found
    if (existingColumns.rows.length === 0) {
      // Add reset_token column
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS reset_token TEXT
      `);
      
      // Add reset_token_expiry column
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP
      `);
      
      console.log('Successfully added reset_token and reset_token_expiry columns to users table');
    } else {
      console.log('Reset token columns already exist in users table');
    }
    
    return true;
  } catch (error) {
    console.error('Error adding reset token columns:', error);
    return false;
  }
} 