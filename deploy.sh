#!/bin/bash

# RProducts Deployment Script
echo "Starting RProducts deployment..."

# Install MySQL
sudo apt update
sudo apt install -y mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Setup MySQL database
sudo mysql -e "CREATE DATABASE IF NOT EXISTS RATHNA;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'developer'@'localhost' IDENTIFIED BY 'dev@MSQL25';"
sudo mysql -e "GRANT ALL PRIVILEGES ON RATHNA.* TO 'developer'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Install Java 21
sudo apt install -y openjdk-21-jdk

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Build Backend
cd /root/RProducts/backend
chmod +x gradlew
./gradlew clean build -x test

# Build Frontend
cd /root/RProducts/frontend
npm install
npm run build

# Start Backend
cd /root/RProducts/backend
nohup java -jar build/libs/*.jar > backend.log 2>&1 &

# Serve Frontend (using Node.js serve)
cd /root/RProducts/frontend
npm install -g serve
nohup serve -s dist -l 3000 > frontend.log 2>&1 &

echo "Deployment complete!"
echo "Backend running on: http://localhost:8080"
echo "Frontend running on: http://localhost:3000"