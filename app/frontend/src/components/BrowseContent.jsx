import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import FilterPanel from "./FilterPanel"
import RoutePlanningPanel from "./RoutePlanningPanel"
import ReportingPanel from "./ReportingPanel"
import MapComponent from "./Map"

export default function BrowseContent() {
    const location = useLocation()
    const params = new URLSearchParams(location.search)
    const locationQuery = params.get("location") || "Czech Republic"
  
    const [activeTab, setActiveTab] = useState("filters")
    const [routePoints, setRoutePoints] = useState([])
    const [plannedRoute, setPlannedRoute] = useState(null)
    const [mapCenter, setMapCenter] = useState([49.75, 15.5]) // Czech Republic center
    const [mapZoom, setMapZoom] = useState(7)
    const [showSidebar, setShowSidebar] = useState(true)
  
    useEffect(() => {
      geocodeLocation(locationQuery)
    }, [locationQuery])

    // FILTERING 
    const [filters, setFilters] = useState({})
    const [geoData, setGeoData] = useState(null)

    const handleApplyFilters = async (newFilters) => {
      setFilters(newFilters);  // save filters state
    }

    const geocodeLocation = async (locationQuery) => {
      try {
        const coordMatch = locationQuery.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/)
        if (coordMatch) {
          const lat = parseFloat(coordMatch[1])
          const lng = parseFloat(coordMatch[2])
          setMapCenter([lat, lng])
          setMapZoom(12)
          return
        }
  
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&countrycodes=cz&limit=1`
        )
        const data = await response.json()
  
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat)
          const lng = parseFloat(data[0].lon)
          setMapCenter([lat, lng])
          setMapZoom(12)
        }
      } catch (error) {
        console.error("Geocoding error:", error)
      }
    }

    useEffect(() => {
      const fetchGeoData = async () => {
        try {
          // Include locationQuery in the request body or query as needed
          const requestBody = {
            ...filters,
            location: locationQuery, // or handle server-side how you want
          };

          const response = await fetch("http://localhost:5000/api/map-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) throw new Error("Failed to fetch GeoJSON");

          const geojson = await response.json();
          setGeoData(geojson);
        } catch (error) {
          console.error("Error fetching geoData:", error);
        }
      };

      fetchGeoData();
    }, [filters, locationQuery]);

  // Check if coordinates are within Czech Republic bounds
  const isInCzechRepublic = (lat, lng) => {
    const bounds = {
      north: 51.1,
      south: 48.5,
      east: 18.9,
      west: 12.1,
    }
    return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east
  }

  const handleMapClick = (lat, lng) => {
    if (activeTab === "planning") {
      if (!isInCzechRepublic(lat, lng)) {
        alert("Point must be within Czech Republic boundaries!")
        return
      }

      const newPoint = {
        id: Date.now().toString(),
        lat,
        lng,
        order: routePoints.length + 1,
      }
      setRoutePoints([...routePoints, newPoint])
    }
  }

  const handleAddManualPoint = (lat, lng) => {
    if (!isInCzechRepublic(lat, lng)) {
      alert("Point must be within Czech Republic boundaries!")
      return false
    }

    const newPoint = {
      id: Date.now().toString(),
      lat,
      lng,
      order: routePoints.length + 1,
    }
    setRoutePoints([...routePoints, newPoint])
    return true
  }

  const handleRemovePoint = (pointId) => {
    const updatedPoints = routePoints
      .filter((point) => point.id !== pointId)
      .map((point, index) => ({ ...point, order: index + 1 }))
    setRoutePoints(updatedPoints)
    setPlannedRoute(null)
  }

  const handlePlanRoute = async () => {
  if (routePoints.length < 2) return;

  try {
    // Prepare coordinates as [{x: lng, y: lat}] for backend
    const pointsForBackend = routePoints.map(point => ({ x: point.lng, y: point.lat }));

    const response = await fetch("http://localhost:5000/api/plan-route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ points: pointsForBackend }),
    });

    if (!response.ok) throw new Error("Failed to fetch planned route");

    const data = await response.json();

    // Assuming backend returns { route: [{x, y}], totalLength }
    const plannedPoints = data.route.map((pt, index) => ({
      id: index + 1,
      lat: pt.y,
      lng: pt.x,
      order: index + 1,
    }));

    setPlannedRoute({
      coordinates: plannedPoints.map(p => [p.lat, p.lng]),
      points: plannedPoints,
      totalLength: data.totalLength,
    });
    } catch (error) {
      console.error("Route planning error:", error);
    }
  };

  const handleExportRoute = (format) => {
    if (!plannedRoute) {
      alert("No route to export. Please plan a route first.")
      return
    }

    switch (format) {
      case "coordinates":
        const coordsText = plannedRoute.coordinates.map((coord) => `${coord[0]}, ${coord[1]}`).join("\n")
        downloadFile("route_coordinates.txt", coordsText)
        break
      case "vectors":
        const vectorsText = plannedRoute.coordinates
          .map((coord, index) => {
            if (index === 0) return `Start: ${coord[0]}, ${coord[1]}`
            const prev = plannedRoute.coordinates[index - 1]
            const distance = calculateDistance(prev[0], prev[1], coord[0], coord[1])
            const bearing = calculateBearing(prev[0], prev[1], coord[0], coord[1])
            return `Vector ${index}: Distance: ${distance.toFixed(2)}km, Bearing: ${bearing.toFixed(1)}°`
          })
          .join("\n")
        downloadFile("route_vectors.txt", vectorsText)
        break
      case "map":
        // This would generate a map image - for now just alert
        alert("Map export functionality would generate a PNG/PDF of the current map view")
        break
    }
  }

  const downloadFile = (filename, content) => {
    const element = document.createElement("a")
    const file = new Blob([content], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const calculateBearing = (lat1, lng1, lat2, lng2) => {
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const lat1Rad = (lat1 * Math.PI) / 180
    const lat2Rad = (lat2 * Math.PI) / 180
    const y = Math.sin(dLng) * Math.cos(lat2Rad)
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng)
    const bearing = (Math.atan2(y, x) * 180) / Math.PI
    return (bearing + 360) % 360
  }

  return (
    <div className="browse-container">
      <div className="browse-content">
        {/* Left Sidebar */}
        <div className={`browse-sidebar ${showSidebar ? "open" : "closed"}`}>
          <div className="tabs">
            <div className="tab-list">
              <button
                className={`tab-button ${activeTab === "filters" ? "active" : ""}`}
                onClick={() => setActiveTab("filters")}
              >
                Filters
              </button>
              <button
                className={`tab-button ${activeTab === "planning" ? "active" : ""}`}
                onClick={() => setActiveTab("planning")}
              >
                Planning
              </button>
              <button
                className={`tab-button ${activeTab === "reporting" ? "active" : ""}`}
                onClick={() => setActiveTab("reporting")}
              >
                Reports
              </button>
            </div>
            <div className="tab-content">
              {activeTab === "filters" &&  <FilterPanel onApplyFilters={handleApplyFilters} />}
              {activeTab === "planning" && (
                <RoutePlanningPanel
                  routePoints={routePoints}
                  plannedRoute={plannedRoute}
                  onRemovePoint={handleRemovePoint}
                  onPlanRoute={handlePlanRoute}
                  onAddManualPoint={handleAddManualPoint}
                  onExportRoute={handleExportRoute}
                />
              )}
              {activeTab === "reporting" && <ReportingPanel routePoints={routePoints} plannedRoute={plannedRoute} />}
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="browse-map-container">
          <MapComponent
            center={mapCenter}
            zoom={mapZoom}
            routePoints={routePoints}
            plannedRoute={plannedRoute}
            onMapClick={handleMapClick}
            geoData={geoData}
          />

          {/* Toggle Button */}
          <div className="browse-controls">
            <button className="btn btn-outline btn-sm" onClick={() => setShowSidebar(!showSidebar)}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {showSidebar ? "Hide" : "Show"} Panel
            </button>
          </div>

          {/* Location Info */}
          <div className="browse-location-info">
            <p className="browse-location-text">Location: {locationQuery}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
