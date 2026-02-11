import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">
          Supabase Native SaaS
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Next.js 15 + Supabase Auth + RLS + Stripe
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            Register
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">🔐 Native Auth</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Supabase Auth with SSR, MFA support, and secure session management
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">🛡️ Row Level Security</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Database-level security policies for complete data isolation
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">💳 Stripe Payments</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Integrated subscription billing with webhooks
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
