import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import WinnerFulfillment from '@/components/WinnerFulfillment'

/**
 * Admin Winners Page
 * View all winners and export to CSV
 */

export default async function AdminWinnersPage() {
  const isAuthenticated = await isAdminAuthenticated()
  
  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  const winners = await prisma.winner.findMany({
    include: {
      prize: {
        select: {
          title: true,
        },
      },
      code: {
        select: {
          code: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { wonAt: 'desc' },
  })

  const totalWinners = winners.length
  const prizeSentCount = winners.filter((w: any) => w.prizeSent).length

  return (
    <div className="min-h-screen bg-navy-900 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <a href="/admin" className="text-gold-400 hover:text-gold-500 mb-2 inline-block">
            ← Back to Dashboard
          </a>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-serif font-bold text-gold-500 mb-2">
                Winners Log
              </h1>
              <p className="text-gray-400">
                Total Winners: <strong className="text-gold-400">{totalWinners}</strong>
                {' | '}
                Prizes Sent: <strong className="text-green-400">{prizeSentCount}</strong>
                {' | '}
                Pending: <strong className="text-yellow-400">{totalWinners - prizeSentCount}</strong>
              </p>
            </div>
            <a
              href="/api/admin/winners/export"
              className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-3 px-6 rounded-lg transition-colors"
            >
              📥 Export to CSV
            </a>
          </div>
        </header>

        {/* Winners Table */}
        <div className="bg-navy-800 border-2 border-gold-500/30 rounded-lg p-6">
          {winners.length === 0 ? (
            <p className="text-gray-400 text-center py-12">No winners yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold-500/30">
                    <th className="text-left py-3 px-4 text-gold-400 font-semibold">Date & Time</th>
                    <th className="text-left py-3 px-4 text-gold-400 font-semibold">Name/Email</th>
                    <th className="text-left py-3 px-4 text-gold-400 font-semibold">Code Used</th>
                    <th className="text-left py-3 px-4 text-gold-400 font-semibold">Prize Won</th>
                    <th className="text-left py-3 px-4 text-gold-400 font-semibold">Fulfillment</th>
                  </tr>
                </thead>
                <tbody>
                  {winners.map((winner: any) => (
                    <tr key={winner.id} className="border-b border-gold-500/10">
                      <td className="py-3 px-4 text-gray-300">
                        {new Date(winner.wonAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-white">
                        <div>
                          {winner.code.name && (
                            <div className="font-semibold">{winner.code.name}</div>
                          )}
                          <div className="text-sm text-gray-400">
                            {winner.code.email || '-'}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-white">
                        {winner.code.code}
                      </td>
                      <td className="py-3 px-4 text-gold-400 font-semibold">
                        {winner.prize.title}
                      </td>
                      <td className="py-3 px-4">
                        <WinnerFulfillment
                          winnerId={winner.id}
                          initialPrizeSent={winner.prizeSent}
                          initialNotes={winner.notes}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Export Instructions */}
        <div className="mt-6 bg-navy-800 border-2 border-blue-500/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-400 mb-2">
            📋 Prize Fulfillment Instructions
          </h3>
          <p className="text-gray-300 mb-2">
            Use the checkboxes to mark when prizes have been sent to winners. Add notes to track
            shipping information, delivery confirmation, or any special instructions.
          </p>
          <p className="text-gray-300">
            Export the winners list to CSV to get a complete report including fulfillment status
            and notes for your records.
          </p>
        </div>
      </div>
    </div>
  )
}
