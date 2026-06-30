import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;
let useMock = false;

if (process.env.USE_MOCK_DB === 'true') {
  console.log('Database configured to run in Mock Mode.');
  useMock = true;
} else {
  try {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/warehouse_db';
    pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 2000
    });
    
    // Test the database connection
    pool.query('SELECT NOW()')
      .then(() => {
        console.log('Successfully connected to PostgreSQL database.');
      })
      .catch((err) => {
        console.warn('PostgreSQL connection failed. Falling back to Mock Database Mode. Error:', err.message);
        useMock = true;
      });
  } catch (err: any) {
    console.warn('Failed to initialize PostgreSQL pool. Falling back to Mock Mode. Error:', err.message);
    useMock = true;
  }
}

export const query = async (text: string, params?: any[]) => {
  if (useMock || !pool) {
    throw new Error('MOCK_MODE');
  }
  return pool.query(text, params);
};

export const getMockStatus = () => useMock;
export const setMockStatus = (status: boolean) => { useMock = status; };

export { pool };
export * as mockStore from './mockData';
