-- Migration script for Order Management System enhancements
-- Run this script to add new columns to existing orders table

-- Add admin approval column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_approved BOOLEAN DEFAULT FALSE;

-- Add package details columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS package_weight DOUBLE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS package_length INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS package_breadth INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS package_height INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP NULL;

-- Add customer shipping details columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address VARCHAR(500);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_pincode VARCHAR(10);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_landmark VARCHAR(255);

-- Add Shiprocket integration columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_order_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_shipment_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS awb_code VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name VARCHAR(255);

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_orders_admin_approved ON orders(admin_approved);
CREATE INDEX IF NOT EXISTS idx_orders_shiprocket_order_id ON orders(shiprocket_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_awb_code ON orders(awb_code);
CREATE INDEX IF NOT EXISTS idx_orders_shipped_at ON orders(shipped_at);

-- Update existing orders to have admin_approved = true for backward compatibility
-- This ensures existing orders can continue their workflow
UPDATE orders SET admin_approved = TRUE WHERE admin_approved IS NULL AND status != 'PENDING';

COMMIT;