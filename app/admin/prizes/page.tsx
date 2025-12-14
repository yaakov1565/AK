import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import DeletePrizeButton from '@/components/DeletePrizeButton'
import PrizeManagement from '@/components/PrizeManagement'

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

        {/* Prizes List */}
        <div className="space-y-4 mt-8">
          {prizes.length === 0 ? (
            <div className="bg-navy-800 border-2 border-gold-500/30 rounded-lg p-12 text-center">
              <p className="text-gray-400 text-lg mb-4">No prizes yet</p>
              <a
                href="/admin/prizes/new"
                className="inline-block bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Add Your First Prize
              </a>
            </div>
          ) : (
            prizes.map((prize) => (
              <div
                key={prize.id}
                className="bg-navy-800 border-2 border-gold-500/30 rounded-lg p-6 flex items-center gap-6"
              >
                {prize.imageUrl && (
                  <img
                    src={prize.imageUrl}
                    alt={prize.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gold-400 mb-2">
                    {prize.title}
                  </h3>
                  <div className="flex gap-6 text-sm text-gray-300">
                    <span>Remaining: <strong className="text-gold-400">{prize.quantityRemaining}</strong> / {prize.quantityTotal}</span>
                    <span>Weight: <strong className="text-gold-400">{prize.weight}</strong></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/admin/prizes/edit/${prize.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Edit
                  </a>
                  <DeletePrizeButton prizeId={prize.id} prizeTitle={prize.title} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
