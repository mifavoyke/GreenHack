import { useState } from "react"
// import { API_ROUTES } from "../api_config"

export default function RoutePlanningPanel({
  routePoints,
  plannedRoute,
  onRemovePoint,
  onPlanRoute,
  onAddManualPoint,
  onExportRoute,
}) {
  const [manualCoords, setManualCoords] = useState({ lat: "", lng: "" })

  const handleAddManualPoint = () => {
    const lat = Number.parseFloat(manualCoords.lat)
    const lng = Number.parseFloat(manualCoords.lng)

    if (!isNaN(lat) && !isNaN(lng)) {
      const success = onAddManualPoint(lat, lng)
      if (success) {
        setManualCoords({ lat: "", lng: "" })
      }
    }
  }

  /*
  async function fetchPlannedRoute(routePoints, setPlannedRoute) {
    if (routePoints.length < 2) return; // need at least 2 points

    try {
      const response = await fetch(API_ROUTES.planRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          points: routePoints.map(p => ({ x: p.lng, y: p.lat })),
        }),
      });
      console.log("response for planner: ");
      console.log(response);
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      // Convert backend points (x,y) back to frontend lat/lng for rendering
      const plannedRoutePoints = data.route.map((pt, i) => ({
        id: i + 1,
        order: i + 1,
        lat: pt.y,
        lng: pt.x,
      }));

      // set planned route state
      setPlannedRoute({
        points: plannedRoutePoints,
        totalLength: data.totalLength,
      });
    } catch (error) {
      console.error("Failed to fetch planned route:", error);
    }
  }
  */

  return (
    <div className="route-panel">
      <div className="card-header">
        <h3 className="card-title route-header">
          <svg className="route-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          Route Planning
        </h3>
      </div>
      <div className="card-content">
        <p className="route-description">
          Click on the map or add coordinates manually to create route points within Czech Republic.
        </p>

        {/* Manual Coordinate Input */}
        <div className="route-manual-input">
          <label className="route-manual-label">Add Point Manually</label>
          <div className="route-manual-grid">
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={manualCoords.lat}
              onChange={(e) => setManualCoords((prev) => ({ ...prev, lat: e.target.value }))}
              className="input"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={manualCoords.lng}
              onChange={(e) => setManualCoords((prev) => ({ ...prev, lng: e.target.value }))}
              className="input"
            />
          </div>
          <button
            onClick={handleAddManualPoint}
            className="btn btn-secondary btn-sm w-full"
            disabled={!manualCoords.lat || !manualCoords.lng}
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Point
          </button>
        </div>

        {/* Route Points List */}
        <div className="route-points-section">
          <label className="route-points-label">Route Points ({routePoints.length})</label>
          <div className="route-points-list">
            {routePoints.length === 0 ? (
              <p className="route-empty">No points added yet</p>
            ) : (
              routePoints.map((point) => (
                <div key={point.id} className="route-point-item">
                  <div className="route-point-info">
                    <div className="route-point-number">{point.order}</div>
                    <div className="route-point-coords">
                      {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                    </div>
                  </div>
                  <button className="route-point-remove" onClick={() => onRemovePoint(point.id)}>
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Plan Route Button */}
        <button onClick={onPlanRoute} disabled={routePoints.length < 2} className="btn btn-primary w-full">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          Plan Route
        </button>

        {/* Route Results */}
        {plannedRoute && (
          <div className="route-result">
            <h4 className="route-result-title">Route Planned</h4>
            <div className="route-result-stats">
              <p>
                Total Length: <strong>{plannedRoute.totalLength.toFixed(2)} km</strong>
              </p>
              <p>
                Points Connected: <strong>{routePoints.length}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Export Panel */}
        {plannedRoute && (
          <div className="export-panel">
            <h4 className="export-title">Export Route</h4>
            <div className="export-buttons">
              <button onClick={() => onExportRoute("coordinates")} className="btn btn-outline btn-sm">
                Export Coordinates
              </button>
              <button onClick={() => onExportRoute("vectors")} className="btn btn-outline btn-sm">
                Export Vectors
              </button>
              <button onClick={() => onExportRoute("map")} className="btn btn-outline btn-sm">
                Export Map Image
              </button>
            </div>
          </div>
        )}

        <div className="route-tips">
          <p>• Click on map to add points</p>
          <p>• Minimum 2 points required for routing</p>
          <p>• Points must be within Czech Republic</p>
          <p>• Points are connected in order</p>
        </div>
      </div>
    </div>
  )
}
