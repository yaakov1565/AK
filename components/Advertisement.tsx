'use client'

import Image from 'next/image'

interface AdvertisementProps {
  ad: {
    id: string
    imageUrl: string
    linkUrl: string | null
  }
}

export default function Advertisement({ ad }: AdvertisementProps) {
  const content = (
    <div className="relative w-full max-w-6xl mx-auto overflow-hidden rounded-lg border-2 border-gold-400/30 shadow-xl bg-navy-800/40">
      <div className="relative w-full" style={{ maxHeight: '200px' }}>
        <Image
          src={ad.imageUrl}
          alt="Advertisement"
          width={1200}
          height={200}
          className="w-full h-auto max-h-[200px] object-contain"
          quality={85}
          priority={false}
          loading="lazy"
        />
      </div>
    </div>
  )

  if (ad.linkUrl) {
    return (
      <a
        href={ad.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:opacity-90 transition-opacity duration-200"
      >
        {content}
      </a>
    )
  }

  return content
}
