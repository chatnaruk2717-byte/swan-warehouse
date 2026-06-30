-- Drop table if exists (for re-initialization)
DROP TABLE IF EXISTS products;

-- Create products table
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed some initial sample products
INSERT INTO products (name, price, quantity) VALUES 
('Pallet Wrap Film (ฟิล์มยืดพันพาเลท)', 120.0, 50),
('Barcode Scanner Symbol LS2208', 3500.0, 15),
('Heavy Duty Safety Gloves (ถุงมือเซฟตี้)', 85.0, 120),
('Packing Tape 2-inch (เทปกาวปิดกล่อง)', 25.0, 300);
