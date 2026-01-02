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
    const fetchData = () => {
      // Add cache-busting timestamp to ensure fresh data
      fetch(`/api/bottom-content?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
        .then(res => res.json())
        .then(newData => {
          console.log('Bottom content fetched:', newData) // Debug log
          setData(newData)
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to load bottom content:', err)
          setLoading(false)
        })
    }

    // Initial fetch
    fetchData()

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchData, 5000)

    return () => clearInterval(interval)
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
