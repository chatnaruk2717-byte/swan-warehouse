import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for all API routes
app.use('/*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Health check endpoint
app.get('/', (c) => {
  return c.text('Warehouse Serverless API is running!');
});

// GET /api/products - Get all products from D1
app.get('/api/products', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM products ORDER BY id DESC"
    ).all();
    return c.json(results);
  } catch (err: any) {
    console.error('Database query error:', err);
    return c.json({ error: err.message || 'Database query failed' }, 500);
  }
});

// POST /api/products - Create a new product in D1
app.post('/api/products', async (c) => {
  try {
    const body = await c.req.json();
    const { name, price, quantity } = body;

    if (!name || price === undefined || quantity === undefined) {
      return c.json({ error: 'Missing required fields: name, price, quantity' }, 400);
    }

    const numPrice = parseFloat(price);
    const numQuantity = parseInt(quantity, 10);

    if (isNaN(numPrice) || isNaN(numQuantity)) {
      return c.json({ error: 'Price and quantity must be valid numbers' }, 400);
    }

    const result = await c.env.DB.prepare(
      "INSERT INTO products (name, price, quantity) VALUES (?, ?, ?) RETURNING *"
    ).bind(name, numPrice, numQuantity).first();

    return c.json(result, 201);
  } catch (err: any) {
    console.error('Database insert error:', err);
    return c.json({ error: err.message || 'Database insert failed' }, 500);
  }
});

export default app;
