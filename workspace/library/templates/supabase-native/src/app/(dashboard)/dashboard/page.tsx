import { createSSRClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back, {profile?.full_name || user?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-2">Account Status</h3>
          <p className="text-2xl font-bold text-green-600">
            {profile?.subscription_status || 'Free'}
          </p>
        </div>

        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-2">Plan</h3>
          <p className="text-2xl font-bold">
            {profile?.subscription_plan || 'Starter'}
          </p>
        </div>

        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-2">Member Since</h3>
          <p className="text-2xl font-bold">
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString()
              : '-'}
          </p>
        </div>
      </div>

      <div className="p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <a
            href="/dashboard/settings"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Settings
          </a>
          <a
            href="/mfa-setup"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Setup MFA
          </a>
          <a
            href="/dashboard/billing"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Billing
          </a>
        </div>
      </div>
    </div>
  )
}
