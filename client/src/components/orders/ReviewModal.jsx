import React, { useState } from 'react';

const ReviewModal = ({ isOpen, onClose, order, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hover, setHover] = useState(0);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            orderId: order._id,
            rating,
            comment
        });
        // Reset form
        setRating(0);
        setComment('');
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Rate Farmer</h3>
                    <div className="mt-2 px-7 py-3">
                        <p className="text-sm text-gray-500 mb-4">
                            How was your experience with <strong>{order?.farmer?.name}</strong>?
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className="flex justify-center mb-4">
                                {[...Array(5)].map((star, index) => {
                                    const ratingValue = index + 1;
                                    return (
                                        <button
                                            type="button"
                                            key={index}
                                            className={`text-2xl focus:outline-none transition-colors duration-200 ${ratingValue <= (hover || rating) ? "text-yellow-400" : "text-gray-300"
                                                }`}
                                            onClick={() => setRating(ratingValue)}
                                            onMouseEnter={() => setHover(ratingValue)}
                                            onMouseLeave={() => setHover(0)}
                                        >
                                            ★
                                        </button>
                                    );
                                })}
                            </div>

                            <textarea
                                className="w-full p-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                                rows="3"
                                placeholder="Write a review..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            ></textarea>

                            <div className="flex justify-between mt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={rating === 0}
                                    className={`px-4 py-2 rounded text-white focus:outline-none ${rating === 0
                                            ? 'bg-green-300 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
