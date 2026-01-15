'use client'

/**
 * Client component for video access actions (delete)
 */

interface VideoAccessActionsProps {
  id: string
  email: string
}

export default function VideoAccessActions({ id, email }: VideoAccessActionsProps) {
  const handleDelete = async () => {
    if (!confirm(`Remove ${email} from whitelist?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/video-access/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Reload the page to show updated list
        window.location.reload()
      } else {
        alert('Failed to remove email')
      }
    } catch (error) {
      console.error('Error removing email:', error)
      alert('Failed to remove email')
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-400 hover:text-red-300 text-sm transition-colors"
    >
      Remove
    </button>
  )
}
