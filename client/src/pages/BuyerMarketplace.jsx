import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import PlaceOrder from '../components/orders/PlaceOrder';
import PlaceBulkOrder from '../components/orders/PlaceBulkOrder';

const BuyerMarketplace = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [groups, setGroups] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [filters, setFilters] = useState({
        cropName: '',
        location: '',
        maxPrice: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, groupsRes] = await Promise.all([
                api.get('/products'),
                api.get('/group-listings')
            ]);
            setProducts(productsRes.data);
            setFilteredProducts(productsRes.data);
            setGroups(groupsRes.data);
            setFilteredGroups(groupsRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let pRes = products;
        let gRes = groups;

        if (filters.cropName) {
            pRes = pRes.filter(p => p.cropName.toLowerCase().includes(filters.cropName.toLowerCase()));
            gRes = gRes.filter(g => g.cropName.toLowerCase().includes(filters.cropName.toLowerCase()));
        }
        if (filters.location) {
            pRes = pRes.filter(p => p.location.toLowerCase().includes(filters.location.toLowerCase()));
            gRes = gRes.filter(g => g.location.toLowerCase().includes(filters.location.toLowerCase()));
        }
        if (filters.maxPrice) {
            pRes = pRes.filter(p => p.pricePerKg <= Number(filters.maxPrice));
            gRes = gRes.filter(g => g.pricePerKg <= Number(filters.maxPrice));
        }
        setFilteredProducts(pRes);
        setFilteredGroups(gRes);
    }, [filters, products, groups]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };


    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            <div className="bg-white border-b border-gray-100 shadow-sm mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <header className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('buyerMarketplace')}</h1>
                            <p className="text-gray-500 mt-2">Discover fresh produce from local farmers</p>
                        </div>
                    </header>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                name="cropName"
                                placeholder={t('filterByCrop')}
                                value={filters.cropName}
                                onChange={handleFilterChange}
                                className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                            />
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                name="location"
                                placeholder={t('filterByLocation')}
                                value={filters.location}
                                onChange={handleFilterChange}
                                className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                            />
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                name="maxPrice"
                                placeholder={t('maxPrice')}
                                value={filters.maxPrice}
                                onChange={handleFilterChange}
                                className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Bulk Listings */}
                {filteredGroups.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">{t('bulkListing')}</h2>
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{t('bulkSupplyBadge')}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredGroups.map(group => (
                                <div key={group._id} className="group bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-2xl font-bold text-gray-900">{group.cropName}</h3>
                                        <div className="bg-purple-200/50 text-purple-800 p-2 rounded-lg">
                                            📦
                                        </div>
                                    </div>
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between items-center py-2 border-b border-purple-100">
                                            <span className="text-gray-600">{t('pricePerKg')}</span>
                                            <span className="font-bold text-lg text-purple-900">₹{group.pricePerKg}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-purple-100">
                                            <span className="text-gray-600">Total Quantity</span>
                                            <span className="font-bold text-lg text-gray-900">{group.totalQuantityKg} kg</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-600">{t('location')}</span>
                                            <span className="text-gray-900">{group.location}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedGroup(group)}
                                        className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-medium hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all transform hover:-translate-y-0.5"
                                    >
                                        {t('placeOrder')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Individual Listings */}
                {filteredGroups.length > 0 && <div className="border-t border-gray-200 my-10"></div>}

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Individual Listings</h2>
                    <p className="text-gray-500">Direct from individual farmers</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? <div className="col-span-full py-12 text-center text-gray-500">{t('loading')}...</div> : filteredProducts.map(product => (
                        <div key={product._id} className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-green-200 transition-all duration-300 flex flex-col">
                            <div className="mb-4">
                                <span className="inline-block px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-md mb-2">Organic</span>
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{product.cropName}</h3>
                                <p className="text-sm text-gray-500">{product.farmer?.name || t('farmerName')}</p>
                            </div>

                            <div className="flex-1 space-y-2 mb-4 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>{t('pricePerKg')}:</span>
                                    <span className="font-bold text-gray-900">₹{product.pricePerKg}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Stock:</span>
                                    <span className="font-medium">{product.quantityKg} kg</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>{t('location')}:</span>
                                    <span className="truncate max-w-[100px]">{product.location}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedProduct(product)}
                                className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-green-600 hover:shadow-lg hover:shadow-green-100 transition-all"
                            >
                                {t('placeOrder')}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {!loading && filteredProducts.length === 0 && filteredGroups.length === 0 && (
                <div className="text-center py-20">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🌱</span>
                    </div>
                    <p className="text-gray-500 text-lg">{t('noProductsFound')}</p>
                </div>
            )}

            {selectedProduct && (
                <PlaceOrder
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onOrderPlaced={() => {
                        fetchData();
                        setSelectedProduct(null);
                    }}
                />
            )}

            {selectedGroup && (
                <PlaceBulkOrder
                    group={selectedGroup}
                    onClose={() => setSelectedGroup(null)}
                    onOrderPlaced={() => {
                        fetchData();
                        setSelectedGroup(null);
                    }}
                />
            )}
        </div>
    );
};

export default BuyerMarketplace;
