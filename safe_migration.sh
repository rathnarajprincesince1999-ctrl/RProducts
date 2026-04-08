#!/bin/bash

# Safe Shiprocket Migration Script
DB_USER="developer"
DB_PASS="dev@MSQL25"
DB_NAME="RATHNA"

echo "🚀 Starting Shiprocket Migration..."

# Function to add column if it doesn't exist
add_column_if_not_exists() {
    local table=$1
    local column=$2
    local definition=$3
    
    exists=$(mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "SHOW COLUMNS FROM $table LIKE '$column';" | wc -l)
    if [ $exists -eq 0 ]; then
        echo "Adding column $column to $table..."
        mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "ALTER TABLE $table ADD COLUMN $column $definition;"
    else
        echo "Column $column already exists in $table"
    fi
}

# Add package details columns
add_column_if_not_exists "orders" "package_weight" "DOUBLE"
add_column_if_not_exists "orders" "package_length" "INTEGER"
add_column_if_not_exists "orders" "package_breadth" "INTEGER"
add_column_if_not_exists "orders" "package_height" "INTEGER"
add_column_if_not_exists "orders" "shipped_at" "TIMESTAMP NULL"

# Add shipping address columns
add_column_if_not_exists "orders" "shipping_address" "VARCHAR(500)"
add_column_if_not_exists "orders" "shipping_city" "VARCHAR(255)"
add_column_if_not_exists "orders" "shipping_state" "VARCHAR(255)"
add_column_if_not_exists "orders" "shipping_pincode" "VARCHAR(10)"
add_column_if_not_exists "orders" "shipping_phone" "VARCHAR(15)"
add_column_if_not_exists "orders" "shipping_landmark" "VARCHAR(255)"

# Add Shiprocket integration columns
add_column_if_not_exists "orders" "shiprocket_order_id" "VARCHAR(255)"
add_column_if_not_exists "orders" "shiprocket_shipment_id" "VARCHAR(255)"
add_column_if_not_exists "orders" "awb_code" "VARCHAR(255)"
add_column_if_not_exists "orders" "courier_name" "VARCHAR(255)"

# Create user_addresses table if it doesn't exist
table_exists=$(mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "SHOW TABLES LIKE 'user_addresses';" | wc -l)
if [ $table_exists -eq 0 ]; then
    echo "Creating user_addresses table..."
    mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "
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
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );"
else
    echo "Table user_addresses already exists"
fi

echo "✅ Migration completed successfully!"
echo "📊 Checking final structure..."
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "DESCRIBE orders;" | head -20
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "DESCRIBE user_addresses;" | head -10