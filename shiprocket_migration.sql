-- Shiprocket Integration Migration
-- Run this if columns don't exist

ALTER TABLE orders 
ADD COLUMN shiprocket_order_id VARCHAR(255) NULL,
ADD COLUMN shiprocket_shipment_id VARCHAR(255) NULL,
ADD COLUMN awb_code VARCHAR(255) NULL,
ADD COLUMN courier_name VARCHAR(255) NULL;

-- Add indexes for performance
CREATE INDEX idx_orders_shiprocket_order_id ON orders(shiprocket_order_id);
CREATE INDEX idx_orders_awb_code ON orders(awb_code);