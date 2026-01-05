'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EmailTemplateEditor from '@/components/EmailTemplateEditor'
import AdminSessionStatus from '@/components/AdminSessionStatus'

type TemplateType = 'CODE_CREATED' | 'ADMIN_WIN_NOTIFICATION' | 'WINNER_CONFIRMATION'

const TEMPLATE_TABS = [
  {
    type: 'CODE_CREATED' as TemplateType,
    label: 'Code Created',
    description: 'Sent to customers when they receive a spin code'
  },
  {
    type: 'ADMIN_WIN_NOTIFICATION' as TemplateType,
    label: 'Admin Alert',
    description: 'Sent to admin when someone wins a prize'
  },
  {
    type: 'WINNER_CONFIRMATION' as TemplateType,
    label: 'Winner Confirmation',
    description: 'Sent to winners after they spin'
  }
]

export default function EmailTemplatesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TemplateType>('CODE_CREATED')

  return (
    <div className="min-h-screen p-8">
      <AdminSessionStatus />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-gold-400 hover:text-gold-300 mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Admin
          </button>
          
          <h1 className="text-4xl font-bold text-gold-300 mb-2">
            Email Templates
          </h1>
          <p className="text-gray-300 text-lg">
            Customize the emails sent by your system. Use variables like <code className="px-2 py-1 bg-navy-800 rounded text-gold-400">{'{{customer_name}}'}</code> to personalize messages.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gold-400/30">
            <nav className="-mb-px flex gap-6">
              {TEMPLATE_TABS.map((tab) => (
                <button
                  key={tab.type}
                  onClick={() => setActiveTab(tab.type)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.type
                      ? 'border-gold-400 text-gold-300'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-base font-semibold">{tab.label}</span>
                    <span className="text-xs font-normal mt-1">{tab.description}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-navy-800/20 backdrop-blur-sm border-2 border-gold-400/30 rounded-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gold-300 mb-2">
              {TEMPLATE_TABS.find(t => t.type === activeTab)?.label} Email
            </h2>
            <p className="text-gray-400">
              {TEMPLATE_TABS.find(t => t.type === activeTab)?.description}
            </p>
          </div>

          <EmailTemplateEditor 
            key={activeTab}
            templateType={activeTab}
          />
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-navy-800/20 backdrop-blur-sm border border-gold-400/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gold-300 mb-3">
            💡 Tips for Email Templates
          </h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-gold-400 mt-1">•</span>
              <span>Use variables (e.g., <code className="text-gold-400">{'{{customer_name}}'}</code>) to personalize emails</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-400 mt-1">•</span>
              <span>Click "Available Variables" to see all options for the current template</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-400 mt-1">•</span>
              <span>Use "Preview Email" to see how your email will look with sample data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-400 mt-1">•</span>
              <span>Disable a template to temporarily stop sending that type of email</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold-400 mt-1">•</span>
              <span>All templates are mobile-responsive automatically</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
