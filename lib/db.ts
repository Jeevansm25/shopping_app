import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import mysql from 'mysql2/promise'
import fs from 'fs/promises'
import path from 'path'

// Configure Neon with retries and timeouts
neonConfig.fetchConnectionCache = true;
neonConfig.retryOptions = {
  retries: 3,
  retryDelay: 1000, // 1 second between retries
};
neonConfig.connectionTimeoutMillis = 10000; // 10 seconds

// Initialize the Neon SQL client
const sql = neon(process.env.DATABASE_URL!);

// Initialize Drizzle ORM with the configured client
export const db = drizzle(sql);

// Helper function to execute SQL queries safely with retries
export async function executeQuery(query: string, params: any[] = []): Promise<Record<string, any>[]> {
  try {
    console.log(`Executing query: ${query} with params:`, params);

    // Execute query with parameterized values
    const result = await sql.query(query, params);
    return result as Record<string, any>[];
  } catch (error) {
    console.error("Database query error:", error);
    
    // Check if error is due to connection issues
    if (error instanceof Error && error.message.includes('fetch failed')) {
      console.log('Attempting to reconnect...');
      // Clear connection cache and retry once
      neonConfig.fetchConnectionCache = false;
      try {
        const retryResult = await sql.query(query, params);
        neonConfig.fetchConnectionCache = true;
        return retryResult as Record<string, any>[];
      } catch (retryError) {
        console.error("Retry failed:", retryError);
        throw retryError;
      }
    }
    
    throw error;
  }
}

export async function runMigrations() {
  const pool = await getPool()
  const conn = await pool.getConnection()

  try {
    // Create migrations table if it doesn't exist
    await conn.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Get list of executed migrations
    const [rows] = await conn.query('SELECT name FROM migrations')
    const executedMigrations = new Set((rows as any[]).map(row => row.name))

    // Read migration files
    const migrationsDir = path.join(process.cwd(), 'migrations')
    const files = await fs.readdir(migrationsDir)
    const migrationFiles = files.filter(f => f.endsWith('.sql')).sort()

    // Execute new migrations
    for (const file of migrationFiles) {
      if (!executedMigrations.has(file)) {
        const filePath = path.join(migrationsDir, file)
        const sql = await fs.readFile(filePath, 'utf8')
        
        await conn.query(sql)
        await conn.query('INSERT INTO migrations (name) VALUES (?)', [file])
        
        console.log(`Executed migration: ${file}`)
      }
    }
  } catch (error) {
    console.error('Error running migrations:', error)
    throw error
  } finally {
    conn.release()
  }
}

// Export configured sql client
export { sql };
