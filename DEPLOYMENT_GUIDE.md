# RATHNA Products - Server Setup & Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Server Setup](#production-server-setup)
4. [Database Configuration](#database-configuration)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
8. [Environment Configuration](#environment-configuration)
9. [SSL & Domain Setup](#ssl--domain-setup)
10. [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: Minimum 50GB SSD
- **CPU**: 2+ cores

### Required Software
- **Java**: OpenJDK 21
- **Node.js**: v18+ with npm
- **MySQL**: 8.0+
- **Nginx**: 1.18+ (for reverse proxy)
- **Git**: Latest version

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/rathna-products.git
cd rathna-products
```

### 2. Backend Setup
```bash
cd backend

# Install Java 21 (Ubuntu)
sudo apt update
sudo apt install openjdk-21-jdk

# Verify Java installation
java -version

# Make gradlew executable
chmod +x gradlew

# Run backend
./gradlew bootRun
```

### 3. Frontend Setup
```bash
cd fronend

# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

### 4. Database Setup
```sql
-- Create database
CREATE DATABASE RATHNA;

-- Create user (optional)
CREATE USER 'rathna_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON RATHNA.* TO 'rathna_user'@'localhost';
FLUSH PRIVILEGES;
```

## Production Server Setup

### 1. Server Preparation (Ubuntu 20.04+)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Install Java 21
sudo apt install -y openjdk-21-jdk

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL 8.0
sudo apt install -y mysql-server

# Install Nginx
sudo apt install -y nginx

# Install PM2 for process management
sudo npm install -g pm2

# Install certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Create Application User
```bash
# Create dedicated user for application
sudo useradd -m -s /bin/bash rathna
sudo usermod -aG sudo rathna

# Switch to application user
sudo su - rathna
```

## Database Configuration

### 1. MySQL Setup
```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Login to MySQL
sudo mysql -u root -p
```

```sql
-- Create production database
CREATE DATABASE RATHNA CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create application user
CREATE USER 'rathna_prod'@'localhost' IDENTIFIED BY 'your_secure_password_here';
GRANT ALL PRIVILEGES ON RATHNA.* TO 'rathna_prod'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### 2. Database Configuration File
Create `/home/rathna/db-config.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/RATHNA?useSSL=true&serverTimezone=UTC
spring.datasource.username=rathna_prod
spring.datasource.password=your_secure_password_here
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

## Backend Deployment

### 1. Build Application
```bash
# Clone repository to server
cd /home/rathna
git clone https://github.com/your-username/rathna-products.git
cd rathna-products/backend

# Make gradlew executable
chmod +x gradlew

# Build application
./gradlew build -x test

# The JAR file will be in build/libs/
```

### 2. Create Production Configuration
Create `/home/rathna/rathna-products/backend/src/main/resources/application-prod.properties`:
```properties
# Server configuration
server.port=8080
server.servlet.context-path=/api

# Database configuration
spring.datasource.url=jdbc:mysql://localhost:3306/RATHNA?useSSL=true&serverTimezone=UTC
spring.datasource.username=rathna_prod
spring.datasource.password=your_secure_password_here
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# File upload configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Logging configuration
logging.level.com.rathna=INFO
logging.file.name=/home/rathna/logs/rathna-backend.log

# CORS configuration
app.cors.allowed-origins=https://yourdomain.com,https://www.yourdomain.com
```

### 3. Create PM2 Ecosystem File
Create `/home/rathna/ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'rathna-backend',
      script: 'java',
      args: [
        '-jar',
        '-Dspring.profiles.active=prod',
        '/home/rathna/rathna-products/backend/build/libs/rathna-backend.jar'
      ],
      cwd: '/home/rathna/rathna-products/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        JAVA_OPTS: '-Xmx1024m -Xms512m'
      },
      error_file: '/home/rathna/logs/backend-error.log',
      out_file: '/home/rathna/logs/backend-out.log',
      log_file: '/home/rathna/logs/backend-combined.log'
    }
  ]
};
```

### 4. Start Backend Service
```bash
# Create logs directory
mkdir -p /home/rathna/logs

# Start application with PM2
cd /home/rathna
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command above
```

## Frontend Deployment

### 1. Build Frontend
```bash
cd /home/rathna/rathna-products/fronend

# Install dependencies
npm install

# Update API URL for production
# Edit src/config.js
nano src/config.js
```

Update `src/config.js`:
```javascript
// config.js
export const API_URL = 'https://yourdomain.com/api';
```

```bash
# Build for production
npm run build

# The built files will be in dist/ directory
```

### 2. Configure Nginx
Create `/etc/nginx/sites-available/rathna-products`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL configuration (will be added by certbot)
    
    # Frontend files
    root /home/rathna/rathna-products/fronend/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Frontend routing (SPA)
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Handle CORS
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization";
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
    
    # File uploads
    location /api/products/upload-image {
        proxy_pass http://localhost:8080/api/products/upload-image;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        client_max_body_size 10M;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### 3. Enable Nginx Site
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/rathna-products /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## CI/CD Pipeline Setup

### 1. GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy RATHNA Products

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 21
      uses: actions/setup-java@v3
      with:
        java-version: '21'
        distribution: 'temurin'
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Test Backend
      run: |
        cd backend
        chmod +x gradlew
        ./gradlew test
    
    - name: Test Frontend
      run: |
        cd fronend
        npm install
        npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /home/rathna/rathna-products
          git pull origin main
          
          # Build backend
          cd backend
          chmod +x gradlew
          ./gradlew build -x test
          
          # Build frontend
          cd ../fronend
          npm install
          npm run build
          
          # Restart services
          pm2 restart rathna-backend
          sudo systemctl reload nginx
```

### 2. Setup GitHub Secrets
In your GitHub repository, go to Settings > Secrets and add:
- `HOST`: Your server IP address
- `USERNAME`: Server username (rathna)
- `SSH_KEY`: Private SSH key for server access

## Environment Configuration

### 1. Environment Variables
Create `/home/rathna/.env`:
```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=RATHNA
DB_USER=rathna_prod
DB_PASSWORD=your_secure_password_here

# Application
APP_ENV=production
APP_PORT=8080
APP_DOMAIN=yourdomain.com

# JWT Secret (generate a secure random string)
JWT_SECRET=your_jwt_secret_key_here

# File upload path
UPLOAD_PATH=/home/rathna/uploads
```

### 2. Create Upload Directories
```bash
# Create upload directories
mkdir -p /home/rathna/uploads/products
mkdir -p /home/rathna/uploads/categories

# Set permissions
chmod 755 /home/rathna/uploads
chmod 755 /home/rathna/uploads/products
chmod 755 /home/rathna/uploads/categories
```

## SSL & Domain Setup

### 1. Obtain SSL Certificate
```bash
# Install SSL certificate using Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### 2. Setup Auto-renewal
```bash
# Add cron job for certificate renewal
sudo crontab -e

# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring & Maintenance

### 1. Setup Log Rotation
Create `/etc/logrotate.d/rathna-products`:
```
/home/rathna/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 rathna rathna
    postrotate
        pm2 reload rathna-backend
    endscript
}
```

### 2. Monitoring Commands
```bash
# Check application status
pm2 status

# View logs
pm2 logs rathna-backend

# Monitor system resources
htop

# Check Nginx status
sudo systemctl status nginx

# Check MySQL status
sudo systemctl status mysql

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### 3. Backup Script
Create `/home/rathna/backup.sh`:
```bash
#!/bin/bash

# Backup script for RATHNA Products
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/rathna/backups"
DB_NAME="RATHNA"
DB_USER="rathna_prod"
DB_PASS="your_secure_password_here"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Files backup
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /home/rathna/uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make backup script executable
chmod +x /home/rathna/backup.sh

# Add to crontab for daily backups
crontab -e

# Add this line for daily backup at 2 AM:
0 2 * * * /home/rathna/backup.sh
```

## Deployment Checklist

### Pre-deployment
- [ ] Server meets system requirements
- [ ] Domain name configured and pointing to server
- [ ] SSL certificate obtained
- [ ] Database created and configured
- [ ] Environment variables set
- [ ] Upload directories created with proper permissions

### Deployment
- [ ] Code pulled from repository
- [ ] Backend built and tested
- [ ] Frontend built with production API URL
- [ ] PM2 ecosystem configured
- [ ] Nginx configured and tested
- [ ] Services started and running

### Post-deployment
- [ ] Application accessible via domain
- [ ] All features working correctly
- [ ] SSL certificate valid
- [ ] Logs being generated properly
- [ ] Backup script configured
- [ ] Monitoring setup complete

## Troubleshooting

### Common Issues

1. **Backend not starting**
   ```bash
   # Check logs
   pm2 logs rathna-backend
   
   # Check Java version
   java -version
   
   # Check database connection
   mysql -u rathna_prod -p RATHNA
   ```

2. **Frontend not loading**
   ```bash
   # Check Nginx configuration
   sudo nginx -t
   
   # Check Nginx logs
   sudo tail -f /var/log/nginx/error.log
   
   # Verify build files exist
   ls -la /home/rathna/rathna-products/fronend/dist/
   ```

3. **Database connection issues**
   ```bash
   # Check MySQL status
   sudo systemctl status mysql
   
   # Check MySQL logs
   sudo tail -f /var/log/mysql/error.log
   
   # Test connection
   mysql -u rathna_prod -p -h localhost RATHNA
   ```

4. **File upload issues**
   ```bash
   # Check upload directory permissions
   ls -la /home/rathna/uploads/
   
   # Check Nginx client_max_body_size
   grep -r client_max_body_size /etc/nginx/
   ```

## Security Considerations

1. **Firewall Configuration**
   ```bash
   # Enable UFW firewall
   sudo ufw enable
   
   # Allow SSH, HTTP, and HTTPS
   sudo ufw allow ssh
   sudo ufw allow 80
   sudo ufw allow 443
   
   # Check status
   sudo ufw status
   ```

2. **Regular Updates**
   ```bash
   # Update system packages
   sudo apt update && sudo apt upgrade
   
   # Update Node.js dependencies
   cd /home/rathna/rathna-products/fronend
   npm audit fix
   ```

3. **Database Security**
   - Use strong passwords
   - Limit database user privileges
   - Regular backups
   - Monitor access logs

This comprehensive guide covers the complete setup and deployment process for the RATHNA Products application. Follow each section carefully and adapt the configurations to your specific server environment and domain name.