'use client'

import { useState } from 'react'
import {
  LayoutDashboard, Users, ShoppingCart, Settings,
  Menu, X, TrendingUp, DollarSign, UserPlus, Activity,
  BarChart3, Bell, Search, Moon, Sun
} from 'lucide-react'
import { cn, formatNumber, formatCurrency } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Utilisateurs', icon: Users, href: '/users' },
  { name: 'Commandes', icon: ShoppingCart, href: '/orders' },
  { name: 'Analytiques', icon: BarChart3, href: '/analytics' },
  { name: 'Parametres', icon: Settings, href: '/settings' },
]

const stats = [
  { name: 'Revenus', value: 45231, icon: DollarSign, change: '+12.5%', color: 'text-green-600' },
  { name: 'Utilisateurs', value: 2350, icon: Users, change: '+18.2%', color: 'text-blue-600' },
  { name: 'Nouveaux clients', value: 124, icon: UserPlus, change: '+4.3%', color: 'text-purple-600' },
  { name: 'Taux conversion', value: 3.2, icon: Activity, change: '+2.1%', color: 'text-orange-600', suffix: '%' },
]

const recentOrders = [
  { id: '#12345', customer: 'Jean Dupont', amount: 249.99, status: 'Livre', date: '2024-01-15' },
  { id: '#12346', customer: 'Marie Martin', amount: 89.50, status: 'En cours', date: '2024-01-15' },
  { id: '#12347', customer: 'Pierre Durand', amount: 450.00, status: 'En attente', date: '2024-01-14' },
  { id: '#12348', customer: 'Sophie Bernard', amount: 125.75, status: 'Livre', date: '2024-01-14' },
  { id: '#12349', customer: 'Lucas Petit', amount: 299.00, status: 'Annule', date: '2024-01-13' },
]

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className={cn('min-h-screen', darkMode && 'dark')}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <aside className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform lg:translate-x-0 lg:static',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <div className="flex items-center justify-between h-16 px-6 border-b dark:border-gray-700">
            <span className="text-xl font-bold text-gray-800 dark:text-white">AdminPanel</span>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="p-4 space-y-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                <Menu className="w-6 h-6" />
              </button>
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Dashboard</h1>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
                <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stat.name}</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                        {stat.name === 'Revenus' ? formatCurrency(stat.value) : formatNumber(stat.value)}{stat.suffix || ''}
                      </p>
                    </div>
                    <div className={cn('p-3 rounded-lg bg-gray-100 dark:bg-gray-700', stat.color)}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 font-medium">{stat.change}</span>
                    <span className="text-gray-500">vs mois dernier</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent orders table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6 border-b dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Commandes recentes</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Montant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-white">{order.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{order.customer}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{formatCurrency(order.amount)}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            order.status === 'Livre' && 'bg-green-100 text-green-700',
                            order.status === 'En cours' && 'bg-blue-100 text-blue-700',
                            order.status === 'En attente' && 'bg-yellow-100 text-yellow-700',
                            order.status === 'Annule' && 'bg-red-100 text-red-700'
                          )}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
