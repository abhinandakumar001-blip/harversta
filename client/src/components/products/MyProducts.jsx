import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

const MyProducts = ({ refreshTrigger, onEdit }) => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/products/my');
            setProducts(response.data);
        } catch (err) {
            console.error(err);
            setError(t('error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [refreshTrigger]);

    const handleDelete = async (id) => {
        if (window.confirm(t('delete') + '?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (err) {
                console.error(err);
                alert(t('error'));
            }
        }
    };

    const handleJoinGroup = async (id) => {
        try {
            await api.post('/group-listings/join', { productId: id });
            alert(t('joined'));
            fetchProducts();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || t('error'));
        }
    };

    if (loading) return <div className="text-center py-4">{t('loading')}</div>;
    if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">{t('myProducts')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product._id} className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-200 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-12 -mt-12 z-0 transition-transform group-hover:scale-110"></div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 pr-4 flex items-center justify-between">
                                {product.cropName}
                                {product.isGroupEligible && (
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-lg font-bold">
                                        {t('inGroup')}
                                    </span>
                                )}
                            </h3>

                            <div className="space-y-2 mb-6 text-sm text-gray-600">
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                                    <span className="font-medium text-gray-500">{t('quantityKg')}</span>
                                    <span className="font-bold text-gray-900">{product.quantityKg} kg</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                                    <span className="font-medium text-gray-500">{t('pricePerKg')}</span>
                                    <span className="font-bold text-green-700">₹{product.pricePerKg}</span>
                                </div>
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-gray-400">{t('location')}</span>
                                    <span>{product.location}</span>
                                </div>
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-gray-400">{t('harvestDate')}</span>
                                    <span>{new Date(product.harvestDate).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 mb-3">
                                <button
                                    onClick={() => onEdit(product)}
                                    disabled={product.isGroupEligible}
                                    className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={product.isGroupEligible ? "Leave group to edit" : ""}
                                >
                                    {t('edit')}
                                </button>
                                <button
                                    onClick={() => handleDelete(product._id)}
                                    disabled={product.isGroupEligible}
                                    className="flex-1 bg-white border border-red-100 text-red-600 py-2 px-3 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={product.isGroupEligible ? "Leave group to delete" : ""}
                                >
                                    {t('delete')}
                                </button>
                            </div>

                            <div>

                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {products.length === 0 && <p className="text-gray-500 text-center py-8">No products found.</p>}
        </div>
    );
};

export default MyProducts;
