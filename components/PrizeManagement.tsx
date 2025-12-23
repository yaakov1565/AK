'use client'

import { useState } from 'react'

/**
 * Client Component for Prize Management
 * Handles adding individual prizes and CSV upload
 */

export default function PrizeManagement() {
  const [isAddingPrize, setIsAddingPrize] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [message, setMessage] = useState('')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    setMessage('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setImageUrl(result.url)
        setMessage('✓ Image uploaded successfully')
      } else {
        setMessage(`✗ ${result.error || 'Failed to upload image'}`)
      }
    } catch (error) {
      setMessage('✗ Error uploading image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleAddPrize = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    
    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      imageUrl: imageUrl || (formData.get('imageUrl') as string),
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
        setImageUrl('')
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
            <label className="block text-gray-300 mb-2">Prize Title (shown on wheel) *</label>
            <input
              type="text"
              name="title"
              required
              className="w-full bg-navy-900 border border-gold-500/30 rounded px-4 py-2 text-white focus:border-gold-500 focus:outline-none"
              placeholder="e.g., Dessert"
            />
            <small className="text-gray-500">Keep it short for the wheel display</small>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Prize Description (shown when won) *</label>
            <input
              type="text"
              name="description"
              required
              className="w-full bg-navy-900 border border-gold-500/30 rounded px-4 py-2 text-white focus:border-gold-500 focus:outline-none"
              placeholder="e.g., Free Dessert of Your Choice"
            />
            <small className="text-gray-500">Full description displayed on win screen</small>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Prize Image (optional)</label>
            
            {/* Image preview */}
            {imageUrl && (
              <div className="mb-4">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-gold-500/30"
                />
              </div>
            )}
            
            {/* Upload button */}
            <label className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer mb-2">
              {isUploadingImage ? 'Uploading...' : '📤 Upload Image'}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploadingImage}
                className="hidden"
              />
            </label>
            
            <span className="text-gray-500 text-sm ml-4">or</span>
            
            {/* URL input */}
            <input
              type="text"
              name="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full mt-2 bg-navy-900 border border-gold-500/30 rounded px-4 py-2 text-white focus:border-gold-500 focus:outline-none"
              placeholder="Paste image URL here"
            />
            <small className="text-gray-500">Upload a file or paste an image URL</small>
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
                defaultValue="30"
                className="w-full bg-navy-900 border border-gold-500/30 rounded px-4 py-2 text-white focus:border-gold-500 focus:outline-none"
                placeholder="30"
              />
              <small className="text-gray-500">Higher = More likely to win (default: 30)</small>
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
