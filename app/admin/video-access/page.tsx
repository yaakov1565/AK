import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getAllEmailStats } from '@/lib/video-access'
import { prisma } from '@/lib/prisma'
import CollapsibleSection from '@/components/CollapsibleSection'
import VideoAccessActions from '@/components/VideoAccessActions'

/**
 * Admin Video Access Management Page
 * Manage email whitelist for video viewing
 */

export default async function AdminVideoAccessPage({
  searchParams,
}: {
  searchParams: { success?: string; added?: string }
}) {
  const isAuthenticated = await isAdminAuthenticated()
  
  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  // Get all video access records with view counts using the lib function
  const statsData = await getAllEmailStats('highlights-video')
  
  // Add id field by querying the access records
  const accessRecords = await prisma.videoAccess.findMany({
    select: { id: true, email: true }
  })
  
  const emailToId = Object.fromEntries(
    accessRecords.map(r => [r.email, r.id])
  )
  
  const stats = statsData.map(stat => ({
    id: emailToId[stat.email] || '',
    ...stat
  }))

  const totalEmails = stats.length
  const activeViewers = stats.filter(s => s.viewCount > 0).length
  const exhaustedViewers = stats.filter(s => s.remaining === 0).length

  return (
    <div className="min-h-screen bg-navy-900 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <a href="/admin" className="text-gold-400 hover:text-gold-500 mb-2 inline-block">
            ← Back to Dashboard
          </a>
          <h1 className="text-4xl font-serif font-bold text-gold-500 mb-4">
            Video Access Management
          </h1>
          
          {/* Success Message */}
          {searchParams.success === 'upload' && (
            <div className="bg-green-900/30 border-2 border-green-500 rounded-lg p-4 mb-6">
              <h3 className="text-green-400 font-bold text-lg mb-2">✅ Upload Successful!</h3>
              <p className="text-green-300">
                <strong>{searchParams.added || 0}</strong> emails added to video access whitelist
              </p>
            </div>
          )}
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-navy-800 border-2 border-gold-500/30 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Authorized</p>
              <p className="text-3xl font-bold text-gold-400">{totalEmails}</p>
            </div>
            <div className="bg-navy-800 border-2 border-blue-500/30 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Active Viewers</p>
              <p className="text-3xl font-bold text-blue-400">{activeViewers}</p>
            </div>
            <div className="bg-navy-800 border-2 border-red-500/30 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Views Exhausted</p>
              <p className="text-3xl font-bold text-red-400">{exhaustedViewers}</p>
            </div>
          </div>

          {/* CSV Upload Section */}
          <CollapsibleSection title="📁 Upload CSV File" defaultOpen={false}>
            <p className="text-gray-300 mb-4">Upload a CSV file to add multiple emails to the whitelist at once.</p>
            
            <div className="bg-navy-900/50 border border-gold-500/20 rounded-lg p-4 mb-4">
              <p className="text-gray-300 text-sm mb-2"><strong>CSV Format:</strong></p>
              <code className="text-gold-400 text-xs block bg-navy-900 p-3 rounded">
                email<br/>
                user1@example.com<br/>
                user2@example.com<br/>
                user3@example.com
              </code>
              <p className="text-gray-400 text-xs mt-2">
                • One email per line<br/>
                • Header row (email) is optional<br/>
                • All emails will get 3 views by default<br/>
                • Duplicate emails are automatically skipped<br/>
                • Maximum 1000 entries per upload
              </p>
            </div>

            <form action="/api/admin/video-access/upload-csv" method="POST" encType="multipart/form-data">
              <div className="mb-4">
                <label htmlFor="csvFile" className="block text-gray-300 mb-2">
                  Select CSV File
                </label>
                <input
                  type="file"
                  id="csvFile"
                  name="csvFile"
                  accept=".csv"
                  className="w-full px-4 py-2 bg-navy-900 border border-gold-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Upload Email List
              </button>
            </form>
          </CollapsibleSection>

          {/* Video Link */}
          <div className="bg-blue-900/20 border-2 border-blue-500/30 rounded-lg p-4 mt-6">
            <p className="text-blue-300 mb-2">
              <strong>Video Page:</strong> <a href="/highlights" target="_blank" className="text-blue-400 hover:text-blue-300 underline">/highlights</a>
            </p>
            <p className="text-gray-400 text-sm">
              This page is only accessible via direct link (no navigation button)
            </p>
          </div>
        </header>

        {/* Email Access List */}
        <div className="bg-navy-800 border-2 border-gold-500/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gold-400 mb-4">Authorized Emails</h2>
          
          {stats.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No emails authorized yet. Upload a CSV to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold-500/30">
                    <th className="text-left py-3 px-4 text-gold-400 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 text-gold-400 font-semibold">Max Views</th>
                    <th className="text-left py-3 px-4 text-gold-400 font-semibold">Views Used</th>
                    <th className="text-left py-3 px-4 text-gold-400 font-semibold">Remaining</th>
                    <th className="text-left py-3 px-4 text-gold-400 font-semibold">Last View</th>
                    <th className="text-left py-3 px-4 text-gold-400 font-semibold">Added</th>
                    <th className="text-left py-3 px-4 text-gold-400 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((stat) => (
                    <tr key={stat.id} className="border-b border-gold-500/10">
                      <td className="py-3 px-4 text-white">{stat.email}</td>
                      <td className="py-3 px-4 text-gray-300">{stat.maxViews}</td>
                      <td className="py-3 px-4 text-gray-300">{stat.viewCount}</td>
                      <td className="py-3 px-4">
                        {stat.remaining === 0 ? (
                          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                            Exhausted
                          </span>
                        ) : stat.viewCount > 0 ? (
                          <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm">
                            {stat.remaining}
                          </span>
                        ) : (
                          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                            {stat.remaining}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {stat.lastView ? new Date(stat.lastView).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {new Date(stat.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <VideoAccessActions id={stat.id} email={stat.email} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
