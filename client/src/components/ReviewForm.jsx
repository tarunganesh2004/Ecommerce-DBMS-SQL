// @ts-nocheck
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';

function ReviewForm({ productId, onReviewAdded }) {
    const { token } = useAuth();
    const [rating, setRating] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/review', { product_id: productId, rating }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRating(0);
            onReviewAdded();
        } catch (err) {
            alert('Failed to add review');
        }
    };

    return (
        <div className="mt-3">
            <h5>Add a Review</h5>
            <div className="mb-3">
                <label>Rating (1-5):</label>
                <input
                    type="number"
                    className="form-control"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                />
            </div>
            <button className="btn btn-primary" onClick={handleSubmit}>Submit Review</button>
        </div>
    );
}

export default ReviewForm;