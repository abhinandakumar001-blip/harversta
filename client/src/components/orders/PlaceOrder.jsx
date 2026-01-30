import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

const PlaceOrder = ({ product, onClose, onOrderPlaced }) => {
    const { t } = useTranslation();
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (quantity > product.quantityKg) {
            setError(t('insufficientQuantity'));
            setLoading(false);
            return;
        }

        try {
            await api.post('/orders', {
                productId: product._id,
                quantityKg: quantity
            });
            alert(t('orderPlaced'));
            onOrderPlaced();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || t('error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">{t('placeOrder')} - {product.cropName}</h3>

                <p className="mb-4 text-gray-600">
                    {t('pricePerKg')}: <span className="font-semibold">{product.pricePerKg}</span> |
                    {t('quantityKg')}: <span className="font-semibold">{product.quantityKg}</span>
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">{t('quantityKg')}</label>
                        <input
                            type="number"
                            min="1"
                            max={product.quantityKg}
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <p className="text-lg font-bold">
                            {t('totalPrice')}: ₹{(quantity * product.pricePerKg).toFixed(2)}
                        </p>
                        {/* Farmer Info & Rating */}
                        <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium">{t('farmerName')}:</span>
                                <span className="font-semibold text-gray-800">{product.farmer?.name}</span>
                            </div>
                            {product.farmer?.averageRating > 0 && (
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-gray-600 font-medium">Rating:</span>
                                    <div className="flex items-center text-yellow-500 font-bold">
                                        <span>{product.farmer.averageRating.toFixed(1)}</span>
                                        <span className="ml-1">★</span>
                                        <span className="ml-1 text-gray-400 font-normal text-xs">({product.farmer.totalReviews} reviews)</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && <p className="text-red-500 mb-4">{error}</p>}

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded hover:bg-gray-50"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading || quantity <= 0}
                            className="flex-1 py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                        >
                            {loading ? t('loading') : t('confirm')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlaceOrder;
