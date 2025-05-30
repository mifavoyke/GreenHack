import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, GeoJSON } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})


export default function MapComponent({
    center = [49.8, 15.0],
    zoom = 7,
    routePoints = [],
    plannedRoute = null,
    onMapClick = () => {},
    geoData = null,
}) {

  function MapClickHandler({ onMapClick }) {
    useMapEvents({
      click: (e) => {
        onMapClick(e.latlng.lat, e.latlng.lng)
      },
    })
    return null
  }
  
  const mapRef = useRef(null)

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom)
    }
  }, [center, zoom])

  const createNumberedIcon = (number) => {
    return L.divIcon({
      html: `<div style="background-color: #3b82f6; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${number}</div>`,
      className: "custom-div-icon",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    })
  }

  return (
    <MapContainer
      ref={mapRef}
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      <MapClickHandler onMapClick={onMapClick} />

      {/* Route Points */}
      {routePoints.map((point) => (
        <Marker key={point.id} position={[point.lat, point.lng]} icon={createNumberedIcon(point.order)}>
          <Popup>
            <div>
              <p>
                <strong>Point {point.order}</strong>
              </p>
              <p>Lat: {point.lat.toFixed(6)}</p>
              <p>Lng: {point.lng.toFixed(6)}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Planned Route */}
      {plannedRoute && <Polyline positions={plannedRoute.coordinates} color="#ef4444" weight={4} opacity={0.8} />}

      {/* GeoJSON Layer */}
      {geoData && (
        <GeoJSON
          data={geoData}
          style={(feature) => ({
            fillColor: feature.properties.impact_score > 5 ? "#ff0000" : "#00ff00",
            color: "black",
            weight: 0.5,
          })}
          // onEachFeature={(feature, layer) => {
          //   layer.bindPopup(
          //     `<b>${feature.properties.CLC_name}</b><br/>Impact Score: ${feature.properties.impact_score}`
          //   )
          // }}
        />
      )}
    </MapContainer>
  )
}