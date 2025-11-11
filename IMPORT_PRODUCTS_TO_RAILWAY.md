# Import Products to Railway MySQL

## Quick Steps

### 1. Get Your Products Data

**Option A: From Local MySQL**
```bash
# Connect to local MySQL
mysql -u root -p buygreen_db

# Run export script
source EXPORT_PRODUCTS_SCRIPT.sql

# Copy the INSERT statements
```

**Option B: Use Admin Dashboard**
- Go to your local site (localhost)
- Log in as admin
- Go to Admin Dashboard
- View products and manually note down:
  - Name
  - Description
  - Price
  - Stock Quantity
  - Category
  - Image URLs

### 2. Connect to Railway MySQL

**Get Connection Details:**
1. Railway Dashboard → MySQL service → "Variables" tab
2. Note down:
   - `MYSQLHOST` (e.g., `interchange.proxy.rlwy.net`)
   - `MYSQLPORT` (e.g., `55721`)
   - `MYSQLDATABASE` (usually `railway`)
   - `MYSQLUSER` (usually `root`)
   - `MYSQLPASSWORD` (click to reveal)

**Connect via Command Line:**
```bash
mysql -h [MYSQLHOST] -P [MYSQLPORT] -u [MYSQLUSER] -p [MYSQLDATABASE]
```

**OR Use Railway Web Interface:**
1. Railway Dashboard → MySQL service → "Data" tab
2. Click "Query" or use the SQL editor

### 3. Insert Products

**Example INSERT statement:**
```sql
INSERT INTO products (name, description, price, stock_quantity, category) VALUES
('Eco-Friendly Water Bottle', 'Reusable stainless steel water bottle', 29.99, 50, 'Accessories'),
('Organic Cotton T-Shirt', '100% organic cotton t-shirt', 24.99, 30, 'Clothing'),
('Bamboo Toothbrush', 'Biodegradable bamboo toothbrush', 8.99, 100, 'Personal Care');
```

**Then insert images (use the new product IDs):**
```sql
-- Get the new product IDs first
SELECT id, name FROM products;

-- Insert images (replace 1, 2, 3 with actual product IDs)
INSERT INTO product_images (product_id, image_url) VALUES
(1, 'https://example.com/bottle1.jpg'),
(1, 'https://example.com/bottle2.jpg'),
(2, 'https://example.com/tshirt1.jpg'),
(3, 'https://example.com/brush1.jpg');
```

### 4. Verify Products

```sql
-- Check products
SELECT * FROM products;

-- Check images
SELECT * FROM product_images;
```

### 5. Test on Website

1. Go to your production site
2. Navigate to `/CustomerHome`
3. Products should now appear!

## ⚠️ Troubleshooting

**If products don't appear:**
1. Check Railway MySQL is connected (green checkmark)
2. Verify products exist: `SELECT COUNT(*) FROM products;`
3. Check backend logs in Render for errors
4. Verify `VITE_API_BASE_URL` is set correctly in Vercel

**If images don't show:**
1. Verify `product_images` table has data
2. Check image URLs are accessible
3. Verify product_id matches between tables

---

**After importing, your products will appear on the production site!**

