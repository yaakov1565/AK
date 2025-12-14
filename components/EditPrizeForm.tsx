'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Client Component for Editing a Prize
 */

interface Prize {
  id: string
  title: string
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title') as string,
      imageUrl: formData.get('imageUrl') as string,
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
          <label className="block text-gray-300 mb-2">Prize Title *</label>
          <input
            type="text"
            name="title"
            required
            defaultValue={prize.title}
            className="w-full bg-navy-900 border border-gold-500/30 rounded px-4 py-2 text-white focus:border-gold-500 focus:outline-none"
            placeholder="e.g., Free Dessert"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Image URL (optional)</label>
          <input
            type="url"
            name="imageUrl"
            defaultValue={prize.imageUrl || ''}
            className="w-full bg-navy-900 border border-gold-500/30 rounded px-4 py-2 text-white focus:border-gold-500 focus:outline-none"
            placeholder="https://example.com/image.jpg"
          />
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
