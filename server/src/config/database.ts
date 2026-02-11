import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dbDir, 'carassauga.db');

// Create SQLite database connection
export const db = new Database(dbPath, {
  verbose: process.env.NODE_ENV === 'development' ? undefined : undefined,
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');

console.log(`✅ SQLite database connected: ${dbPath}`);

// PostgreSQL-compatible query wrapper for SQLite
export const query = async (text: string, params: any[] = []) => {
  try {
    // Convert PostgreSQL $ placeholders to ? placeholders
    let sqliteQuery = text;
    let sqliteParams = params;
    
    // Replace $1, $2, etc. with ?
    if (params && params.length > 0) {
      for (let i = params.length; i >= 1; i--) {
        sqliteQuery = sqliteQuery.replace(new RegExp(`\\$${i}`, 'g'), '?');
      }
    }
    
    // Replace PostgreSQL-specific functions
    sqliteQuery = sqliteQuery.replace(/NOW\(\)/gi, "CURRENT_TIMESTAMP");
    sqliteQuery = sqliteQuery.replace(/RETURNING/gi, "RETURNING");
    
    // Check if it's a SELECT query
    const isSelect = sqliteQuery.trim().toUpperCase().startsWith('SELECT');
    const isReturning = sqliteQuery.toUpperCase().includes('RETURNING');
    
    if (isSelect) {
      // SELECT query
      const rows = db.prepare(sqliteQuery).all(...sqliteParams);
      return {
        rows,
        rowCount: rows.length,
      };
    } else if (isReturning) {
      // INSERT/UPDATE with RETURNING
      const result = db.prepare(sqliteQuery).get(...sqliteParams);
      return {
        rows: result ? [result] : [],
        rowCount: result ? 1 : 0,
      };
    } else {
      // INSERT/UPDATE/DELETE without RETURNING
      const result = db.prepare(sqliteQuery).run(...sqliteParams);
      return {
        rows: [],
        rowCount: result.changes,
      };
    }
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  }
};

// Mock pool object for compatibility
export const pool = {
  query,
  on: () => {},
  connect: async () => ({
    query,
    release: () => {},
  }),
};

export const getClient = async () => ({
  query,
  release: () => {},
});

export default db;
