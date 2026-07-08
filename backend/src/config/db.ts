import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { initializeMySQL } from './mysqlInit';

dotenv.config();

let pool: mysql.Pool | null = null;
let useMock = false;

if (process.env.USE_MOCK_DB === 'true') {
  console.log('Database configured to run in Mock Mode.');
  useMock = true;
} else {
  try {
    const connectionString = process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/warehouse_db';
    pool = mysql.createPool({
      uri: connectionString,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    // Test the database connection and initialize tables
    pool.query('SELECT 1')
      .then(async () => {
        console.log('Successfully connected to MySQL database.');
        try {
          await initializeMySQL(pool!);
          console.log('MySQL database tables checked/initialized.');
        } catch (err: any) {
          console.error('MySQL table initialization failed:', err.message);
        }
      })
      .catch((err) => {
        console.warn('MySQL connection failed. Falling back to Mock Database Mode. Error:', err.message);
        useMock = true;
      });
  } catch (err: any) {
    console.warn('Failed to initialize MySQL pool. Falling back to Mock Mode. Error:', err.message);
    useMock = true;
  }
}

export const query = async (text: string, params?: any[]) => {
  if (useMock || !pool) {
    throw new Error('MOCK_MODE');
  }

  // 1. Check if the query is a mutating statement and contains a RETURNING clause
  const isInsert = text.trim().toUpperCase().startsWith('INSERT');
  const isUpdate = text.trim().toUpperCase().startsWith('UPDATE');
  const isDelete = text.trim().toUpperCase().startsWith('DELETE');
  const hasReturning = /RETURNING\s+/i.test(text);

  // Parse PG-style $1, $2, ... placeholders in order of appearance
  const matches = text.match(/\$\d+/g) || [];
  const finalParams: any[] = [];
  const origParams = params || [];

  if (origParams.length > 0) {
    for (const match of matches) {
      const paramIndex = parseInt(match.slice(1), 10) - 1;
      finalParams.push(origParams[paramIndex]);
    }
  }

  const formattedText = text.replace(/\$\d+/g, '?');

  if (hasReturning) {
    // Extract table name
    let tableName = '';
    const tableMatch = text.match(/(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+(\w+)/i);
    if (tableMatch) {
      tableName = tableMatch[1];
    }

    if (isInsert) {
      // Stripped query without RETURNING
      const strippedQuery = text.replace(/RETURNING\s+[\s\S]+/i, '').replace(/\$\d+/g, '?');
      const [resHeader] = await pool.query(strippedQuery, finalParams);
      const insertId = (resHeader as any).insertId;
      
      // If we got an insert ID, query the row to return it
      if (insertId) {
        const [rows] = await pool.query(`SELECT * FROM ${tableName} WHERE id = ?`, [insertId]);
        return { rows: rows as any[] };
      }
      
      return { rows: [] };

    } else if (isUpdate || isDelete) {
      // Find the WHERE clause and extract its parameters
      const whereMatch = text.match(/WHERE\s+([\s\S]+?)(?:\s+RETURNING|$)/i);
      if (whereMatch) {
        const whereClause = whereMatch[1];
        
        // Match all postgres placeholders like $1, $2 inside the WHERE clause
        const placeholders = whereClause.match(/\$\d+/g);
        const mappedParams = placeholders 
          ? placeholders.map(p => origParams[parseInt(p.slice(1), 10) - 1]) 
          : [];
          
        const selectWhere = whereClause.replace(/\$\d+/g, '?');
        const selectQuery = `SELECT * FROM ${tableName} WHERE ${selectWhere}`;
        
        // Pre-fetch the rows
        const [preFetchedRows] = await pool.query(selectQuery, mappedParams);
        
        // Execute the actual UPDATE or DELETE
        const strippedQuery = text.replace(/RETURNING\s+[\s\S]+/i, '').replace(/\$\d+/g, '?');
        await pool.query(strippedQuery, finalParams);
        
        return { rows: preFetchedRows as any[] };
      }
    }
  }

  // Standard query execution (no RETURNING clause)
  const [rows] = await pool.query(formattedText, finalParams);
  
  // Return wrapper matching PG pool response format
  return { rows: Array.isArray(rows) ? (rows as any[]) : [] };
};

export const getMockStatus = () => useMock;
export const setMockStatus = (status: boolean) => { useMock = status; };

export { pool };
export * as mockStore from './mockData';
