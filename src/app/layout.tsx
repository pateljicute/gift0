import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/contexts/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { getCategories } from '@/data/products';
import { AuthProvider } from '@/components/auth/AuthProvider';
import IncentiveProgressBar from '@/components/ui/IncentiveProgressBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gift Center | Shop',
  description: 'Your one-stop shop for personalized gifts.',
};

// Force dynamic rendering for layout to fetch new categories
export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <Header categories={categories} />
            <IncentiveProgressBar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer categories={categories} />
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}