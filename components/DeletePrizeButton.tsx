'use client'

/**
 * Client Component for Prize Delete Button
 * Handles client-side confirmation before deletion
 */

interface DeletePrizeButtonProps {
  prizeId: string
  prizeTitle: string
}

export default function DeletePrizeButton({ prizeId, prizeTitle }: DeletePrizeButtonProps) {
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${prizeTitle}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/prizes/${prizeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh the page to show updated list
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`Failed to delete prize: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      alert('Failed to delete prize. Please try again.')
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
    >
      Delete
    </button>
  )
}
