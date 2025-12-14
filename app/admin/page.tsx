import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import AdminSessionStatus from '@/components/AdminSessionStatus'

/**
 * Admin Dashboard Home
 * Redirects to login if not authenticated
 */

export default async function AdminPage() {
  const isAuthenticated = await isAdminAuthenticated()
  
  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  // Fetch stats
  const prizes = await prisma.prize.findMany({
    select: {
      quantityTotal: true,
      quantityRemaining: true,
    },
  })

  const totalPrizes = prizes.reduce((sum: number, p: { quantityTotal: number }) => sum + p.quantityTotal, 0)
  const remainingPrizes = prizes.reduce((sum: number, p: { quantityRemaining: number }) => sum + p.quantityRemaining, 0)
  const wonPrizes = totalPrizes - remainingPrizes

  const stats = [
    {
      label: 'Total Prizes',
      value: totalPrizes,
      icon: '🎁',
      color: 'text-blue-400',
    },
    {
      label: 'Prizes Won',
      value: wonPrizes,
      icon: '🏆',
      color: 'text-green-400',
    },
    {
      label: 'Prizes Remaining',
      value: remainingPrizes,
      icon: '📦',
      color: 'text-yellow-400',
    },
  ]

  return (
    <div className="min-h-screen bg-navy-900 p-8">
      <AdminSessionStatus />
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-gold-500 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Ateres Kallah – Spin to Win
          </p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-navy-800 border-2 border-gold-500/30 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <span className={`text-4xl font-bold ${stat.color}`}>
                  {stat.value}
                </span>
              </div>
              <p className="text-gray-400 text-sm uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/admin/prizes"
            className="bg-navy-800 border-2 border-gold-500/30 rounded-lg p-8 hover:border-gold-500 transition-all duration-200 transform hover:scale-105"
          >
            <h2 className="text-2xl font-bold text-gold-400 mb-2">
              🎁 Prizes
            </h2>
            <p className="text-gray-300">
              Manage prizes, inventory, and odds
            </p>
          </a>

          <a
            href="/admin/codes"
            className="bg-navy-800 border-2 border-gold-500/30 rounded-lg p-8 hover:border-gold-500 transition-all duration-200 transform hover:scale-105"
          >
            <h2 className="text-2xl font-bold text-gold-400 mb-2">
              🎟️ Codes
            </h2>
            <p className="text-gray-300">
              Generate and manage one-time codes
            </p>
          </a>

          <a
            href="/admin/winners"
            className="bg-navy-800 border-2 border-gold-500/30 rounded-lg p-8 hover:border-gold-500 transition-all duration-200 transform hover:scale-105"
          >
            <h2 className="text-2xl font-bold text-gold-400 mb-2">
              🏆 Winners
            </h2>
            <p className="text-gray-300">
              View winners log and export to CSV
            </p>
          </a>
        </div>

        {/* Logout */}
        <div className="mt-12">
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
