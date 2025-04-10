// @ts-nocheck
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    const { name, ph_no, address, date_of_birth, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO Users (name, ph_no, address, date_of_birth, password) VALUES (?, ?, ?, ?, ?)',
            [name, ph_no, address, date_of_birth, hashedPassword]
        );
        res.status(201).json({ message: 'User registered', user_id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { ph_no, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM Users WHERE ph_no = ?', [ph_no]);
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid password' });

        const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Query 1: List all products in a user’s cart
router.get('/cart', authenticateToken, async (req, res) => {
    const userId = req.user.user_id;
    try {
        const [rows] = await db.query(`
            SELECT p.product_name, p.price, c.quantity, (p.price * c.quantity) AS total
            FROM Cart c
            JOIN Products p ON c.product_id = p.product_id
            WHERE c.user_id = ?
        `, [userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Query 2: Update inventory after an order
router.post('/order', authenticateToken, async (req, res) => {
    const { product_id, quantity } = req.body;
    const userId = req.user.user_id;
    try {
        const [product] = await db.query('SELECT price, stock_quantity FROM Products WHERE product_id = ?', [product_id]);
        if (product.length === 0 || product[0].stock_quantity < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        await db.query(
            'INSERT INTO Orders (user_id, product_id, price, quantity, order_date) VALUES (?, ?, ?, ?, CURDATE())',
            [userId, product_id, product[0].price, quantity]
        );
        await db.query(
            'UPDATE Products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
            [quantity, product_id]
        );
        res.json({ message: 'Order placed and inventory updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Query 3: Show top-rated products
router.get('/top-rated', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.product_name, AVG(r.rating) AS avg_rating
            FROM Products p
            JOIN Reviews r ON p.product_id = r.product_id
            GROUP BY p.product_id, p.product_name
            ORDER BY avg_rating DESC
            LIMIT 5
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;