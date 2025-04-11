// @ts-nocheck
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';

function Wishlist() {
    const { token } = useAuth();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const res = await axios.get('/api/wishlist', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWishlist(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchWishlist();
    }, [token]);

    return (
        <div className="container py-4">
            <h2 className="mb-4">Your Wishlist</h2>
            {loading ? (
                <p>Loading...</p>
            ) : wishlist.length === 0 ? (
                <p>Your wishlist is empty.</p>
            ) : (
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {wishlist.map((item) => (
                            <tr key={item.product_name}>
                                <td>{item.product_name}</td>
                                <td>${item.price}</td>
                                <td>{item.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Wishlist;