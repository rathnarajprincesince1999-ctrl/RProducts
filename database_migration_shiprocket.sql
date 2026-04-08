-- Shiprocket Integration Database Migration
-- Run these SQL commands to add all required fields for Shiprocket integration

-- 1. Add package details fields to orders table (entered by seller/admin)
ALTER TABLE orders ADD COLUMN package_weight DOUBLE;
ALTER TABLE orders ADD COLUMN package_length INTEGER;
ALTER TABLE orders ADD COLUMN package_breadth INTEGER;
ALTER TABLE orders ADD COLUMN package_height INTEGER;
ALTER TABLE orders ADD COLUMN shipped_at TIMESTAMP NULL;

-- 2. Add customer shipping details to orders table (entered during checkout)
ALTER TABLE orders ADD COLUMN shipping_address VARCHAR(500);
ALTER TABLE orders ADD COLUMN shipping_city VARCHAR(255);
ALTER TABLE orders ADD COLUMN shipping_state VARCHAR(255);
ALTER TABLE orders ADD COLUMN shipping_pincode VARCHAR(10);
ALTER TABLE orders ADD COLUMN shipping_phone VARCHAR(15);
ALTER TABLE orders ADD COLUMN shipping_landmark VARCHAR(255);

-- 2.1. Add Shiprocket integration fields to orders table
ALTER TABLE orders ADD COLUMN shiprocket_order_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN shiprocket_shipment_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN awb_code VARCHAR(255);
ALTER TABLE orders ADD COLUMN courier_name VARCHAR(255);

-- 3. Create user_addresses table for saving customer addresses
CREATE TABLE user_addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    address_line VARCHAR(500) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    landmark VARCHAR(255),
    address_type VARCHAR(50) DEFAULT 'HOME',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_addresses_user_id (user_id),
    INDEX idx_user_addresses_default (user_id, is_default)
);

-- 4. Add indexes for better performance on orders table
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_admin_approved ON orders(admin_approved);
CREATE INDEX idx_orders_shipped_at ON orders(shipped_at);
CREATE INDEX idx_orders_shipping_pincode ON orders(shipping_pincode);

-- Verification queries (run these to check if migration was successful)
-- SELECT COUNT(*) as total_orders FROM orders;
-- SELECT COUNT(*) as orders_with_shipping FROM orders WHERE shipping_address IS NOT NULL;
-- SELECT COUNT(*) as shipped_orders FROM orders WHERE shipped_at IS NOT NULL;
-- SELECT COUNT(*) as saved_addresses FROM user_addresses;
-- DESCRIBE orders;
-- DESCRIBE user_addresses;