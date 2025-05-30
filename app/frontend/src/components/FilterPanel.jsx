import { useState } from "react"

export default function FilterPanel() {
  const [filters, setFilters] = useState({
    voltage: "",
    lineType: "",
    capacity: 0,
    region: "",
    status: "",
    landType: "",
    zone: "",
    elevation: 0,
    population: 0,
  })

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleApplyFilters = async () => {
    try {
      console.log("Applying filters:", filters)
      // In real app, make API call to backend
    } catch (error) {
      console.error("Filter error:", error)
    }
  }

  const handleResetFilters = () => {
    setFilters({
      voltage: "",
      lineType: "",
      capacity: 0,
      region: "",
      status: "",
      landType: "",
      zone: "",
      elevation: 0,
      population: 0,
    })
  }

  return (
    <div className="filter-panel">
      <div className="card-header">
        <h3 className="card-title filter-header">
          <svg className="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
            />
          </svg>
          Filters
        </h3>
      </div>
      <div className="card-content">
        <div className="filter-form">
          <div className="filter-group">
            <label className="filter-label">Voltage Level</label>
            <select
              className="select"
              value={filters.voltage}
              onChange={(e) => handleFilterChange("voltage", e.target.value)}
            >
              <option value="">Select voltage</option>
              <option value="110kv">110 kV</option>
              <option value="220kv">220 kV</option>
              <option value="400kv">400 kV</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Line Type</label>
            <select
              className="select"
              value={filters.lineType}
              onChange={(e) => handleFilterChange("lineType", e.target.value)}
            >
              <option value="">Select line type</option>
              <option value="overhead">Overhead</option>
              <option value="underground">Underground</option>
              <option value="submarine">Submarine</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Capacity (MW): {filters.capacity}</label>
            <input
              type="range"
              className="slider"
              min="0"
              max="1000"
              step="10"
              value={filters.capacity}
              onChange={(e) => handleFilterChange("capacity", Number.parseInt(e.target.value))}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Region</label>
            <select
              className="select"
              value={filters.region}
              onChange={(e) => handleFilterChange("region", e.target.value)}
            >
              <option value="">Select region</option>
              <option value="prague">Prague</option>
              <option value="brno">Brno</option>
              <option value="ostrava">Ostrava</option>
              <option value="plzen">Plzen</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              className="select"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">Select status</option>
              <option value="active">Active</option>
              <option value="planned">Planned</option>
              <option value="maintenance">Maintenance</option>
              <option value="decommissioned">Decommissioned</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Land Type</label>
            <select
              className="select"
              value={filters.landType}
              onChange={(e) => handleFilterChange("landType", e.target.value)}
            >
              <option value="">Select land type</option>
              <option value="urban">Urban</option>
              <option value="rural">Rural</option>
              <option value="forest">Forest</option>
              <option value="agricultural">Agricultural</option>
              <option value="industrial">Industrial</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Zone</label>
            <select
              className="select"
              value={filters.zone}
              onChange={(e) => handleFilterChange("zone", e.target.value)}
            >
              <option value="">Select zone</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="protected">Protected Area</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Min Elevation (m): {filters.elevation}</label>
            <input
              type="range"
              className="slider"
              min="0"
              max="2000"
              step="50"
              value={filters.elevation}
              onChange={(e) => handleFilterChange("elevation", Number.parseInt(e.target.value))}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Population Density: {filters.population}</label>
            <input
              type="range"
              className="slider"
              min="0"
              max="10000"
              step="100"
              value={filters.population}
              onChange={(e) => handleFilterChange("population", Number.parseInt(e.target.value))}
            />
          </div>

          <div className="filter-actions">
            <button onClick={handleApplyFilters} className="btn btn-primary" style={{ flex: 1 }}>
              Apply Filters
            </button>
            <button onClick={handleResetFilters} className="btn btn-outline">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
