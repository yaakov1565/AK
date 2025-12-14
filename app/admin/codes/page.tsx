import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import CodeActions from '@/components/CodeActions'

/**
 * Admin Codes Management Page
 * Generate and view one-time codes
 */

export default async function AdminCodesPage() {
  const isAuthenticated = await isAdminAuthenticated()
  
  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  const codes = await prisma.spinCode.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50, // Show last 50 codes
  })

  const totalCodes = await prisma.spinCode.count()
  const usedCodes = await prisma.spinCode.count({ where: { isUsed: true } })
  const availableCodes = totalCodes - usedCodes

  return (
    <div className="min-h-screen bg-navy-900 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <a href="/admin" className="text-gold-400 hover:text-gold-500 mb-2 inline-block">
            ← Back to Dashboard
          </a>
          <h1 className="text-4xl font-serif font-bold text-gold-500 mb-4">
            Code Management
          </h1>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-navy-800 border-2 border-gold-500/30 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Codes</p>
              <p className="text-3xl font-bold text-gold-400">{totalCodes}</p>
            </div>
            <div className="bg-navy-800 border-2 border-green-500/30 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Available</p>
              <p className="text-3xl font-bold text-green-400">{availableCodes}</p>
            </div>
            <div className="bg-navy-800 border-2 border-red-500/30 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Used</p>
              <p className="text-3xl font-bold text-red-400">{usedCodes}</p>
            </div>
          </div>

          {/* Generate Codes Form */}
          <div className="bg-navy-800 border-2 border-gold-500/30 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gold-400 mb-4">Generate New Codes</h2>
            <form action="/api/admin/codes/generate" method="POST" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quantity" className="block text-gray-300 mb-2">
                    Number of codes to generate
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    max="100"
                    defaultValue="1"
                    className="w-full px-4 py-2 bg-navy-900 border border-gold-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="names" className="block text-gray-300 mb-2">
                  Names <span className="text-red-400">*</span> (one per line)
                </label>
                <textarea
                  id="names"
                  name="names"
                  rows={5}
                  placeholder="Sarah Cohen&#10;David Levy&#10;Rachel Gold"
                  className="w-full px-4 py-2 bg-navy-900 border border-gold-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono text-sm"
                  required
                />
                <p className="text-gray-400 text-sm mt-2">
                  <strong className="text-red-400">Required:</strong> Enter one name per line. The number of entries must match the quantity of codes.
                </p>
              </div>
              <div>
                <label htmlFor="emails" className="block text-gray-300 mb-2">
                  Email addresses <span className="text-red-400">*</span> (one per line)
                </label>
                <textarea
                  id="emails"
                  name="emails"
                  rows={5}
                  placeholder="sarah@example.com&#10;david@example.com&#10;rachel@example.com"
                  className="w-full px-4 py-2 bg-navy-900 border border-gold-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono text-sm"
                  required
                />
                <p className="text-gray-400 text-sm mt-2">
                  <strong className="text-red-400">Required:</strong> Enter one email per line. The number of entries must match the quantity of codes.
                </p>
              </div>
              <button
                type="submit"
                className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Generate Codes
              </button>
            </form>
          </div>
        </header>

        {/* Codes List */}
        <div className="bg-navy-800 border-2 border-gold-500/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gold-400 mb-4">Recent Codes (Last 50)</h2>
          
          {codes.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No codes generated yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold-500/30">
                    <th className="text-left py-3 px-4 text-gold-400 font-semibold">Code</th>
                    <th className="text-left py-3 px-4 text-gold-400 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-gold-400 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 text-gold-400 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-gold-400 font-semibold">Created</th>
                    <th className="text-left py-3 px-4 text-gold-400 font-semibold">Used At</th>
                    <th className="text-left py-3 px-4 text-gold-400 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code: any) => (
                    <tr key={code.id} className="border-b border-gold-500/10">
                      <td className="py-3 px-4 font-mono text-white">{code.code}</td>
                      <td className="py-3 px-4 text-gray-300">{code.name || '-'}</td>
                      <td className="py-3 px-4 text-gray-300">{code.email || '-'}</td>
                      <td className="py-3 px-4">
                        {code.isUsed ? (
                          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                            Used
                          </span>
                        ) : (
                          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                            Available
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {new Date(code.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {code.usedAt ? new Date(code.usedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <CodeActions
                          codeId={code.id}
                          codeValue={code.code}
                          name={code.name}
                          email={code.email}
                          isUsed={code.isUsed}
                        />
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
