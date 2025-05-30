import { useState } from "react"

export default function FilterPanel({ onApplyFilters }) {
  const [filters, setFilters] = useState({
    voltage: "",
    lineType: "",
    lineStatus: "",
    landType: "",
    zone: "",
    terrainType: "",
    weatherCondition: "",
  })

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleResetFilters = () => {
    setFilters({
        voltage: "",
        lineType: "",
        lineStatus: "",
        landType: "",
        zone: "",
        terrainType: "",
        weatherCondition: "",
    })
  }

  const handleSubmit = () => {
    onApplyFilters(filters)
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
            </select>
          </div>

          <label className="filter-label">Line Status</label>
          <select
            className="select"
            value={filters.lineStatus}
            onChange={(e) => handleFilterChange("lineStatus", e.target.value)}
          >
            <option value="">Select line status</option>
            <option value="active">Active</option>
            <option value="planned">Planned</option>
            <option value="maintenance">Maintenance</option>
            <option value="decommissioned">Decommissioned</option>
          </select>

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
              {/* <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="protected">Protected Area</option>
              <option value="restricted">Restricted</option> */}
              <option value="121">121</option>
              <option value="211">211</option>
              <option value="231">231</option>
              <option value="311">311</option>
            </select>
          </div>

          <label className="filter-label">Soil/Terrain type</label>
          <select
            className="select"
            value={filters.terrainType}
            onChange={(e) => handleFilterChange("terrainType", e.target.value)}
          >
            <option value="">Select terrain</option>
            <option value="soft">Unstable/Soft Soil</option>
            <option value="rocky">Rocky Terrain</option>
            <option value="steep">Steep Hills</option>
            <option value="seismic">Seismic Activity</option>
          </select>

          <label className="filter-label">Weather Conditions</label>
          <select
            className="select"
            value={filters.weatherCondition}
            onChange={(e) => handleFilterChange("weatherCondition", e.target.value)}
          >
            <option value="">Select weather</option>
            <option value="flooded">Flooded Areas</option>
            <option value="wetlands">Wetlands</option>
          </select>

          <div className="filter-actions">
            <button onClick={handleSubmit} className="btn btn-primary">
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
