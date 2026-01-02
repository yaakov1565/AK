import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import PrizeManagement from '@/components/PrizeManagement'
import PrizesList from '@/components/PrizesList'

/**
 * Admin Prizes Management Page
 * Create, edit, and delete prizes
 */

export default async function AdminPrizesPage() {
  const isAuthenticated = await isAdminAuthenticated()
  
  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  const prizes = await prisma.prize.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-navy-900 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <a href="/admin" className="text-gold-400 hover:text-gold-500 mb-2 inline-block">
            ← Back to Dashboard
          </a>
          <h1 className="text-4xl font-serif font-bold text-gold-500">
            Prize Management
          </h1>
        </header>

        {/* Prize Management Actions */}
        <PrizeManagement />

        {/* Prizes List with Search and Sort */}
        <div className="mt-8">
          <PrizesList initialPrizes={prizes} />
        </div>
      </div>
    </div>
  )
}
