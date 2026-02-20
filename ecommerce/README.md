# E-Commerce Website

A full-stack e-commerce web application built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

- 🔐 User Authentication (Register/Login) with JWT
- 📦 Product Listing and Details
- 🛒 Shopping Cart with LocalStorage
- 📋 Order Management System
- 🔒 Password Hashing with Bcrypt
- 🎨 Responsive UI Design

## Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing

**Frontend:**
- HTML5
- CSS3
- Vanilla JavaScript

## Prerequisites

Before running this project, make sure you have:

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd ecommerce
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add:
   ```
   MONGO_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_secret_key_here
   PORT=5000
   ```
   (Or copy from `.env.example`)

4. Make sure MongoDB is running

5. Start the server:
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:5000/index.html
   ```

## Project Structure

```
ecommerce/
│
├── models/          # MongoDB models
├── routes/          # Express routes
├── public/          # Static files (HTML, CSS, JS)
├── server.js        # Main server file
├── package.json     # Project dependencies
└── .env             # Environment variables (not in git)
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get single product

### Orders
- `POST /orders` - Create new order
- `GET /orders/:userId` - Get user orders

## Pages

- `/index.html` - Home page with product listing
- `/product.html` - Product details page
- `/cart.html` - Shopping cart
- `/register.html` - User registration
- `/login.html` - User login

## Contributing

Feel free to fork this project and submit pull requests!

## License

MIT License

## Author

Your Name

