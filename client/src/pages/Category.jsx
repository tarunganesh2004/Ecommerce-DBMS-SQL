// @ts-nocheck
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard.jsx';

function Category() {
    const { id } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`/api/products/category/${id}`);
                setProducts(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [id]);

    const handleAddToCart = () => {
        alert('Added to cart!');
    };

    return (
        <div className="container py-4">
            <h2 className="mb-4">Category Products</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="row row-cols-1 row-cols-md-3 g-4">
                    {products.map((product) => (
                        <div className="col" key={product.product_name}>
                            <ProductCard product={product} onAddToCart={handleAddToCart} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Category;