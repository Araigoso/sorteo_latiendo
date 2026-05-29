import { useState } from 'react'

export default function NumberBoard({ takenNumbers, onSelect }) {
  const TOTAL_NUMBERS = 500
  const NUMBERS_PER_PAGE = 50

  const [currentPage, setCurrentPage] = useState(0)

  const totalPages = Math.ceil(TOTAL_NUMBERS / NUMBERS_PER_PAGE)

  const start = currentPage * NUMBERS_PER_PAGE + 1
  const end = Math.min(start + NUMBERS_PER_PAGE - 1, TOTAL_NUMBERS)

  const numbersToShow = Array.from(
    { length: end - start + 1 },
    (_, i) => start + i
  )

  const goPrev = () => {
    if (currentPage > 0) setCurrentPage(prev => prev - 1)
  }

  const goNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1)
  }

  return (
    <>
      {/* Navegación superior */}
      <div className="board-navigation">
        <button
          className="nav-arrow"
          onClick={goPrev}
          disabled={currentPage === 0}
        >
          ←
        </button>

        <div className="range-indicator">
          {start} - {end}
        </div>

        <button
          className="nav-arrow"
          onClick={goNext}
          disabled={currentPage === totalPages - 1}
        >
          →
        </button>
      </div>

      {/* Grid */}
      <div className="number-board">
        {numbersToShow.map((num) => (
          <button
            key={num}
            className={`cell ${takenNumbers.includes(num) ? 'taken' : ''}`}
            disabled={takenNumbers.includes(num)}
            onClick={() => onSelect(num)}
          >
            {num}
          </button>
        ))}
      </div>
    </>
  )
}
