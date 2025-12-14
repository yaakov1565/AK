'use client'

import { useState } from 'react'

/**
 * Client Component for Code Actions (Edit/Delete)
 */

interface CodeActionsProps {
  codeId: string
  codeValue: string
  name: string | null
  email: string | null
  isUsed: boolean
}

export default function CodeActions({ codeId, codeValue, name, email, isUsed }: CodeActionsProps) {
  const generateEmailLink = () => {
    const recipient = email || ''
    const recipientName = name || 'Supporter'
    const subject = encodeURIComponent('Congratulations! Your Ateres Kallah Prize Code')
    const body = encodeURIComponent(
      `Dear ${recipientName},\n\nCongratulations on reaching $1,000 in your fundraising campaign!\n\nHere is your exclusive prize code for the Ateres Kallah Spin to Win:\n\nCode: ${codeValue}\n\nPlease visit our prize wheel page to use your code and claim your prize.\n\nThank you for your incredible support!\n\nBest regards,\nAteres Kallah Team`
    )
    return `mailto:${recipient}?subject=${subject}&body=${body}`
  }

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(name || '')
  const [editEmail, setEditEmail] = useState(email || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEdit = async () => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/admin/codes/${codeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, email: editEmail }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`Failed to update code: ${error.error || 'Unknown error'}`)
        setIsSubmitting(false)
      }
    } catch (error) {
      alert('Failed to update code. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete code "${codeValue}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/codes/${codeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`Failed to delete code: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      alert('Failed to delete code. Please try again.')
    }
  }

  if (isEditing) {
    return (
      <div className="flex gap-2 items-center flex-wrap">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          placeholder="Name"
          className="bg-navy-900 border border-gold-500/30 rounded px-2 py-1 text-white text-sm w-32"
          disabled={isSubmitting}
        />
        <input
          type="email"
          value={editEmail}
          onChange={(e) => setEditEmail(e.target.value)}
          placeholder="Email"
          className="bg-navy-900 border border-gold-500/30 rounded px-2 py-1 text-white text-sm w-40"
          disabled={isSubmitting}
        />
        <button
          onClick={handleEdit}
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={() => setIsEditing(false)}
          disabled={isSubmitting}
          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <a
        href={generateEmailLink()}
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors inline-block"
        title="Send congratulations email"
      >
        📧 Email
      </a>
      <button
        onClick={() => setIsEditing(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
      >
        Edit
      </button>
      {!isUsed && (
        <button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          Delete
        </button>
      )}
    </div>
  )
}
