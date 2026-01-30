import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';

import { useAuth } from '../context/AuthContext';
import { Menu, X, Sprout } from 'lucide-react';

const Navbar = () => {
    const { t } = useTranslation();
    const { user, token, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    // Derived role
    const role = user?.role;

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-gradient-to-tr from-green-500 to-emerald-400 p-1.5 rounded-lg text-white transform group-hover:rotate-12 transition-transform duration-300">
                                <Sprout size={20} />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                                Harvesta
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <LanguageSelector />

                        {token ? (
                            <div className="flex items-center gap-4 bg-gray-50/50 px-4 py-1.5 rounded-full border border-gray-100">
                                {role === 'farmer' && (
                                    <Link to="/dashboard" className="text-gray-600 hover:text-green-600 font-medium transition-colors text-sm">{t('farmerDashboard')}</Link>
                                )}
                                {role === 'buyer' && (
                                    <>
                                        <Link to="/marketplace" className="text-gray-600 hover:text-green-600 font-medium transition-colors text-sm">{t('buyerMarketplace')}</Link>
                                        <Link to="/orders" className="text-gray-600 hover:text-green-600 font-medium transition-colors text-sm">{t('myOrders')}</Link>
                                    </>
                                )}
                                <div className="h-4 w-px bg-gray-200"></div>
                                <button
                                    onClick={logout}
                                    className="text-red-500 hover:text-red-600 font-medium text-sm transition-colors hover:bg-red-50 px-2 py-1 rounded"
                                >
                                    {t('logout')}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-gray-600 hover:text-green-600 font-medium transition-colors text-sm">
                                    {t('login')}
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2 rounded-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-green-200 transition-all transform hover:-translate-y-0.5"
                                >
                                    {t('register')}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <LanguageSelector />
                        <button
                            onClick={toggleMenu}
                            className="p-2 rounded-md text-gray-500 hover:text-green-600 hover:bg-gray-100 focus:outline-none transition-colors"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden absolute w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-xl z-40 animate-in slide-in-from-top-4 duration-200">
                    <div className="px-4 pt-2 pb-6 space-y-1">
                        {token ? (
                            <>
                                <div className="px-3 py-3 border-b border-gray-100 mb-2">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</span>
                                </div>
                                {role === 'farmer' && (
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all"
                                    >
                                        {t('farmerDashboard')}
                                    </Link>
                                )}
                                {role === 'buyer' && (
                                    <>
                                        <Link
                                            to="/marketplace"
                                            onClick={() => setIsOpen(false)}
                                            className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all"
                                        >
                                            {t('buyerMarketplace')}
                                        </Link>
                                        <Link
                                            to="/orders"
                                            onClick={() => setIsOpen(false)}
                                            className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all"
                                        >
                                            {t('myOrders')}
                                        </Link>
                                    </>
                                )}
                                <button
                                    onClick={() => { logout(); setIsOpen(false); }}
                                    className="w-full text-left mt-2 block px-3 py-3 rounded-lg text-base font-medium text-red-500 hover:bg-red-50 transition-all"
                                >
                                    {t('logout')}
                                </button>
                            </>
                        ) : (
                            <div className="pt-4 px-2 space-y-3">
                                <Link
                                    to="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
                                >
                                    {t('login')}
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center px-4 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-200"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
