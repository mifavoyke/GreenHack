import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSeedling } from '@fortawesome/free-solid-svg-icons'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()

  const handleSearch = () => {
    const query = searchQuery.trim() || "Czech Republic"
    navigate(`/browse?location=${encodeURIComponent(query)}`)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="home-container">
      <div className="container">
        <div className="home-content">
          <div>
          <FontAwesomeIcon className="home-icon" icon={faSeedling} />
            <h1 className="home-title">Hello, Plan energy transmission routes</h1>
            <p className="home-subtitle">Explore and plan transmission routes across Czech Republic based on national data</p>
          </div>

          <div className="home-search-card">
            <h2 className="home-search-title">Search Location</h2>

            <div className="home-search-input">
              <svg className="home-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Enter coordinates or city in Czech Republic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input input-lg home-search-field"
              />
            </div>

            <button onClick={handleSearch} className="btn btn-primary btn-lg w-full">
              Browse and Plan
            </button>

            <div className="home-examples">
              <p>Examples: "Prague", "50.0755, 14.4378", or leave empty for Czech Republic</p>
            </div>
          </div>

          {/* <div className="home-features">
            <div className="home-feature-card">
              <h3 className="home-feature-title blue">Interactive Maps</h3>
              <p className="home-feature-description">Explore detailed maps with infinite zoom capabilities</p>
            </div>
            <div className="home-feature-card">
              <h3 className="home-feature-title green">Advanced Filtering</h3>
              <p className="home-feature-description">Filter data by multiple parameters for precise analysis</p>
            </div>
            <div className="home-feature-card">
              <h3 className="home-feature-title purple">Route Planning</h3>
              <p className="home-feature-description">Plan optimal transmission routes with distance calculations</p>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}