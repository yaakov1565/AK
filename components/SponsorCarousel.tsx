'use client'

import Image from 'next/image'

interface Sponsor {
  id: string
  name: string
  logoUrl: string
  linkUrl: string | null
}

interface SponsorCarouselProps {
  sponsors: Sponsor[]
}

export default function SponsorCarousel({ sponsors }: SponsorCarouselProps) {
  if (!sponsors || sponsors.length === 0) return null

  // Duplicate sponsors for seamless infinite scroll
  const duplicatedSponsors = [...sponsors, ...sponsors, ...sponsors]

  return (
    <div className="w-full overflow-hidden bg-navy-800/20 backdrop-blur-sm border-y-2 border-gold-400/20 py-6">
      <div className="relative">
        <div className="flex animate-scroll gap-8">
          {duplicatedSponsors.map((sponsor, index) => (
            <div
              key={`${sponsor.id}-${index}`}
              className="flex-shrink-0"
            >
              {sponsor.linkUrl ? (
                <a
                  href={sponsor.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:scale-110 transition-transform duration-300"
                  title={sponsor.name}
                >
                  <LogoContainer sponsor={sponsor} />
                </a>
              ) : (
                <div title={sponsor.name}>
                  <LogoContainer sponsor={sponsor} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${(sponsors.length * (120 + 32))}px);
          }
        }

        .animate-scroll {
          animation: scroll ${sponsors.length * 3}s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}

function LogoContainer({ sponsor }: { sponsor: Sponsor }) {
  return (
    <div className="w-28 h-28 rounded-full bg-white/95 flex items-center justify-center p-4 shadow-lg border-2 border-gold-400/30">
      <div className="relative w-full h-full">
        <Image
          src={sponsor.logoUrl}
          alt={sponsor.name}
          fill
          className="object-contain"
          sizes="112px"
        />
      </div>
    </div>
  )
}
