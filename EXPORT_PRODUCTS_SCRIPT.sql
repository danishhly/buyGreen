-- Export Products from Local MySQL Database
-- Run this in your local MySQL database (buygreen_db)

-- Step 1: View all products
SELECT * FROM products;

-- Step 2: View all product images
SELECT * FROM product_images ORDER BY product_id;

-- Step 3: Export products with INSERT statements (copy the output)
SELECT CONCAT(
    'INSERT INTO products (name, description, price, stock_quantity, category) VALUES (',
    QUOTE(name), ', ',
    QUOTE(description), ', ',
    price, ', ',
    stock_quantity, ', ',
    QUOTE(category),
    ');'
) AS insert_statement
FROM products;

-- Step 4: Export product images with INSERT statements (copy the output)
-- Note: You'll need to update product_id after inserting products
SELECT CONCAT(
    'INSERT INTO product_images (product_id, image_url) VALUES (',
    product_id, ', ',
    QUOTE(image_url),
    ');'
) AS insert_statement
FROM product_images
ORDER BY product_id;

