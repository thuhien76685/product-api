require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const productRoutes = require("./routes/productRoutes");

const app = express();

// Cho phép nhận dữ liệu JSON
app.use(express.json());
app.get("/health", (req, res) => {
  if (mongoose.connection.readyState === 1) {
    return res.status(200).json({
      status: "healthy",
      mongodb: "connected"
    });
  }

  return res.status(503).json({
    status: "unhealthy",
    mongodb: "disconnected"
  });
});

// Kiểm tra API
app.get("/", (req, res) => {
  res.json({
    message: "Product API is running"
  });
});

// Đăng ký các API Product
app.use("/api/products", productRoutes);

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  });