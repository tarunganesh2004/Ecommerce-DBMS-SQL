const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const register = async (req, res) => {
    const { name, ph_no, address, date_of_birth, password } = req.body;
    try {
        const [existing] = await db.query('SELECT * FROM Users WHERE ph_no = ?', [ph_no]);
        if (existing.length > 0) return res.status(400).json({ error: 'Phone number already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO Users (name, ph_no, address, date_of_birth, password) VALUES (?, ?, ?, ?, ?)',
            [name, ph_no, address, date_of_birth, hashedPassword]
        );
        res.status(201).json({ message: 'User registered', user_id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const login = async (req, res) => {
    const { ph_no, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM Users WHERE ph_no = ?', [ph_no]);
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid password' });

        const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user_id: user.user_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { register, login };