-- Sample data for testing profile management features
-- This file can be used to populate test data

-- Sample addresses (will be inserted after users are created)
-- INSERT INTO addresses (type, full_address, user_id) VALUES 
-- ('Home', '123 Main Street, City, State, 12345', 1),
-- ('Work', '456 Business Ave, Corporate City, State, 67890', 1);

-- Sample payment methods (will be inserted after users are created)
-- INSERT INTO payments (type, last_four, expiry_date, user_id) VALUES 
-- ('Visa', '1234', '12/25', 1),
-- ('UPI', NULL, NULL, 1);

-- Sample orders with seller relationships (will be inserted after users and sellers are created)
-- INSERT INTO orders (status, total, payment_method, user_id, seller_id) VALUES 
-- ('DELIVERED', 299.99, 'Credit Card', 1, 1),
-- ('DELIVERED', 149.50, 'UPI', 2, 1),
-- ('DELIVERED', 89.99, 'Cash on Delivery', 1, 2),
-- ('PROCESSING', 199.99, 'Credit Card', 2, 1),
-- ('SHIPPED', 79.99, 'UPI', 1, 2);

-- Sample order items (will be inserted after orders and products are created)
-- INSERT INTO order_items (quantity, price, order_id, product_id) VALUES 
-- (2, 149.99, 1, 1),
-- (1, 149.50, 2, 2),
-- (1, 89.99, 3, 3),
-- (1, 199.99, 4, 1),
-- (1, 79.99, 5, 2);

-- Note: Replace user_id, seller_id, and product_id values with actual IDs from your respective tables
-- All sample data is commented out for production use