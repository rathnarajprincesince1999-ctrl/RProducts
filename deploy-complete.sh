#!/bin/bash

echo "🚀 Building and Deploying RProducts Website..."

# Build Backend
echo "📦 Building Backend..."
cd /root/RProducts/backend
./gradlew clean build -x test

# Build Frontend  
echo "🎨 Building Frontend..."
cd /root/RProducts/frontend
npm install
npm run build

# Deploy Backend
echo "🔄 Deploying Backend..."
sudo systemctl stop rathna-backend
sudo mkdir -p /var/www/rathnaproducts/backend
sudo cp /root/RProducts/backend/build/libs/backend-0.0.1-SNAPSHOT.jar /var/www/rathnaproducts/backend/rathna-backend.jar
sudo systemctl start rathna-backend

# Deploy Frontend
echo "🌐 Deploying Frontend..."
sudo rm -rf /var/www/rathnaproducts/frontend/*
sudo cp -r /root/RProducts/frontend/dist/* /var/www/rathnaproducts/frontend/

# Restart Services
echo "🔄 Restarting Services..."
sudo systemctl reload nginx
sudo systemctl status rathna-backend
sudo systemctl status nginx

echo "✅ Deployment Complete!"
echo "🌍 Website: https://rathnaproducts.store"