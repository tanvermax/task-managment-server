const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON body

// Connect to MongoDB

// Test API Route
app.get("/", (req, res) => {
    res.send("Task Management API is running..");
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
