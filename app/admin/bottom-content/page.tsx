import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import BottomContentManager from '@/components/BottomContentManager'

/**
 * Admin Bottom Content Management Page
 * Manage advertisements and sponsor logos
 */

export default async function BottomContentAdminPage() {
  const isAuthenticated = await isAdminAuthenticated()
  
  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-navy-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <a href="/admin" className="text-gold-400 hover:text-gold-500 mb-2 inline-block">
            ← Back to Dashboard
          </a>
          <h1 className="text-4xl font-bold text-gold-500">Bottom Content Management</h1>
        </div>
        
        <BottomContentManager />
      </div>
    </div>
  )
}
