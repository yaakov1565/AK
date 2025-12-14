'use client'

import { useState } from 'react'

/**
 * Client Component for Prize Management
 * Handles adding individual prizes and CSV upload
 */

export default function PrizeManagement() {
  const [isAddingPrize, setIsAddingPrize] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAddPrize = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    
    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title') as string,
      imageUrl: formData.get('imageUrl') as string,
      quantityTotal: parseInt(formData.get('quantityTotal') as string),
      weight: parseInt(formData.get('weight') as string),
    }

    try {
      const response = await fetch('/api/prizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setMessage('Prize added successfully!')
        setIsAddingPrize(false)
        setTimeout(() => window.location.reload(), 1000)
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error || 'Failed to add prize'}`)
      }
    } catch (error) {
      setMessage('Error: Failed to add prize')
    }
  }

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setMessage('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/admin/prizes/upload-csv', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(`✓ ${result.message}`)
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMessage(`✗ ${result.error || 'Failed to upload CSV'}`)
      }
    } catch (error) {
      setMessage('✗ Error uploading CSV file')
    } finally {
      setIsUploading(false)
      e.target.value = '' // Reset file input
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-4 flex-wrap">
        <button
          onClick={() => setIsAddingPrize(!isAddingPrize)}
          className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {isAddingPrize ? '✕ Cancel' : '+ Add Prize'}
        </button>

        <label className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors cursor-pointer inline-block">
          {isUploading ? 'Uploading...' : '📤 Upload CSV'}
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>

        <a
          href="/example-prizes.csv"
          download
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors inline-block"
        >
          ⬇ Download Example CSV
        </a>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.startsWith('✓') || message.includes('success') 
            ? 'bg-green-900/50 text-green-300 border border-green-500' 
            : 'bg-red-900/50 text-red-300 border border-red-500'
        }`}>
          {message}
        </div>
      )}

      {/* Add Prize Form */}
      {isAddingPrize && (
        <form onSubmit={handleAddPrize} className="bg-navy-800 border-2 border-gold-500/30 rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-bold text-gold-400 mb-4">Add New Prize</h3>
          
          <div>
            <label className="block text-gray-300 mb-2">Prize Title *</label>
            <input
              type="text"
              name="title"
              required
              className="w-full bg-navy-900 border border-gold-500/30 rounded px-4 py-2 text-white focus:border-gold-500 focus:outline-none"
              placeholder="e.g., Free Dessert"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Image URL (optional)</label>
            <input
              type="url"
              name="imageUrl"
              className="w-full bg-navy-900 border border-gold-500/30 rounded px-4 py-2 text-white focus:border-gold-500 focus:outline-none"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Quantity *</label>
              <input
                type="number"
                name="quantityTotal"
                required
                min="1"
                className="w-full bg-navy-900 border border-gold-500/30 rounded px-4 py-2 text-white focus:border-gold-500 focus:outline-none"
                placeholder="50"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Weight *</label>
              <input
                type="number"
                name="weight"
                required
                min="1"
                className="w-full bg-navy-900 border border-gold-500/30 rounded px-4 py-2 text-white focus:border-gold-500 focus:outline-none"
                placeholder="30"
              />
              <small className="text-gray-500">Higher = More likely to win</small>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Add Prize
          </button>
        </form>
      )}
    </div>
  )
}
