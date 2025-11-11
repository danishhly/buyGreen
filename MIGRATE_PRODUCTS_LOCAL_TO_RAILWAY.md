# Migrate Products from Local MySQL to Railway MySQL

## 📋 Situation

Your products are in your **local MySQL database** (`buygreen_db` on `localhost`), but your production site uses **Railway MySQL**. These are separate databases, so products don't automatically transfer.

## ✅ Solution Options

### Option 1: Export from Local & Import to Railway (Recommended)

#### Step 1: Export Products from Local MySQL

1. **Open MySQL Command Line or MySQL Workbench**
2. **Connect to your local database:**
   ```bash
   mysql -u root -p buygreen_db
   ```

3. **Export products table:**
   ```sql
   SELECT * FROM products INTO OUTFILE 'C:/temp/products_export.csv'
   FIELDS TERMINATED BY ',' 
   ENCLOSED BY '"' 
   LINES TERMINATED BY '\n';
   ```
   
   **OR use mysqldump (easier):**
   ```bash
   mysqldump -u root -p buygreen_db products > products_export.sql
   ```

4. **Export product_images table:**
   ```bash
   mysqldump -u root -p buygreen_db product_images > product_images_export.sql
   ```

#### Step 2: Connect to Railway MySQL

1. **Get Railway MySQL Connection Details:**
   - Go to Railway Dashboard → Your MySQL service
   - Click "Connect" tab
   - Copy the connection string or use these values:
     - Host: (from `MYSQLHOST` variable)
     - Port: (from `MYSQLPORT` variable)
     - Database: (from `MYSQLDATABASE` variable, usually `railway`)
     - User: (from `MYSQLUSER` variable)
     - Password: (from `MYSQLPASSWORD` variable)

2. **Connect using MySQL client:**
   ```bash
   mysql -h [RAILWAY_HOST] -P [RAILWAY_PORT] -u [RAILWAY_USER] -p [RAILWAY_DATABASE]
   ```
   
   Example:
   ```bash
   mysql -h interchange.proxy.rlwy.net -P 55721 -u root -p railway
   ```

#### Step 3: Import Products to Railway

1. **Import products table:**
   ```bash
   mysql -h [RAILWAY_HOST] -P [RAILWAY_PORT] -u [RAILWAY_USER] -p [RAILWAY_DATABASE] < products_export.sql
   ```

2. **Import product_images table:**
   ```bash
   mysql -h [RAILWAY_HOST] -P [RAILWAY_PORT] -u [RAILWAY_USER] -p [RAILWAY_DATABASE] < product_images_export.sql
   ```

### Option 2: Use Railway MySQL Interface (Easier)

1. **Go to Railway Dashboard** → Your MySQL service
2. **Click "Data" tab** (or "Query" tab)
3. **Export from local MySQL:**
   - Run: `SELECT * FROM products;`
   - Copy the results
4. **Insert into Railway MySQL:**
   - Run INSERT statements for each product
   - Example:
   ```sql
   INSERT INTO products (name, description, price, stock_quantity, category) 
   VALUES ('Product Name', 'Description', 99.99, 10, 'category');
   ```

### Option 3: Re-add Products via Admin Dashboard (Simplest)

If you don't have many products, just re-add them:

1. **Log in as Admin** on your production site
2. **Go to Admin Dashboard** → Product Manager
3. **Add each product again** with the same details
4. This is the simplest but most time-consuming option

## 🔧 Quick Export Script

Create a file `export_products.sql`:

```sql
-- Export products
SELECT 
    id,
    name,
    description,
    price,
    stock_quantity,
    category
FROM products;

-- Export product images (run separately)
SELECT 
    product_id,
    image_url
FROM product_images;
```

Then create `import_products.sql`:

```sql
-- First, insert products (adjust IDs if needed)
INSERT INTO products (name, description, price, stock_quantity, category) VALUES
('Product 1', 'Description 1', 99.99, 10, 'category1'),
('Product 2', 'Description 2', 149.99, 5, 'category2');

-- Then insert images (use the new product IDs)
INSERT INTO product_images (product_id, image_url) VALUES
(1, 'https://example.com/image1.jpg'),
(1, 'https://example.com/image2.jpg'),
(2, 'https://example.com/image3.jpg');
```

## 📝 Product Table Structure

Based on your code, products table has:
- `id` (auto-generated)
- `name` (VARCHAR)
- `description` (TEXT)
- `price` (DECIMAL)
- `stock_quantity` (INT)
- `category` (VARCHAR)
- `imageUrls` (stored in separate `product_images` table)

## ⚠️ Important Notes

1. **Product IDs will change** - Railway will assign new IDs
2. **Image URLs** - Make sure image URLs are still accessible (if using external URLs)
3. **Relationships** - If you have orders/carts referencing old product IDs, those will break
4. **Backup first** - Always backup Railway database before importing

## 🎯 Recommended Approach

**For small number of products (< 20):**
- Use **Option 3** (re-add via Admin Dashboard)
- Fastest and safest

**For many products (> 20):**
- Use **Option 1** (export/import)
- More efficient but requires MySQL knowledge

---

**Your products are safe in your local database. Choose the migration method that works best for you!**

