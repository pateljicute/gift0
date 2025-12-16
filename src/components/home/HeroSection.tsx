import React from 'react';
import Link from 'next/link';
import Button from '../ui/Button';

const HeroSection: React.FC = () => {
    return (
        <section className="relative overflow-hidden py-20 md:py-32">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" />
                <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-2000" />
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-amber-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-4000" />
            </div>

            <div className="container-custom relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/30 mb-6 animate-slide-down">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                        <span className="text-sm text-purple-300">New Collection Available</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl mb-6 animate-slide-up">
                        <span className="block text-white mb-2">Create Memories</span>
                        <span className="gradient-text">With Perfect Gifts</span>
                    </h1>

                    {/* Description */}
                    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto animate-slide-up">
                        Personalized mugs, beautiful frames, and unique gift items tailored just for you.
                        Make every moment special with our custom creations.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
                        <Link href="/products">
                            <Button variant="primary" size="lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                Shop Now
                            </Button>
                        </Link>
                        <Link href="#categories">
                            <Button variant="outline" size="lg">
                                Browse Categories
                            </Button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-slate-700/50">
                        <div className="animate-fade-in">
                            <div className="text-3xl md:text-4xl font-display font-bold gradient-text mb-1">1000+</div>
                            <div className="text-sm text-slate-400">Happy Customers</div>
                        </div>
                        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            <div className="text-3xl md:text-4xl font-display font-bold gradient-text mb-1">500+</div>
                            <div className="text-sm text-slate-400">Custom Designs</div>
                        </div>
                        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <div className="text-3xl md:text-4xl font-display font-bold gradient-text mb-1">24/7</div>
                            <div className="text-sm text-slate-400">Support</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
