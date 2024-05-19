// index.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/team');
// Creating express app instance
const app = express();
const port = 8080;
// Connecting to MongoDB Atlas database
mongoose
  .connect(
    process.env.MONGO_URI,
    { useNewUrlParser: true, useUnifiedTopology: true } // Adding options object
  )
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });

// Middleware to parse incoming JSON requests
app.use(express.json());
// Middleware for enabling CORS
app.use(cors());

app.use('/auth', authRoutes);
app.use('/team', teamRoutes);

// testing the server
app.get('/', function (req, res) {
  res.status(200).json({
    message: 'APP WORKING',
  });
});

app.listen(port, function () {
  console.log(`Server is running on port number ${port}`);
});
