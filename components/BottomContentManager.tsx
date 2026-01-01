'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

type DisplayType = 'NONE' | 'ADVERTISEMENT' | 'SPONSOR_LOGOS'

interface Advertisement {
  id: string
  imageUrl: string
  linkUrl: string | null
  isActive: boolean
}

interface Sponsor {
  id: string
  name: string
  logoUrl: string
  linkUrl: string | null
  order: number
  isActive: boolean
}

export default function BottomContentManager() {
  const [displayType, setDisplayType] = useState<DisplayType>('NONE')
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // Advertisement form
  const [adFile, setAdFile] = useState<File | null>(null)
  const [adLink, setAdLink] = useState('')

  // Sponsor form
  const [sponsorFiles, setSponsorFiles] = useState<FileList | null>(null)
  const [sponsorLink, setSponsorLink] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load settings
      const settingsRes = await fetch('/api/admin/bottom-content/settings')
      const settings = await settingsRes.json()
      setDisplayType(settings.displayType || 'NONE')

      // Load advertisements
      const adsRes = await fetch('/api/admin/advertisements')
      if (adsRes.ok) {
        const adsData = await adsRes.json()
        setAdvertisements(Array.isArray(adsData) ? adsData : [])
      } else {
        setAdvertisements([])
      }

      // Load sponsors
      const sponsorsRes = await fetch('/api/admin/sponsors')
      if (sponsorsRes.ok) {
        const sponsorsData = await sponsorsRes.json()
        setSponsors(Array.isArray(sponsorsData) ? sponsorsData : [])
      } else {
        setSponsors([])
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to load data:', error)
      setAdvertisements([])
      setSponsors([])
      setLoading(false)
    }
  }

  const updateDisplayType = async (newType: DisplayType) => {
    try {
      await fetch('/api/admin/bottom-content/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayType: newType })
      })
      setDisplayType(newType)
    } catch (error) {
      console.error('Failed to update display type:', error)
      alert('Failed to update display type')
    }
  }

  const uploadAdvertisement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adFile) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', adFile)
      if (adLink) formData.append('linkUrl', adLink)

      const res = await fetch('/api/admin/advertisements', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        setAdFile(null)
        setAdLink('')
        await loadData()
        alert('Advertisement uploaded successfully!')
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Failed to upload advertisement:', error)
      alert('Failed to upload advertisement')
    } finally {
      setUploading(false)
    }
  }

  const toggleAdvertisementActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/advertisements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })
      await loadData()
    } catch (error) {
      console.error('Failed to toggle advertisement:', error)
      alert('Failed to toggle advertisement')
    }
  }

  const deleteAdvertisement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return

    try {
      await fetch(`/api/admin/advertisements/${id}`, { method: 'DELETE' })
      await loadData()
    } catch (error) {
      console.error('Failed to delete advertisement:', error)
      alert('Failed to delete advertisement')
    }
  }

  const uploadSponsor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sponsorFiles || sponsorFiles.length === 0) return

    setUploading(true)
    try {
      let successCount = 0
      let failCount = 0

      // Upload each file
      for (let i = 0; i < sponsorFiles.length; i++) {
        const file = sponsorFiles[i]
        const formData = new FormData()
        formData.append('logo', file)
        if (sponsorLink) formData.append('linkUrl', sponsorLink)

        const res = await fetch('/api/admin/sponsors', {
          method: 'POST',
          body: formData
        })

        if (res.ok) {
          successCount++
        } else {
          failCount++
        }
      }

      setSponsorFiles(null)
      setSponsorLink('')
      
      // Reset the file input
      const fileInput = document.querySelector('input[type="file"][multiple]') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
      await loadData()
      
      if (failCount === 0) {
        alert(`Successfully uploaded ${successCount} sponsor logo${successCount > 1 ? 's' : ''}!`)
      } else {
        alert(`Uploaded ${successCount} logo(s). Failed to upload ${failCount} file(s).`)
      }
    } catch (error) {
      console.error('Failed to upload sponsors:', error)
      alert('Failed to upload sponsor logos')
    } finally {
      setUploading(false)
    }
  }

  const deleteSponsor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sponsor?')) return

    try {
      await fetch(`/api/admin/sponsors/${id}`, { method: 'DELETE' })
      await loadData()
    } catch (error) {
      console.error('Failed to delete sponsor:', error)
      alert('Failed to delete sponsor')
    }
  }

  const toggleSponsorActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/sponsors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })
      await loadData()
    } catch (error) {
      console.error('Failed to toggle sponsor:', error)
      alert('Failed to toggle sponsor')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white text-xl">Loading...</p>
      </div>
    )
  }

  return (
    <>
      {/* Display Type Selector */}
      <div className="bg-navy-800 border-2 border-gold-500/30 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gold-400 mb-4">Display Type</h2>
        <div className="flex gap-4">
          <button
            onClick={() => updateDisplayType('NONE')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              displayType === 'NONE'
                ? 'bg-gold-500 text-navy-900'
                : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
            }`}
          >
            None
          </button>
          <button
            onClick={() => updateDisplayType('ADVERTISEMENT')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              displayType === 'ADVERTISEMENT'
                ? 'bg-gold-500 text-navy-900'
                : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
            }`}
          >
            Advertisement
          </button>
          <button
            onClick={() => updateDisplayType('SPONSOR_LOGOS')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              displayType === 'SPONSOR_LOGOS'
                ? 'bg-gold-500 text-navy-900'
                : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
            }`}
          >
            Sponsor Logos
          </button>
        </div>
      </div>

      {/* Advertisement Section */}
      <div className="bg-navy-800 border-2 border-gold-500/30 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gold-400 mb-4">Advertisement Banner</h2>
        <p className="text-gray-300 mb-4 bg-navy-700 p-3 rounded border border-gold-400/20">
          <strong className="text-gold-400">Recommended Size:</strong> 1200 x 300 pixels (4:1 ratio)
          <br />
          <span className="text-sm text-gray-400">Multiple advertisements will automatically rotate every 5 seconds</span>
        </p>
        
        {/* Upload Form */}
        <form onSubmit={uploadAdvertisement} className="mb-6">
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Image File (JPG, PNG, WebP)</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => setAdFile(e.target.files?.[0] || null)}
              className="w-full bg-navy-700 text-white px-4 py-2 rounded border border-gold-400/30"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Link URL (optional)</label>
            <input
              type="url"
              value={adLink}
              onChange={(e) => setAdLink(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-navy-700 text-white px-4 py-2 rounded border border-gold-400/30"
            />
          </div>
          <button
            type="submit"
            disabled={!adFile || uploading}
            className="bg-gold-500 hover:bg-gold-600 disabled:bg-gray-600 text-navy-900 font-bold px-6 py-2 rounded-lg"
          >
            {uploading ? 'Uploading...' : 'Upload Advertisement'}
          </button>
        </form>

        {/* Current Advertisements */}
        <div className="space-y-4">
          {advertisements.map((ad) => (
            <div key={ad.id} className="bg-navy-700 p-4 rounded-lg">
              <div className="flex flex-col gap-3">
                <div className="relative w-full bg-navy-600 rounded overflow-hidden h-[250px] flex items-center justify-center">
                  <Image
                    src={ad.imageUrl}
                    alt="Ad"
                    fill
                    className="object-contain rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      {ad.linkUrl ? (
                        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:underline">
                          {ad.linkUrl}
                        </a>
                      ) : (
                        <span className="text-gray-400">No link</span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAdvertisementActive(ad.id, ad.isActive)}
                      className={`px-3 py-1 rounded text-sm ${
                        ad.isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                      } text-white`}
                    >
                      {ad.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => deleteAdvertisement(ad.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {advertisements.length === 0 && (
            <p className="text-gray-400 text-center py-4">No advertisements uploaded</p>
          )}
        </div>
      </div>

      {/* Sponsor Logos Section */}
      <div className="bg-navy-800 border-2 border-gold-500/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gold-400 mb-4">Sponsor Logos</h2>
        
        {/* Upload Form */}
        <form onSubmit={uploadSponsor} className="mb-6">
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Logo File(s) (JPG, PNG, SVG, WebP) - Select multiple files</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
              onChange={(e) => setSponsorFiles(e.target.files)}
              className="w-full bg-navy-700 text-white px-4 py-2 rounded border border-gold-400/30"
              multiple
              required
            />
            {sponsorFiles && sponsorFiles.length > 0 && (
              <p className="text-gray-400 text-sm mt-2">
                {sponsorFiles.length} file{sponsorFiles.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Link URL (optional - applies to all uploads)</label>
            <input
              type="url"
              value={sponsorLink}
              onChange={(e) => setSponsorLink(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-navy-700 text-white px-4 py-2 rounded border border-gold-400/30"
            />
          </div>
          <button
            type="submit"
            disabled={!sponsorFiles || sponsorFiles.length === 0 || uploading}
            className="bg-gold-500 hover:bg-gold-600 disabled:bg-gray-600 text-navy-900 font-bold px-6 py-2 rounded-lg"
          >
            {uploading ? 'Uploading...' : `Upload Sponsor Logo${sponsorFiles && sponsorFiles.length > 1 ? 's' : ''}`}
          </button>
        </form>

        {/* Current Sponsors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sponsors.map((sponsor) => (
            <div key={sponsor.id} className="bg-navy-700 p-4 rounded-lg">
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center p-2">
                  <Image src={sponsor.logoUrl} alt={sponsor.name} width={80} height={80} className="object-contain" />
                </div>
                <h3 className="text-white font-semibold">{sponsor.name}</h3>
                {sponsor.linkUrl && (
                  <a href={sponsor.linkUrl} target="_blank" rel="noopener noreferrer" className="text-gold-400 text-sm hover:underline truncate max-w-full">
                    {sponsor.linkUrl}
                  </a>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => toggleSponsorActive(sponsor.id, sponsor.isActive)}
                    className={`px-3 py-1 rounded text-sm ${
                      sponsor.isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                    } text-white`}
                  >
                    {sponsor.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => deleteSponsor(sponsor.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {sponsors.length === 0 && (
            <div className="col-span-full">
              <p className="text-gray-400 text-center py-4">No sponsor logos uploaded</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
