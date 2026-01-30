import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { Users, TrendingUp, ShieldCheck, LogOut, PlusCircle, Package } from 'lucide-react';

const GroupSellingSection = ({ refreshTrigger, onGroupAction }) => {
    const { t } = useTranslation();
    const [activeGroups, setActiveGroups] = useState([]);
    const [myProducts, setMyProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [groupsRes, productsRes] = await Promise.all([
                api.get('/group-listings/my-groups'),
                api.get('/products/my')
            ]);

            setActiveGroups(groupsRes.data);
            setMyProducts(productsRes.data);
        } catch (error) {
            console.error("Error fetching group data:", error);
        } finally {
            setLoading(false);
        }
    };

    const joinedProducts = myProducts.filter(p => p.isGroupEligible);
    const eligibleProducts = myProducts.filter(p => !p.isGroupEligible);

    useEffect(() => {
        fetchData();
    }, [refreshTrigger]);

    const handleJoin = async (product) => {
        if (!window.confirm(t('confirmJoinBody').replace('{quantity}', product.quantityKg).replace('{crop}', product.cropName).replace('{location}', product.location))) {
            return;
        }

        try {
            await api.post('/group-listings/join', { productId: product._id });
            if (onGroupAction) onGroupAction(); // Trigger parent refresh
            fetchData();
        } catch (error) {
            console.error(error);
            alert(t('error'));
        }
    };

    const handleLeave = async (productId) => {
        if (!window.confirm(t('confirmLeaveBody'))) return;

        try {
            await api.post('/group-listings/leave', { productId });
            if (onGroupAction) onGroupAction(); // Trigger parent refresh
            fetchData();
        } catch (error) {
            console.error(error);
            alert(t('error'));
        }
    };

    if (loading && activeGroups.length === 0 && eligibleProducts.length === 0) {
        return <div className="p-8 text-center text-gray-500 animate-pulse">{t('loading')}</div>;
    }

    return (
        <section className="mt-12 bg-white rounded-3xl shadow-xl shadow-green-100 border border-green-100 overflow-hidden">
            {/* Header / Instructions */}
            <div className="bg-gradient-to-br from-green-900 via-emerald-900 to-green-800 p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Users className="w-8 h-8 text-green-200" />
                        {t('groupSellingTitle')}
                    </h2>
                    <p className="text-green-100 text-lg mb-8 max-w-2xl">
                        {t('groupSellingSubtitle')}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                            <TrendingUp className="w-6 h-6 text-green-300 mb-3" />
                            <h3 className="font-semibold text-white mb-1">{t('benefit1')}</h3>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                            <ShieldCheck className="w-6 h-6 text-blue-300 mb-3" />
                            <h3 className="font-semibold text-white mb-1">{t('benefit2')}</h3>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                            <LogOut className="w-6 h-6 text-orange-300 mb-3" />
                            <h3 className="font-semibold text-white mb-1">{t('benefit3')}</h3>
                        </div>
                    </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-green-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Active Joinings */}
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                        {t('activeGroups')}
                    </h3>

                    {joinedProducts.length === 0 ? (
                        <div className="bg-gray-50 rounded-2xl p-8 text-center border border-dashed border-gray-200">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">{t('notInGroup')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {joinedProducts.map(product => {
                                // Find the group this product is in
                                // Note: group.farmers[].product is an object because we populated it in backend
                                const group = activeGroups.find(g => g.farmers.some(f => f.product && f.product._id === product._id));

                                if (!group) return null; // Data synchronization lag or error

                                return (
                                    <div key={product._id} className="bg-white border border-green-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group-card">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-lg text-gray-900">{group.cropName}</h4>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">📍 {group.location}</p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
                                                    {t('joined')}
                                                </div>
                                                <span className="text-xs text-gray-400">ID: ...{product._id.slice(-4)}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{t('totalGroupQty')}</p>
                                                <p className="text-xl font-bold text-gray-900">{group.totalQuantityKg} kg</p>
                                            </div>
                                            <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                                                <p className="text-xs text-green-600 uppercase font-semibold mb-1">{t('myContribution')}</p>
                                                <p className="text-xl font-bold text-green-900">{product.quantityKg} kg</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500 block text-xs">{t('groupPrice')}</span>
                                                    <span className="font-bold text-gray-900">₹{group.pricePerKg}</span>
                                                </div>
                                                <div className="w-px h-8 bg-gray-200"></div>
                                                <div>
                                                    <span className="text-gray-500 block text-xs">{t('participants')}</span>
                                                    <span className="font-bold text-gray-900 flex items-center gap-1">
                                                        <Users size={14} /> {group.farmers.length}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleLeave(product._id)}
                                                className="text-red-500 hover:text-red-700 font-medium text-sm px-4 py-2 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 border border-transparent hover:border-red-100"
                                            >
                                                <LogOut size={16} />
                                                {t('leaveGroup')}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Eligible Products */}
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                        {t('eligibleProducts')}
                    </h3>
                    {eligibleProducts.length === 0 ? (
                        <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-500">
                            {t('noProductsFound')}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                            {eligibleProducts.map(product => (
                                <div key={product._id} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-gray-800">{product.cropName}</h4>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{product.quantityKg} kg</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">📍 {product.location}</p>

                                    <button
                                        onClick={() => handleJoin(product)}
                                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium text-sm shadow-green-200 shadow-md hover:shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <PlusCircle size={16} />
                                        {t('join')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default GroupSellingSection;
