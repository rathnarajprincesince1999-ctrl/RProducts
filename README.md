# RATHNA Products v1.0

A comprehensive full-stack e-commerce application with separate dashboards for users, sellers, and administrators.

## 🚀 Features

### User Features
- User registration and authentication
- Product browsing with categories
- Shopping cart functionality
- Secure checkout with UPI/COD payment options
- Order tracking and management
- Return/replacement requests
- Responsive mobile and desktop design

### Seller Features
- Seller registration and login
- Product management (CRUD operations)
- Order management and status updates
- Return/replacement handling
- Revenue tracking
- Inventory management

### Admin Features
- Complete system administration
- User and seller management
- Product and category management
- Order oversight and management
- Return/replacement approval system
- Revenue analytics
- System monitoring

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 4.0.0
- **Language**: Java 21
- **Database**: MySQL 8.0
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Spring Security with BCrypt
- **Mapping**: MapStruct
- **Build Tool**: Gradle

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM
- **State Management**: Context API
- **HTTP Client**: Fetch API

## 📱 Responsive Design

- **Mobile-first approach** with adaptive layouts
- **Touch-friendly interfaces** for mobile devices
- **Desktop-optimized** table views for data management
- **Consistent user experience** across all screen sizes

## 🔧 Installation & Setup

### Prerequisites
- Java 21 or higher
- Node.js 18+ with npm
- MySQL 8.0+
- Git

### Backend Setup
```bash
cd backend
chmod +x gradlew
./gradlew bootRun
```

### Frontend Setup
```bash
cd fronend
npm install
npm run dev
```

### Database Setup
```sql
CREATE DATABASE RATHNA;
CREATE USER 'developer'@'localhost' IDENTIFIED BY 'dev@MSQL25';
GRANT ALL PRIVILEGES ON RATHNA.* TO 'developer'@'localhost';
FLUSH PRIVILEGES;
```

## 🌐 Database Configuration

- **Host**: 203.57.85.97:3306
- **Database**: RATHNA
- **Username**: developer
- **Password**: dev@MSQL25

## 🔐 Default Admin Credentials

- **Username**: RATHNA
- **Password**: MRPrasad@1

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/admin/login` - Admin login
- `POST /api/seller/login` - Seller login

### Product Endpoints
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Order Endpoints
- `GET /api/orders/user` - Get user orders
- `POST /api/checkout/process` - Process checkout
- `PUT /api/orders/{id}/status` - Update order status

## 🏗️ Project Structure

```
RProducts/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/
│   │   ├── config/         # Configuration files
│   │   ├── controller/     # REST controllers
│   │   ├── model/          # Entity models
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── mapper/         # MapStruct mappers
│   │   ├── service/        # Business logic
│   │   └── repo/           # Data repositories
│   └── build.gradle        # Build configuration
├── fronend/                # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React contexts
│   │   ├── feature/auth/   # Authentication features
│   │   │   ├── component/  # Auth components
│   │   │   ├── components/ # Feature components
│   │   │   ├── pages/      # Page components
│   │   │   └── service/    # API services
│   │   └── hooks/          # Custom React hooks
│   └── package.json        # Dependencies
└── README.md               # This file
```

## 🚀 Deployment

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

### Quick Deploy
1. Clone the repository
2. Setup database and environment variables
3. Build backend: `./gradlew build`
4. Build frontend: `npm run build`
5. Deploy using PM2 and Nginx

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **BCrypt Password Hashing** for user security
- **CORS Configuration** for cross-origin requests
- **Input Validation** and sanitization
- **SQL Injection Protection** via JPA/Hibernate
- **XSS Protection** with security headers

## 🎨 UI/UX Features

- **Glassmorphism Design** with modern aesthetics
- **Responsive Layouts** for all screen sizes
- **Loading States** for all interactive elements
- **Toast Notifications** for user feedback
- **Error Handling** with user-friendly messages
- **Accessibility** compliant interfaces

## 📊 Key Improvements Made

### Bug Fixes (14 Critical Issues Resolved)
- Fixed cart context error references
- Corrected token key inconsistencies
- Integrated proper cart management
- Fixed import path errors
- Removed duplicate implementations
- Added comprehensive loading states

### Responsive Design
- Mobile-first approach implementation
- Card-based layouts for mobile devices
- Table layouts for desktop interfaces
- Touch-friendly button interactions
- Adaptive navigation systems

### Performance Optimizations
- Centralized state management
- Efficient API calls with loading states
- Optimized image handling
- Lazy loading implementations
- Caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software developed for RATHNA Products.

## 👥 Team

- **Developer**: RATHNA Development Team
- **Project**: RATHNA Products E-commerce Platform
- **Version**: 1.0.0

## 📞 Support

For support and queries, please contact the development team.

---

**RATHNA Products** - Building the future of e-commerce, one feature at a time. 🛒✨