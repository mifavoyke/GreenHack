export default function ReportingPanel({ routePoints, plannedRoute }) {
  // Mock data for demonstration
  const mockMetrics = {
    landTypes: {
      urban: 25,
      rural: 45,
      forest: 20,
      agricultural: 10,
    },
    zones: {
      residential: 30,
      commercial: 15,
      protected: 25,
      restricted: 30,
    },
    elevation: {
      min: 180,
      max: 1200,
      average: 450,
    },
    population: {
      low: 40,
      medium: 35,
      high: 25,
    },
    environmental: {
      protectedAreas: 3,
      waterBodies: 7,
      forests: 12,
    },
  }

  return (
    <div className="reporting-panel">
      <div className="card-header">
        <h3 className="card-title reporting-header">
          <svg className="reporting-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Reports & Metrics
        </h3>
      </div>
      <div className="card-content">
        <div className="reporting-content">
          {/* Route Statistics */}
          <div className="reporting-section">
            <h4 className="reporting-section-title">Route Statistics</h4>
            <div className="reporting-metric">
              <span className="reporting-metric-label">Total Points:</span>
              <span className="reporting-metric-value">{routePoints.length}</span>
            </div>
            <div className="reporting-metric">
              <span className="reporting-metric-label">Route Length:</span>
              <span className="reporting-metric-value">
                {plannedRoute ? `${plannedRoute.totalLength.toFixed(2)} km` : "N/A"}
              </span>
            </div>
            <div className="reporting-metric">
              <span className="reporting-metric-label">Status:</span>
              <span className="reporting-metric-value">{plannedRoute ? "Planned" : "Not Planned"}</span>
            </div>
          </div>

          {/* Land Type Distribution */}
          <div className="reporting-section">
            <h4 className="reporting-section-title">Land Type Distribution (%)</h4>
            {Object.entries(mockMetrics.landTypes).map(([type, percentage]) => (
              <div key={type} className="reporting-metric">
                <span className="reporting-metric-label">{type.charAt(0).toUpperCase() + type.slice(1)}:</span>
                <span className="reporting-metric-value">{percentage}%</span>
              </div>
            ))}
          </div>

          {/* Zone Analysis */}
          <div className="reporting-section">
            <h4 className="reporting-section-title">Zone Analysis (%)</h4>
            {Object.entries(mockMetrics.zones).map(([zone, percentage]) => (
              <div key={zone} className="reporting-metric">
                <span className="reporting-metric-label">{zone.charAt(0).toUpperCase() + zone.slice(1)}:</span>
                <span className="reporting-metric-value">{percentage}%</span>
              </div>
            ))}
          </div>

          {/* Elevation Profile */}
          <div className="reporting-section">
            <h4 className="reporting-section-title">Elevation Profile</h4>
            <div className="reporting-metric">
              <span className="reporting-metric-label">Minimum:</span>
              <span className="reporting-metric-value">{mockMetrics.elevation.min}m</span>
            </div>
            <div className="reporting-metric">
              <span className="reporting-metric-label">Maximum:</span>
              <span className="reporting-metric-value">{mockMetrics.elevation.max}m</span>
            </div>
            <div className="reporting-metric">
              <span className="reporting-metric-label">Average:</span>
              <span className="reporting-metric-value">{mockMetrics.elevation.average}m</span>
            </div>
          </div>

          {/* Population Density */}
          <div className="reporting-section">
            <h4 className="reporting-section-title">Population Density (%)</h4>
            {Object.entries(mockMetrics.population).map(([density, percentage]) => (
              <div key={density} className="reporting-metric">
                <span className="reporting-metric-label">{density.charAt(0).toUpperCase() + density.slice(1)}:</span>
                <span className="reporting-metric-value">{percentage}%</span>
              </div>
            ))}
          </div>

          {/* Environmental Impact */}
          <div className="reporting-section">
            <h4 className="reporting-section-title">Environmental Impact</h4>
            <div className="reporting-metric">
              <span className="reporting-metric-label">Protected Areas:</span>
              <span className="reporting-metric-value">{mockMetrics.environmental.protectedAreas}</span>
            </div>
            <div className="reporting-metric">
              <span className="reporting-metric-label">Water Bodies:</span>
              <span className="reporting-metric-value">{mockMetrics.environmental.waterBodies}</span>
            </div>
            <div className="reporting-metric">
              <span className="reporting-metric-label">Forest Areas:</span>
              <span className="reporting-metric-value">{mockMetrics.environmental.forests}</span>
            </div>
          </div>

          {/* Cost Analysis */}
          <div className="reporting-section">
            <h4 className="reporting-section-title">Cost Analysis</h4>
            <div className="reporting-metric">
              <span className="reporting-metric-label">Estimated Cost:</span>
              <span className="reporting-metric-value">
                {plannedRoute ? `€${(plannedRoute.totalLength * 50000).toLocaleString()}` : "N/A"}
              </span>
            </div>
            <div className="reporting-metric">
              <span className="reporting-metric-label">Cost per km:</span>
              <span className="reporting-metric-value">€50,000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
