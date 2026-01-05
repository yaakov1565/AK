'use client'

import { useState, useEffect } from 'react'

interface EmailTemplate {
  id: string
  type: string
  subject: string
  htmlBody: string
  textBody: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Variable {
  name: string
  description: string
}

interface EmailTemplateEditorProps {
  templateType: string
  onSave?: () => void
}

export default function EmailTemplateEditor({ templateType, onSave }: EmailTemplateEditorProps) {
  const [template, setTemplate] = useState<EmailTemplate | null>(null)
  const [availableVariables, setAvailableVariables] = useState<Variable[]>([])
  const [subject, setSubject] = useState('')
  const [htmlBody, setHtmlBody] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showVariables, setShowVariables] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // Load template on mount or when type changes
  useEffect(() => {
    loadTemplate()
  }, [templateType])

  const loadTemplate = async () => {
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch(`/api/admin/email-templates/${templateType}`)
      const data = await res.json()
      
      if (data.template) {
        setTemplate(data.template)
        setSubject(data.template.subject)
        setHtmlBody(data.template.htmlBody)
        setIsActive(data.template.isActive)
      }
      
      if (data.availableVariables) {
        setAvailableVariables(data.availableVariables)
      }
    } catch (err) {
      setError('Failed to load template')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      const res = await fetch('/api/admin/email-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: templateType,
          subject,
          htmlBody,
          isActive
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setSuccess('Template saved successfully!')
        setTemplate(data.template)
        if (onSave) onSave()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to save template')
      }
    } catch (err) {
      setError('Failed to save template')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = async () => {
    setError('')
    
    try {
      const res = await fetch('/api/admin/email-templates/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: templateType,
          subject,
          htmlBody
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setPreviewHtml(data.preview.html)
        setShowPreview(true)
      } else {
        setError(data.error || 'Failed to preview template')
      }
    } catch (err) {
      setError('Failed to preview template')
      console.error(err)
    }
  }

  const insertVariable = (variableName: string) => {
    const variable = `{{${variableName}}}`
    setHtmlBody(htmlBody + variable)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Loading template...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-navy-800/40 backdrop-blur-sm border border-gold-400/20 rounded-lg">
        <div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="mr-3 h-5 w-5 text-gold-400 focus:ring-gold-400 focus:ring-offset-0 bg-navy-900 border-gold-400/40 rounded"
            />
            <span className="text-gold-300 font-medium">
              Enable this email template
            </span>
          </label>
          <p className="text-sm text-gray-400 mt-1 ml-8">
            {isActive ? 'Emails will be sent automatically' : 'Emails are disabled'}
          </p>
        </div>
      </div>

      {/* Subject Line */}
      <div>
        <label htmlFor="subject" className="block text-gold-300 mb-2 font-medium">
          Subject Line
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter email subject..."
          className="w-full px-4 py-3 bg-navy-900/60 backdrop-blur-sm border border-gold-400/60 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
        />
        <p className="mt-1 text-sm text-gray-400">
          Use variables like {'{{customer_name}}'} to personalize
       </p>
      </div>

      {/* HTML Body */}
      <div>
        <label htmlFor="htmlBody" className="block text-gold-300 mb-2 font-medium">
          Email Body (HTML)
        </label>
        <textarea
          id="htmlBody"
          value={htmlBody}
          onChange={(e) => setHtmlBody(e.target.value)}
          placeholder="Enter email HTML..."
          rows={15}
          className="w-full px-4 py-3 bg-navy-900/60 backdrop-blur-sm border border-gold-400/60 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent font-mono text-sm"
        />
      </div>

      {/* Available Variables */}
      <div className="border border-gold-400/30 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowVariables(!showVariables)}
          className="w-full flex items-center justify-between p-4 bg-navy-800/40 hover:bg-navy-800/60 text-gold-300 transition-colors"
        >
          <span className="font-medium">Available Variables</span>
          <svg
            className={`w-5 h-5 transition-transform ${showVariables ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showVariables && (
          <div className="p-4 bg-navy-900/40 space-y-2">
            {availableVariables.map((variable) => (
              <div
                key={variable.name}
                className="flex items-start justify-between p-3 bg-navy-800/40 rounded border border-gold-400/10 hover:border-gold-400/30 transition-colors"
              >
                <div className="flex-1">
                  <code className="text-gold-400 font-mono text-sm">
                    {'{{' + variable.name + '}}'}
                  </code>
                  <p className="text-gray-400 text-xs mt-1">{variable.description}</p>
                </div>
                <button
                  onClick={() => insertVariable(variable.name)}
                  className="ml-3 px-3 py-1 text-xs bg-gold-400/20 hover:bg-gold-400/30 text-gold-300 rounded transition-colors"
                >
                  Insert
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg text-green-300">
          {success}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handlePreview}
          className="flex-1 bg-navy-800 hover:bg-navy-700 text-gold-300 font-medium py-3 px-6 rounded-lg transition-colors border border-gold-400/40"
        >
          Preview Email
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-gold-400 hover:bg-gold-500 disabled:bg-gray-600 text-navy-900 font-bold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Template'}
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-navy-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gold-400/30">
              <h3 className="text-xl font-bold text-gold-300">Email Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div 
                className="bg-white rounded"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
