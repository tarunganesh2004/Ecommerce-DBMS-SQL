// @ts-nocheck
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';
import CartItem from '../components/CartItem.jsx';

function Cart() {
    const { token } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await axios.get('/api/cart', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCartItems(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchCart();
    }, [token]);

    return (
        <div className="container py-4">
            <h2 className="mb-4">Your Cart</h2>
            {loading ? (
                <p>Loading...</p>
            ) : cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cartItems.map((item) => (
                            <CartItem key={item.product_name} item={item} />
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Cart;