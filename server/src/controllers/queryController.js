const db = require('../config/db');

// 1. List all products in a user’s cart
const getCartItems = async (req, res) => {
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
};

// 2. Update inventory after an order
const placeOrder = async (req, res) => {
    const { product_id, quantity } = req.body;
    const userId = req.user.user_id;
    try {
        const [product] = await db.query('SELECT price, stock_quantity FROM Products WHERE product_id = ?', [product_id]);
        if (product.length === 0 || product[0].stock_quantity < quantity) {
            return res.status(400).json({ error: 'Insufficient stock or product not found' });
        }

        const [orderResult] = await db.query(
            'INSERT INTO Orders (user_id, product_id, price, quantity, order_date) VALUES (?, ?, ?, ?, CURDATE())',
            [userId, product_id, product[0].price, quantity]
        );
        await db.query('UPDATE Products SET stock_quantity = stock_quantity - ? WHERE product_id = ?', [quantity, product_id]);
        res.json({ message: 'Order placed', order_id: orderResult.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Show top-rated products
const getTopRatedProducts = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.product_name, AVG(r.rating) AS avg_rating, COUNT(r.review_id) AS review_count
            FROM Products p
            LEFT JOIN Reviews r ON p.product_id = r.product_id
            GROUP BY p.product_id, p.product_name
            ORDER BY avg_rating DESC
            LIMIT 5
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. List user’s order history with payment details
const getOrderHistory = async (req, res) => {
    const userId = req.user.user_id;
    try {
        const [rows] = await db.query(`
            SELECT o.order_id, p.product_name, o.quantity, o.order_date, pay.amount, pay.payment_method
            FROM Orders o
            JOIN Products p ON o.product_id = p.product_id
            LEFT JOIN Payments pay ON o.order_id = pay.order_id
            WHERE o.user_id = ?
        `, [userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. Get products by category
const getProductsByCategory = async (req, res) => {
    const { category_id } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT p.product_name, p.price, p.stock_quantity, c.category_name
            FROM Products p
            JOIN Category c ON p.category_id = c.category_id
            WHERE c.category_id = ?
        `, [category_id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 6. Add product to wish list
const addToWishList = async (req, res) => {
    const { product_id, quantity } = req.body;
    const userId = req.user.user_id;
    try {
        const [result] = await db.query(
            'INSERT INTO Wish_List (user_id, product_id, quantity) VALUES (?, ?, ?)',
            [userId, product_id, quantity]
        );
        res.json({ message: 'Added to wish list', wishlist_id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 7. Get user’s wish list
const getWishList = async (req, res) => {
    const userId = req.user.user_id;
    try {
        const [rows] = await db.query(`
            SELECT p.product_name, p.price, w.quantity
            FROM Wish_List w
            JOIN Products p ON w.product_id = p.product_id
            WHERE w.user_id = ?
        `, [userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 8. Get suppliers for a product
const getProductSuppliers = async (req, res) => {
    const { product_id } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT s.supplier_name, s.contact_info, s.supplier_address
            FROM Supplier s
            WHERE s.product_id = ?
        `, [product_id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 9. Add a review for a product
const addReview = async (req, res) => {
    const { product_id, rating } = req.body;
    const userId = req.user.user_id;
    try {
        const [result] = await db.query(
            'INSERT INTO Reviews (product_id, user_id, rating) VALUES (?, ?, ?)',
            [product_id, userId, rating]
        );
        res.json({ message: 'Review added', review_id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 10. Get total payments by user
const getUserPayments = async (req, res) => {
    const userId = req.user.user_id;
    try {
        const [rows] = await db.query(`
            SELECT SUM(pay.amount) AS total_spent, COUNT(pay.payment_id) AS payment_count
            FROM Payments pay
            JOIN Orders o ON pay.order_id = o.order_id
            WHERE o.user_id = ?
        `, [userId]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 11. Get low-stock products (admin-like query)
const getLowStockProducts = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.product_name, p.stock_quantity, c.category_name
            FROM Products p
            JOIN Category c ON p.category_id = c.category_id
            WHERE p.stock_quantity < 10
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getCartItems,
    placeOrder,
    getTopRatedProducts,
    getOrderHistory,
    getProductsByCategory,
    addToWishList,
    getWishList,
    getProductSuppliers,
    addReview,
    getUserPayments,
    getLowStockProducts
};