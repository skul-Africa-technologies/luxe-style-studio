# Luxe Style Studio - NestJS Backend

Production-ready NestJS backend for the Luxe Style Studio e-commerce platform.

## Features

- **JWT Authentication** - Secure admin authentication with JWT tokens
- **MongoDB with TypeORM** - Database integration using Mongoose ODM
- **Cloudinary Integration** - Image upload and management
- **Swagger Documentation** - Auto-generated API documentation
- **Role-Based Access Control** - Admin-only routes protection
- **Manual Payment System** - Ready for future 3PL payment integration

## Project Structure

```
backend/
├── src/
│   ├── auth/           # Authentication module
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── services/
│   │   └── strategies/
│   ├── admin/          # Admin dashboard module
│   ├── items/          # Items/Products module
│   ├── users/          # Users module
│   ├── orders/         # Orders module
│   ├── payments/       # Payments module
│   ├── common/         # Shared decorators, guards, interfaces
│   └── config/         # Configuration files
├── .env                # Environment variables
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Cloudinary account

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your environment variables in .env
```

### Environment Variables

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/luxe-style-studio
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=24h
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=http://localhost:5173
```

### Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Start in debug mode
npm run start:debug
```

### API Documentation

Once the server is running, access Swagger documentation at:
```
http://localhost:3001/api/docs
```

## API Endpoints

### Authentication
- `POST /auth/admin/login` - Admin login
- `POST /auth/admin/register` - Register new admin (use for initial setup)

### Items
- `POST /items` - Create new item (Admin only)
- `GET /items` - List all items
- `GET /items/:id` - Get item by ID
- `PATCH /items/:id` - Update item (Admin only)
- `DELETE /items/:id` - Delete item (Admin only)

### Users
- `GET /users` - List all users (Admin only)
- `GET /users/:id` - Get user by ID (Admin only)
- `PATCH /users/:id` - Update user (Admin only)
- `DELETE /users/:id` - Delete user (Admin only)

### Orders
- `POST /orders` - Create new order
- `GET /orders` - List all orders (Admin only)
- `GET /orders/:id` - Get order by ID (Admin only)
- `PATCH /orders/:id/status` - Update order status (Admin only)
- `DELETE /orders/:id` - Cancel order (Admin only)

### Payments
- `POST /payments` - Record payment (Admin only)
- `GET /payments` - List all payments (Admin only)
- `GET /payments/:id` - Get payment by ID (Admin only)
- `PATCH /payments/:id` - Update payment status (Admin only)

### Admin Dashboard
- `GET /admin/dashboard` - Get dashboard analytics (Admin only)

## Authentication

All admin routes require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Initial Setup

1. Start MongoDB
2. Configure environment variables
3. Run `npm run start:dev`
4. Register the first admin:
   ```bash
   curl -X POST http://localhost:3001/auth/admin/register \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@luxestyle.com","password":"securepassword"}'
   ```
5. Login and use the token for admin routes

## Payment System

The payment module is currently set up as a manual system. To integrate a 3PL payment provider:

1. Install the provider SDK (e.g., `npm install stripe`)
2. Create a new payment strategy in `src/payments/strategies/`
3. Update the `PaymentsService` to use the new strategy

## License

MIT
