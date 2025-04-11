// @ts-nocheck
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';

function ProductCard({ product, onAddToCart }) {
    const { token } = useAuth();

    const handleAddToCart = async () => {
        try {
            await axios.post('/api/order', { product_id: product.product_id, quantity: 1 }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onAddToCart();
        } catch (err) {
            alert('Failed to add to cart');
        }
    };

    return (
        <div className="card product-card h-100">
            <img src="/src/assets/placeholder.jpg" className="card-img-top" alt={product.product_name} />
            <div className="card-body">
                <h5 className="card-title">{product.product_name}</h5>
                <p className="card-text">${product.price}</p>
                <p className="card-text">Rating: {product.avg_rating ? product.avg_rating.toFixed(1) : 'N/A'}</p>
                {token && (
                    <button className="btn btn-primary" onClick={handleAddToCart}>Add to Cart</button>
                )}
            </div>
        </div>
    );
}

export default ProductCard;