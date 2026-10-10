const express = require("express");
const prisma = require("../config/prisma");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Lấy tất cả sản phẩm
router.get("/", async (req, res) => {
    try {
        const products = await prisma.product.findMany();

        res.json(products);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Lỗi khi lấy danh sách sản phẩm"
        });
    }
});

// Lấy sản phẩm theo ID
router.get("/:pid", async (req, res) => {
    try {
        const pid = parseInt(req.params.pid);

        const product = await prisma.product.findUnique({
            where: {
                pid: pid
            }
        });

        if (!product) {
            return res.status(404).json({
                message: "Không tìm thấy sản phẩm"
            });
        }

        res.json(product);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Lỗi khi tìm sản phẩm"
        });
    }
});

// Thêm sản phẩm - cần JWT
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { pname, price, quantity } = req.body;

        const product = await prisma.product.create({
            data: {
                pname: pname,
                price: price,
                quantity: quantity
            }
        });

        res.status(201).json(product);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Lỗi khi thêm sản phẩm"
        });
    }
});

// Cập nhật sản phẩm - cần JWT
router.put("/:pid", authMiddleware, async (req, res) => {
    try {
        const pid = parseInt(req.params.pid);
        const { pname, price, quantity } = req.body;

        const product = await prisma.product.findUnique({
            where: {
                pid: pid
            }
        });

        if (!product) {
            return res.status(404).json({
                message: "Không tìm thấy sản phẩm"
            });
        }

        const updatedProduct = await prisma.product.update({
            where: {
                pid: pid
            },
            data: {
                pname: pname,
                price: price,
                quantity: quantity
            }
        });

        res.json(updatedProduct);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Lỗi khi cập nhật sản phẩm"
        });
    }
});

// Xóa sản phẩm - cần JWT
router.delete("/:pid", authMiddleware, async (req, res) => {
    try {
        const pid = parseInt(req.params.pid);

        const product = await prisma.product.findUnique({
            where: {
                pid: pid
            }
        });

        if (!product) {
            return res.status(404).json({
                message: "Không tìm thấy sản phẩm"
            });
        }

        await prisma.product.delete({
            where: {
                pid: pid
            }
        });

        res.json({
            message: "Xóa sản phẩm thành công"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Lỗi khi xóa sản phẩm"
        });
    }
});

module.exports = router;