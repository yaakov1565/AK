'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Client Component for Editing a Prize
 */

interface Prize {
  id: string
  title: string
  description: string
  imageUrl: string | null
  quantityTotal: number
  quantityRemaining: number
  weight: number
}

interface EditPrizeFormProps {
  prize: Prize
}

export default function EditPrizeForm({ prize }: EditPrizeFormProps) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imageUrl, setImageUrl] = useState(prize.imageUrl || '')

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      imageUrl: imageUrl,
      quantityTotal: parseInt(formData.get('quantityTotal') as string),
      weight: parseInt(formData.get('weight') as string),
    }

    try {
      const response = await fetch(`/api/prizes/${prize.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setMessage('Prize updated successfully!')
        setTimeout(() => router.push('/admin/prizes'), 1000)
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error || 'Failed to update prize'}`)
        setIsSubmitting(false)
      }
    } catch (error) {
      setMessage('Error: Failed to update prize')
      setIsSubmitting(false)
    }
  }

  const wonCount = prize.quantityTotal - prize.quantityRemaining

  return (
    <div className="bg-navy-800 border-2 border-gold-500/30 rounded-lg p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-300 mb-2">Prize Title (shown on wheel) *</label>
          <input
            type="text"
            name="title"
            required
            defaultValue={prize.title}
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
            defaultValue={prize.description}
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
            <label className="block text-gray-300 mb-2">Total Quantity *</label>
            <input
              type="number"
              name="quantityTotal"
              required
              min={wonCount}
              defaultValue={prize.quantityTotal}
              className="w-full bg-navy-900 border border-gold-500/30 rounded px-4 py-2 text-white focus:border-gold-500 focus:outline-none"
            />
            <small className="text-gray-500">
              {wonCount > 0 ? `Minimum: ${wonCount} (already won)` : 'Must be at least 1'}
            </small>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Weight *</label>
            <input
              type="number"
              name="weight"
              required
              min="1"
              defaultValue={prize.weight}
              className="w-full bg-navy-900 border border-gold-500/30 rounded px-4 py-2 text-white focus:border-gold-500 focus:outline-none"
            />
            <small className="text-gray-500">Higher = More likely to win</small>
          </div>
        </div>

        <div className="bg-navy-900/50 border border-gold-500/20 rounded-lg p-4">
          <h3 className="text-gold-400 font-semibold mb-2">Current Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <div className="text-gray-500">Total</div>
              <div className="text-lg font-bold text-gold-400">{prize.quantityTotal}</div>
            </div>
            <div>
              <div className="text-gray-500">Won</div>
              <div className="text-lg font-bold text-green-400">{wonCount}</div>
            </div>
            <div>
              <div className="text-gray-500">Remaining</div>
              <div className="text-lg font-bold text-yellow-400">{prize.quantityRemaining}</div>
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${
            message.includes('success') 
              ? 'bg-green-900/50 text-green-300 border border-green-500' 
              : 'bg-red-900/50 text-red-300 border border-red-500'
          }`}>
            {message}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gold-500 hover:bg-gold-600 disabled:bg-gray-600 text-navy-900 font-bold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/prizes')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
