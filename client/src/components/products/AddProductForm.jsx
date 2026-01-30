import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

const AddProductForm = ({ onProductAdded, editingProduct, onCancel }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        cropName: '',
        quantityKg: '',
        pricePerKg: '',
        harvestDate: '',
        location: '',
        isGroupEligible: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [suggestion, setSuggestion] = useState(null); // Controls the "Suggestion Box" visibility
    const [marketData, setMarketData] = useState(null); // Stores the fetched data for validation

    const fetchMarketPrice = async (showSuggestion = false) => {
        if (!formData.cropName) return;

        try {
            const { data } = await api.get(`/market/prices?cropName=${formData.cropName}`);
            if (data.found) {
                setMarketData(data);
                if (showSuggestion) {
                    setSuggestion(data);
                }
            } else {
                setMarketData(null);
                if (showSuggestion) {
                    alert(data.message);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    React.useEffect(() => {
        if (editingProduct) {
            setFormData({
                cropName: editingProduct.cropName,
                quantityKg: editingProduct.quantityKg,
                pricePerKg: editingProduct.pricePerKg,
                harvestDate: editingProduct.harvestDate ? editingProduct.harvestDate.split('T')[0] : '',
                location: editingProduct.location,
                isGroupEligible: editingProduct.isGroupEligible
            });
        } else {
            setFormData({
                cropName: '',
                quantityKg: '',
                pricePerKg: '',
                harvestDate: '',
                location: '',
                isGroupEligible: false
            });
        }
    }, [editingProduct]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct._id}`, formData);
            } else {
                await api.post('/products', formData);
            }

            setFormData({
                cropName: '',
                quantityKg: '',
                pricePerKg: '',
                harvestDate: '',
                location: '',
                isGroupEligible: false
            });
            if (onProductAdded) onProductAdded();
        } catch (err) {
            console.error(err);
            setError(t('error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">{editingProduct ? t('edit') + ' ' + t('addProduct').split(' ')[1] : t('addProduct')}</h2>
                {loading && <span className="text-sm text-green-600 animate-pulse font-medium">{t('loading')}...</span>}
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t('cropName')}</label>
                    <input
                        type="text"
                        name="cropName"
                        value={formData.cropName}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                        placeholder="e.g. Organic Tomatoes"
                        onBlur={() => fetchMarketPrice(false)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t('quantityKg')}</label>
                    <input
                        type="number"
                        name="quantityKg"
                        value={formData.quantityKg}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                        placeholder="0"
                        required
                    />
                </div>
                <div className="space-y-2 relative">
                    <label className="text-sm font-medium text-gray-700 flex justify-between items-center">
                        {t('pricePerKg')}
                        <button
                            type="button"
                            onClick={() => fetchMarketPrice(true)}
                            className="text-xs text-green-600 font-bold hover:underline"
                        >
                            {t('getPriceSuggestion')}
                        </button>
                    </label>
                    <input
                        type="number"
                        name="pricePerKg"
                        value={formData.pricePerKg}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${marketData && parseFloat(formData.pricePerKg) > marketData.base_price * 1.25
                            ? 'border-amber-300 focus:ring-amber-500/20 focus:border-amber-500'
                            : 'border-gray-200 focus:ring-green-500/20 focus:border-green-500'
                            }`}
                        placeholder="0.00"
                        required
                    />

                    {/* Overpricing Advisory */}
                    {marketData && formData.pricePerKg && parseFloat(formData.pricePerKg) > marketData.base_price * 1.25 && (
                        <div className="flex items-start gap-2 mt-2 text-amber-700 bg-amber-50 p-2 rounded-lg text-xs border border-amber-100">
                            <span className="text-lg">⚠️</span>
                            <div>
                                <p className="font-semibold">{t('priceAdvisory')}</p>
                                <p>{t('priceAdvisoryMessage', { price: marketData.base_price })}</p>
                            </div>
                        </div>
                    )}
                    {/* Market Data (used for suggestion and advisory) */}
                    {suggestion && (
                        <div className="absolute top-full left-0 right-0 z-10 mt-2 p-4 bg-green-50 border border-green-200 rounded-xl shadow-lg animate-in slide-in-from-top-2">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-green-800 bg-green-100 px-2 py-0.5 rounded-full ring-1 ring-green-600/20">
                                    {t('weeklyMarketReference')}
                                </span>
                                <button type="button" onClick={() => setSuggestion(null)} className="text-green-800 hover:text-green-900">&times;</button>
                            </div>
                            <div className="text-sm text-gray-800 mb-1">
                                <span className="font-semibold block text-green-900 pb-1">{t('found')}: {suggestion.crop}</span>
                                {t('suggestedFarmGatePrice')}: <span className="font-bold">₹{suggestion.base_price}</span> / {suggestion.unit}
                            </div>
                            <div className="text-xs text-gray-500 mb-3">
                                {t('retailRange')}: ₹{suggestion.retail_range}
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, pricePerKg: suggestion.base_price }));
                                    setSuggestion(null);
                                }}
                                className="w-full py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                            >
                                {t('applyPrice')}
                            </button>
                            <p className="text-[10px] text-gray-400 mt-2 italic border-t border-green-100 pt-1">
                                {t('basedOnGovtData')}
                            </p>
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t('harvestDate')}</label>
                    <input
                        type="date"
                        name="harvestDate"
                        value={formData.harvestDate}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                        required
                    />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t('location')}</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                        placeholder="Enter farm location"
                        required
                    />
                </div>
                <div className="md:col-span-2">

                </div>
            </div>

            <div className="flex gap-4 mt-8">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-gray-200"
                >
                    {loading ? t('loading') : (editingProduct ? t('save') : t('submit'))}
                </button>
                {editingProduct && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 bg-white text-gray-700 py-3 px-6 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all"
                    >
                        {t('cancel')}
                    </button>
                )}
            </div>
        </form>
    );
};

export default AddProductForm;
