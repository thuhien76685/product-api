
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const router = express.Router();

// Dang ky tai khoan
router.post("/register", async (req, res) => {
    try {
        const { username, fullname, password } = req.body;

        if (!username || !fullname || !password) {
            return res.status(400).json({
                message: "Vui long nhap day du thong tin"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Mat khau phai co it nhat 6 ky tu"
            });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                username: username
            }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Ten dang nhap da ton tai"
            });
        }

        // Tai khoan dang ky moi mac dinh la KhachHang
        const role = await prisma.role.findFirst({
            where: {
                rolename: "KhachHang"
            }
        });

        if (!role) {
            return res.status(500).json({
                message: "Chua cau hinh vai tro KhachHang"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username: username,
                fullname: fullname,
                password: hashedPassword,
                roleid: role.roleid
            },
            select: {
                uid: true,
                username: true,
                fullname: true,
                roleid: true
            }
        });

        res.status(201).json({
            message: "Dang ky tai khoan thanh cong",
            user: user
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Loi khi dang ky tai khoan"
        });
    }
});

// Dang nhap
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Vui long nhap ten dang nhap va mat khau"
            });
        }

        const user = await prisma.user.findFirst({
            where: {
                username: username
            }
        });

        if (!user) {
            return res.status(401).json({
                message: "Ten dang nhap hoac mat khau khong dung"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Ten dang nhap hoac mat khau khong dung"
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "Chua cau hinh JWT_SECRET"
            });
        }

        const token = jwt.sign(
            {
                uid: user.uid,
                username: user.username,
                roleid: user.roleid
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        res.json({
            message: "Dang nhap thanh cong",
            token: token,
            user: {
                uid: user.uid,
                username: user.username,
                fullname: user.fullname,
                roleid: user.roleid
            }
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Loi khi dang nhap"
        });
    }
});

module.exports = router;
