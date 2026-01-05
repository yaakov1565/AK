'use client'

import { useEffect, useState } from 'react'
import AdvertisementCarousel from './AdvertisementCarousel'
import SponsorCarousel from './SponsorCarousel'

interface BottomContentData {
  displayType: 'NONE' | 'ADVERTISEMENT' | 'SPONSOR_LOGOS'
  content: any
}

export default function BottomContent() {
  const [data, setData] = useState<BottomContentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch bottom content only once on mount (no polling)
    fetch('/api/bottom-content')
      .then(res => res.json())
      .then(newData => {
        setData(newData)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load bottom content:', err)
        setLoading(false)
      })
  }, [])

  if (loading || !data || data.displayType === 'NONE' || !data.content) {
    return null
  }

  return (
    <div className="w-full mt-12">
      {data.displayType === 'ADVERTISEMENT' && Array.isArray(data.content) && data.content.length > 0 && (
        <AdvertisementCarousel ads={data.content} />
      )}
      {data.displayType === 'SPONSOR_LOGOS' && Array.isArray(data.content) && data.content.length > 0 && (
        <SponsorCarousel sponsors={data.content} />
      )}
    </div>
  )
}
