'use client'

import { useState, useMemo } from 'react'
import DeletePrizeButton from './DeletePrizeButton'

interface Prize {
  id: string
  title: string
  description: string
  imageUrl: string | null
  quantityTotal: number
  quantityRemaining: number
  weight: number
  createdAt: Date
}

interface PrizesListProps {
  initialPrizes: Prize[]
}

type SortOption = 'title' | 'quantity' | 'weight' | 'date'
type SortDirection = 'asc' | 'desc'

export default function PrizesList({ initialPrizes }: PrizesListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Filter and sort prizes
  const filteredAndSortedPrizes = useMemo(() => {
    let result = [...initialPrizes]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(prize =>
        prize.title.toLowerCase().includes(query) ||
        prize.description.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'quantity':
          comparison = a.quantityRemaining - b.quantityRemaining
          break
        case 'weight':
          comparison = a.weight - b.weight
          break
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [initialPrizes, searchQuery, sortBy, sortDirection])

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      // Toggle direction if clicking the same sort option
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortDirection('asc')
    }
  }

  const handleExport = () => {
    window.location.href = '/api/admin/prizes/export-csv'
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-navy-800 border-2 border-gold-500/30 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Search Bar */}
          <div className="flex-1 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search prizes by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-navy-900 border border-gold-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
            />
          </div>

          {/* Sort Options */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-gray-400 self-center">Sort by:</span>
            <button
              onClick={() => handleSortChange('title')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'title'
                  ? 'bg-gold-500 text-navy-900'
                  : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
              }`}
            >
              Title {sortBy === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('quantity')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'quantity'
                  ? 'bg-gold-500 text-navy-900'
                  : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
              }`}
            >
              Quantity {sortBy === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('weight')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'weight'
                  ? 'bg-gold-500 text-navy-900'
                  : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
              }`}
            >
              Weight {sortBy === 'weight' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('date')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'date'
                  ? 'bg-gold-500 text-navy-900'
                  : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
              }`}
            >
              Date {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
          >
            📥 Export CSV
          </button>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-400">
          Showing {filteredAndSortedPrizes.length} of {initialPrizes.length} prizes
        </div>
      </div>

      {/* Prizes List */}
      <div className="space-y-4">
        {filteredAndSortedPrizes.length === 0 ? (
          <div className="bg-navy-800 border-2 border-gold-500/30 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg mb-2">
              {searchQuery ? 'No prizes match your search' : 'No prizes yet'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-gold-400 hover:text-gold-500 underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredAndSortedPrizes.map((prize) => (
            <div
              key={prize.id}
              className="bg-navy-800 border-2 border-gold-500/30 rounded-lg p-6 flex items-center gap-6"
            >
              {prize.imageUrl && (
                <img
                  src={prize.imageUrl}
                  alt={prize.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gold-400 mb-2">
                  {prize.title}
                </h3>
                <p className="text-gray-400 text-sm mb-2">{prize.description}</p>
                <div className="flex gap-6 text-sm text-gray-300">
                  <span>Remaining: <strong className="text-gold-400">{prize.quantityRemaining}</strong> / {prize.quantityTotal}</span>
                  <span>Weight: <strong className="text-gold-400">{prize.weight}</strong></span>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/admin/prizes/edit/${prize.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Edit
                </a>
                <DeletePrizeButton prizeId={prize.id} prizeTitle={prize.title} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
