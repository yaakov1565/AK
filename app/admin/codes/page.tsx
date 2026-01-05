import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import CodeActions from '@/components/CodeActions'
import CollapsibleSection from '@/components/CollapsibleSection'

/**
 * Admin Codes Management Page
 * Generate and view one-time codes
 */

export default async function AdminCodesPage({
  searchParams,
}: {
  searchParams: { success?: string; created?: string; sent?: string; skipped?: string }
}) {
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
          
          {/* Success Message */}
          {searchParams.success === 'upload' && (
            <div className="bg-green-900/30 border-2 border-green-500 rounded-lg p-4 mb-6">
              <h3 className="text-green-400 font-bold text-lg mb-2">✅ Upload Successful!</h3>
              <p className="text-green-300">
                <strong>{searchParams.created || 0}</strong> codes created,
                <strong> {searchParams.sent || 0}</strong> emails sent successfully
                {parseInt(searchParams.skipped || '0') > 0 && (
                  <span>, <strong>{searchParams.skipped}</strong> entries skipped</span>
                )}
              </p>
            </div>
          )}
          
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

          {/* CSV Upload Section */}
          <CollapsibleSection title="📁 Upload CSV File" defaultOpen={false}>
            <p className="text-gray-300 mb-4">Upload a CSV file to create multiple codes at once.</p>
            
            <div className="bg-navy-900/50 border border-gold-500/20 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-gray-300 text-sm"><strong>CSV Format:</strong></p>
                <a
                  href="/example-codes.csv"
                  download
                  className="text-gold-400 hover:text-gold-500 text-sm underline"
                >
                  Download Template
                </a>
              </div>
              <code className="text-gold-400 text-xs block bg-navy-900 p-3 rounded">
                name,emails,amount<br/>
                Sarah Cohen,sarah@example.com,$1,500<br/>
                David &amp; Rachel Levy,"david@example.com,rachel@example.com",$2,000<br/>
                Miriam Stein,"miriam@example.com,miriam.stein@gmail.com",$1,000
              </code>
              <p className="text-gray-400 text-xs mt-2">
                • <strong className="text-red-400">Only entries with $1,000+ will be processed</strong><br/>
                • Multiple emails per entry (use quotes and separate with ,) - all get same code<br/>
                • Duplicate emails are automatically skipped<br/>
                • Header row (name,emails,amount) is optional<br/>
                • Amount column is optional (defaults to $1,000)<br/>
                • Maximum 500 entries per upload
              </p>
            </div>

            <form action="/api/admin/codes/upload-csv" method="POST" encType="multipart/form-data">
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
                Upload & Generate Codes
              </button>
            </form>
          </CollapsibleSection>

          {/* Generate Codes Form (Manual) */}
          <CollapsibleSection title="✏️ Manual Code Generation" defaultOpen={false}>
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
          </CollapsibleSection>
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
