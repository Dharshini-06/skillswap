import React, { useState } from 'react';
import './RatingModal.css';

const RatingModal = ({ isOpen, onClose, onSubmit, skillName }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [description, setDescription] = useState("");

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (rating === 0) {
            alert("Please select a rating before submitting.");
            return;
        }
        onSubmit(rating, description);
        setRating(0); // Reset for next use
        setDescription(""); // Reset for next use
    };

    return (
        <div className="modal-overlay">
            <div className="rating-modal-content">
                <div className="modal-header">
                    <h2>Rate your mentor</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>for {skillName}</p>
                </div>

                <div className="star-rating">
                    {[...Array(5)].map((star, index) => {
                        const ratingValue = index + 1;
                        return (
                            <button
                                type="button"
                                key={index}
                                className={ratingValue <= (hover || rating) ? "on" : "off"}
                                onClick={() => setRating(ratingValue)}
                                onMouseEnter={() => setHover(ratingValue)}
                                onMouseLeave={() => setHover(0)}
                            >
                                <span className="star">&#9733;</span>
                            </button>
                        );
                    })}
                </div>

                <div className="description-section" style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '600', textAlign: 'left' }}>
                        Feedback (Optional)
                    </label>
                    <textarea
                        className="feedback-textarea"
                        placeholder="Tell us about your experience..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="modal-footer">
                    <button className="submit-btn" onClick={handleSubmit}>
                        Submit Feedback
                    </button>
                    <button className="cancel-btn" onClick={() => {
                        setRating(0);
                        setDescription("");
                        onClose();
                    }}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RatingModal;
