import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import EditPrizeForm from '@/components/EditPrizeForm'

/**
 * Admin Edit Prize Page
 */

export default async function EditPrizePage({ params }: { params: { id: string } }) {
  const isAuthenticated = await isAdminAuthenticated()
  
  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  const prize = await prisma.prize.findUnique({
    where: { id: params.id },
  })

  if (!prize) {
    redirect('/admin/prizes')
  }

  return (
    <div className="min-h-screen bg-navy-900 p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <a href="/admin/prizes" className="text-gold-400 hover:text-gold-500 mb-2 inline-block">
            ← Back to Prizes
          </a>
          <h1 className="text-4xl font-serif font-bold text-gold-500">
            Edit Prize
          </h1>
        </header>

        <EditPrizeForm prize={prize} />
      </div>
    </div>
  )
}
