#!/bin/bash

set -e

echo "🚀 Starting RATHNA Products deployment for rathnaproducts.store..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates

# Install Java 21
print_status "Installing Java 21..."
sudo apt install -y openjdk-21-jdk
java -version

# Install Node.js 18
print_status "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version

# Install MySQL
print_status "Installing MySQL Server..."
sudo apt install -y mysql-server

# Start and enable MySQL
print_status "Starting MySQL service..."
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL installation
print_status "Setting up MySQL database..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS RATHNA;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'developer'@'localhost' IDENTIFIED BY 'dev@MSQL25';"
sudo mysql -e "GRANT ALL PRIVILEGES ON RATHNA.* TO 'developer'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Install Nginx
print_status "Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL
print_status "Installing Certbot for SSL certificates..."
sudo apt install -y certbot python3-certbot-nginx

# Create application user
print_status "Creating application user..."
sudo useradd -r -s /bin/false rathna || true

# Create directory structure
print_status "Creating directory structure..."
sudo mkdir -p /var/www/rathnaproducts/{frontend,backend,uploads/products}
sudo mkdir -p /var/log/rathnaproducts

# Set permissions
sudo chown -R rathna:rathna /var/www/rathnaproducts
sudo chown -R rathna:rathna /var/log/rathnaproducts

# Build Backend
print_status "Building backend application..."
cd /root/RProducts/backend
chmod +x gradlew
./gradlew clean build -x test

# Copy backend jar
print_status "Deploying backend..."
sudo cp build/libs/*.jar /var/www/rathnaproducts/backend/rathna-backend.jar
sudo cp src/main/resources/application-prod.yaml /var/www/rathnaproducts/backend/
sudo chown rathna:rathna /var/www/rathnaproducts/backend/*

# Update frontend config for production
print_status "Updating frontend configuration..."
cd /root/RProducts/frontend
cp src/config.prod.js src/config.js

# Build Frontend
print_status "Building frontend application..."
npm install
npm run build

# Deploy frontend
print_status "Deploying frontend..."
sudo cp -r dist/* /var/www/rathnaproducts/frontend/
sudo chown -R www-data:www-data /var/www/rathnaproducts/frontend

# Install systemd service
print_status "Installing backend service..."
sudo cp /root/RProducts/rathna-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable rathna-backend

# Configure Nginx
print_status "Configuring Nginx..."
sudo cp /root/RProducts/nginx.conf /etc/nginx/sites-available/rathnaproducts.store
sudo ln -sf /etc/nginx/sites-available/rathnaproducts.store /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Get SSL certificate
print_status "Obtaining SSL certificate..."
print_warning "Make sure your domain rathnaproducts.store points to this server's IP address"
read -p "Press Enter when DNS is configured and ready to continue..."

sudo certbot --nginx -d rathnaproducts.store -d www.rathnaproducts.store --non-interactive --agree-tos --email admin@rathnaproducts.store

# Start services
print_status "Starting services..."
sudo systemctl start rathna-backend
sudo systemctl reload nginx

# Setup automatic certificate renewal
print_status "Setting up automatic SSL renewal..."
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

# Create backup script
print_status "Creating backup script..."
sudo tee /usr/local/bin/rathna-backup.sh > /dev/null <<EOF
#!/bin/bash
BACKUP_DIR="/var/backups/rathnaproducts"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# Backup database
mysqldump -u developer -p'dev@MSQL25' RATHNA > \$BACKUP_DIR/database_\$DATE.sql

# Backup uploads
tar -czf \$BACKUP_DIR/uploads_\$DATE.tar.gz -C /var/www/rathnaproducts uploads/

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: \$DATE"
EOF

sudo chmod +x /usr/local/bin/rathna-backup.sh

# Setup daily backup
echo "0 2 * * * /usr/local/bin/rathna-backup.sh" | sudo crontab -

# Setup log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/rathnaproducts > /dev/null <<EOF
/var/log/rathnaproducts/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 rathna rathna
    postrotate
        systemctl reload rathna-backend
    endscript
}
EOF

# Setup monitoring script
print_status "Creating monitoring script..."
sudo tee /usr/local/bin/rathna-monitor.sh > /dev/null <<EOF
#!/bin/bash

# Check if backend is running
if ! systemctl is-active --quiet rathna-backend; then
    echo "Backend service is down, restarting..."
    systemctl restart rathna-backend
fi

# Check if nginx is running
if ! systemctl is-active --quiet nginx; then
    echo "Nginx service is down, restarting..."
    systemctl restart nginx
fi

# Check database connection
if ! mysql -u developer -p'dev@MSQL25' -e "SELECT 1;" RATHNA > /dev/null 2>&1; then
    echo "Database connection failed"
fi
EOF

sudo chmod +x /usr/local/bin/rathna-monitor.sh

# Setup monitoring cron
echo "*/5 * * * * /usr/local/bin/rathna-monitor.sh" | sudo crontab -

# Final status check
print_status "Checking service status..."
sudo systemctl status rathna-backend --no-pager
sudo systemctl status nginx --no-pager

# Display final information
print_status "🎉 Deployment completed successfully!"
echo ""
echo "=== RATHNA Products Deployment Summary ==="
echo "Domain: https://rathnaproducts.store"
echo "Backend API: https://rathnaproducts.store/api"
echo "Backend Service: rathna-backend"
echo "Database: MySQL (RATHNA)"
echo "SSL: Let's Encrypt"
echo "Uploads: /var/www/rathnaproducts/uploads"
echo "Logs: /var/log/rathnaproducts"
echo "Backups: /var/backups/rathnaproducts"
echo ""
echo "=== Service Commands ==="
echo "Backend: sudo systemctl {start|stop|restart|status} rathna-backend"
echo "Nginx: sudo systemctl {start|stop|restart|status} nginx"
echo "View logs: sudo journalctl -u rathna-backend -f"
echo "Manual backup: sudo /usr/local/bin/rathna-backup.sh"
echo ""
echo "=== Important Notes ==="
echo "1. SSL certificate will auto-renew"
echo "2. Daily backups are scheduled at 2 AM"
echo "3. Service monitoring runs every 5 minutes"
echo "4. Log rotation is configured"
echo ""
print_status "Your RATHNA Products e-commerce platform is now live at https://rathnaproducts.store"