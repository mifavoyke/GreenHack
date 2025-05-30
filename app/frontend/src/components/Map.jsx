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
    zoom = 6,
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

  // color based on zones
  const code18ColorMap = {
  "211": "#00FF00", // Arable land – ideal
  "231": "#40FF00", // Pastures – good
  "321": "#80FF00", // Natural grasslands – acceptable
  "324": "#FFFF00", // Transitional woodland-shrub – borderline
  "311": "#FFC000", // Broad-leaved forest – not ideal
  "312": "#FF8000", // Coniferous forest – worse
  "313": "#FF4000", // Mixed forest – avoid
  "111": "#FF0000", // Continuous urban fabric – no
  "112": "#FF0000", // Discontinuous urban fabric – no
  "121": "#C00000", // Industrial units – big no
  "123": "#C00000", // Port areas – very big no
  // Add more as needed
};

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
          style={(feature) => {
            const code = feature.properties.Code_18;
            const fillColor = code18ColorMap[code] || "#0000FF"; // Blue fallback for unknown
            return {
              fillColor,
              color: "black",
              weight: 0.1,
            };
          }}


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