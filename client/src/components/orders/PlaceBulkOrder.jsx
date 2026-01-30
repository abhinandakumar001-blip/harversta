import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

const PlaceBulkOrder = ({ group, onClose, onOrderPlaced }) => {
    const { t } = useTranslation();
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (quantity > group.totalQuantityKg) {
            setError(t('insufficientQuantity'));
            setLoading(false);
            return;
        }

        try {
            await api.post('/group-listings/order', {
                groupId: group._id,
                quantityKg: quantity
            });
            alert(t('orderPlaced'));
            if (onOrderPlaced) onOrderPlaced();
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
                <h3 className="text-xl font-bold mb-4">{t('bulkOrder')} - {group.cropName}</h3>

                <p className="mb-4 text-gray-600">
                    {t('pricePerKg')}: <span className="font-semibold">{group.pricePerKg}</span> |
                    Total: <span className="font-semibold">{group.totalQuantityKg} kg</span>
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">{t('quantityKg')}</label>
                        <input
                            type="number"
                            min="1"
                            max={group.totalQuantityKg}
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <p className="text-lg font-bold">
                            {t('totalPrice')}: ₹{(quantity * group.pricePerKg).toFixed(2)}
                        </p>
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
                            className="flex-1 py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
                        >
                            {loading ? t('loading') : t('confirm')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlaceBulkOrder;
