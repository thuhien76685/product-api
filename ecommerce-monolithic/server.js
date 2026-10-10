
require("dotenv").config();

const express = require("express");
const prisma = require("./config/prisma");

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

app.use(express.json());

// Trang chu
app.get("/", (req, res) => {
    res.json({
        message: "E-commerce Monolithic API is running"
    });
});

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        message: "API dang hoat dong"
    });
});

// Kiem tra ket noi PostgreSQL
app.get("/test-db", async (req, res) => {
    try {
        const result = await prisma.$queryRaw`SELECT 1`;

        res.json({
            message: "Kết nối PostgreSQL thành công",
            result: result
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Kết nối PostgreSQL thất bại"
        });
    }
});

// API dang ky va dang nhap
app.use("/api/auth", authRoutes);

// API san pham
app.use("/api/products", productRoutes);

// API kiem tra JWT
app.get("/api/auth/profile", authMiddleware, (req, res) => {
    res.json({
        message: "Token hop le",
        user: req.user
    });
});

// Xu ly loi JSON khong hop le
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        return res.status(400).json({
            message: "Du lieu JSON khong hop le"
        });
    }

    next(error);
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`E-commerce Monolithic API running on port ${PORT}`);
});
