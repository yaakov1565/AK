'use client'

import { useState } from 'react'

/**
 * Client Component for Deleting a Winner
 * Requires double confirmation for safety
 */

interface DeleteWinnerButtonProps {
  winnerId: string
  prizeName: string
  userName: string
}

export default function DeleteWinnerButton({ winnerId, prizeName, userName }: DeleteWinnerButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    // First confirmation
    if (!confirm(`Are you sure you want to delete this winner record?\n\nUser: ${userName}\nPrize: ${prizeName}\n\n⚠️ WARNING: This will restore the prize quantity!`)) {
      return
    }

    // Second confirmation
    const confirmText = 'DELETE'
    const userInput = prompt(
      `This action cannot be undone and will:\n` +
      `- Delete the winner record\n` +
      `- Restore 1 quantity to the prize "${prizeName}"\n\n` +
      `Type "${confirmText}" to confirm deletion:`
    )
    
    if (userInput !== confirmText) {
      alert('Deletion cancelled.')
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/winners/${winnerId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Winner deleted successfully. Prize quantity has been restored.')
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`Failed to delete winner: ${error.error || 'Unknown error'}`)
        setIsDeleting(false)
      }
    } catch (error) {
      alert('Failed to delete winner. Please try again.')
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      title="Delete this winner (requires double confirmation)"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}
