require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection with fallback
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.log('MongoDB not available, using in-memory database');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('In-Memory MongoDB started successfully');
  }
  await seedProducts();
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// Seed Products
async function seedProducts() {
  const Product = require('./models/Product');
  const count = await Product.countDocuments();
  if (count === 0) {
    const products = [
      { name: 'Laptop', description: 'High-performance laptop', price: 999, image: 'https://via.placeholder.com/300x200?text=Laptop', category: 'Electronics' },
      { name: 'Smartphone', description: 'Latest smartphone', price: 699, image: 'https://via.placeholder.com/300x200?text=Smartphone', category: 'Electronics' },
      { name: 'Headphones', description: 'Wireless headphones', price: 149, image: 'https://via.placeholder.com/300x200?text=Headphones', category: 'Electronics' },
      { name: 'Watch', description: 'Smart watch', price: 299, image: 'https://via.placeholder.com/300x200?text=Watch', category: 'Electronics' },
      { name: 'Camera', description: 'Digital camera', price: 599, image: 'https://via.placeholder.com/300x200?text=Camera', category: 'Electronics' },
      { name: 'Tablet', description: '10-inch tablet', price: 399, image: 'https://via.placeholder.com/300x200?text=Tablet', category: 'Electronics' }
    ];
    await Product.insertMany(products);
    console.log('Products seeded successfully');
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
  console.log('Open browser at: http://localhost:' + PORT + '/index.html');
});