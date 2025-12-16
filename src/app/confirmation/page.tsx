'use client';

export default function ConfirmationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <svg className="mx-auto h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        <h1 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Order Confirmed!
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Thank you for your order. We&apos;ve received your information and will process it shortly.
        </p>
        <div className="mt-10">
          <a
            href="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    </div>
  );
}