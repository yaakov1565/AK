'use client'

/**
 * Winner Fulfillment Component
 * Shows checkbox and notes for prize fulfillment tracking
 */

import { useState } from 'react'

interface WinnerFulfillmentProps {
  winnerId: string
  initialPrizeSent: boolean
  initialNotes: string | null
}

export default function WinnerFulfillment({
  winnerId,
  initialPrizeSent,
  initialNotes,
}: WinnerFulfillmentProps) {
  const [prizeSent, setPrizeSent] = useState(initialPrizeSent)
  const [notes, setNotes] = useState(initialNotes || '')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleCheckboxChange = async (checked: boolean) => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/winners/${winnerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prizeSent: checked }),
      })

      if (res.ok) {
        setPrizeSent(checked)
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      console.error('Update error:', error)
      alert('Failed to update status')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotes = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/winners/${winnerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })

      if (res.ok) {
        setIsEditing(false)
      } else {
        alert('Failed to save notes')
      }
    } catch (error) {
      console.error('Save notes error:', error)
      alert('Failed to save notes')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      {/* Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`sent-${winnerId}`}
          checked={prizeSent}
          onChange={(e) => handleCheckboxChange(e.target.checked)}
          disabled={isSaving}
          className="w-4 h-4 text-gold-500 bg-navy-700 border-gold-500/50 rounded focus:ring-gold-500 focus:ring-2 disabled:opacity-50 cursor-pointer"
        />
        <label
          htmlFor={`sent-${winnerId}`}
          className={`text-sm cursor-pointer ${
            prizeSent ? 'text-green-400 font-semibold' : 'text-gray-400'
          }`}
        >
          {prizeSent ? '✓ Prize Sent' : 'Not Sent'}
        </label>
      </div>

      {/* Notes */}
      <div>
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about prize fulfillment..."
              rows={2}
              className="w-full px-2 py-1 bg-navy-900 border border-gold-500/30 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="text-xs bg-gold-500 hover:bg-gold-600 disabled:bg-gray-600 text-navy-900 px-3 py-1 rounded transition-colors font-semibold"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setNotes(initialNotes || '')
                  setIsEditing(false)
                }}
                disabled={isSaving}
                className="text-xs bg-navy-700 hover:bg-navy-600 disabled:bg-gray-600 text-gray-300 px-3 py-1 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            {notes ? (
              <p className="text-xs text-gray-300 italic">{notes}</p>
            ) : (
              <p className="text-xs text-gray-500">No notes</p>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-gold-500 hover:text-gold-400 transition-colors"
            >
              {notes ? 'Edit' : 'Add Note'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
