'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { Category } from '@/data/types';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, categories = [] }) => {
    const { isAdmin } = useAuth();
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const navLinks = categories.map((cat) => ({
        name: cat.name,
        href: `/categories/${cat.slug}`,
    }));

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Menu Panel */}
            <div className="absolute top-0 right-0 bottom-0 w-full max-w-sm glass-strong animate-slide-right">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <h2 className="text-xl font-display font-bold gradient-text">Menu</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="p-6">
                    <div className="space-y-4">
                        <Link
                            href="/"
                            onClick={onClose}
                            className="block py-3 px-4 rounded-lg text-white hover:bg-white/5 transition-colors font-medium"
                        >
                            Home
                        </Link>

                        {isAdmin && (
                            <Link
                                href="/admin"
                                onClick={onClose}
                                className="block py-3 px-4 rounded-lg text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition-colors font-medium border border-purple-500/20"
                            >
                                Admin Panel
                            </Link>
                        )}

                        <div className="border-t border-slate-700 pt-4">
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-3">Categories</p>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={onClose}
                                    className="block py-3 px-4 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="border-t border-slate-700 pt-4">
                            <Link
                                href="/profile"
                                onClick={onClose}
                                className="block py-3 px-4 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                My Profile
                            </Link>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default MobileMenu;
