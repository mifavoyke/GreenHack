import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, GeoJSON } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import LegendControl from "./LegendControl"

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

const code18ColorMap = {
  "211": "#39FF14",
  "231": "#40FF00",
  "321": "#80FF00",
  "324": "#FFFF00",
  "241": "#FFFF00",
  "242": "#FFFF00",
  "243": "#FFFF00",
  "311": "#FFC000",
  "312": "#FF8000",
  "313": "#FF4000",
  "111": "#FF0000",
  "112": "#FF0000",
  "121": "#C00000",
  "122": "#FF0000",
  "123": "#C00000",
  "124": "#FF0000",
  "131": "#FF0000",
  "132": "#FF0000",
  "133": "#FF0000",
  "141": "#FFD700",
  "142": "#FFD700",
  "332": "#D2B48C",
  "333": "#F5DEB3",
  "411": "#ADD8E6",
  "412": "#87CEFA",
  "511": "#0000FF",
  "512": "#0000CD",
  "990": "#A9A9A9",
  "995": "#A9A9A9",
  "999": "#808080",
};

const code18LabelMap = {
  "211": "Arable land",
  "231": "Pastures",
  "321": "Natural grasslands",
  "324": "Transitional woodland-shrub",
  "241": "Annual + permanent crops",
  "242": "Complex cultivation",
  "243": "Agriculture + vegetation",
  "311": "Broad-leaved forest",
  "312": "Coniferous forest",
  "313": "Mixed forest",
  "111": "Continuous urban",
  "112": "Discontinuous urban",
  "121": "Industrial units",
  "122": "Road/rail networks",
  "123": "Port areas",
  "124": "Airports",
  "131": "Mineral extraction",
  "132": "Dump sites",
  "133": "Construction sites",
  "141": "Green urban areas",
  "142": "Sport/leisure",
  "332": "Bare rocks",
  "333": "Sparsely vegetated",
  "411": "Inland marshes",
  "412": "Peat bogs",
  "511": "Water courses",
  "512": "Water bodies",
  "990": "Unclassified land",
  "995": "Unclassified water",
  "999": "No data",
};

export default function MapComponent({
    center = [49.8, 15.0],
    zoom = 6,
    routePoints = [],
    plannedRoute = null,
    onMapClick = () => {},
    geoData = null,
    transmissionLines200=null,
    transmissionLines400=null
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

  function getZoneLabel(code) {
    return code18LabelMap[code] || "Unknown zone";
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
          style={(feature) => {
            const code = feature.properties.Code_18;
            const fillColor = code18ColorMap[code] || "#0000FF"; // Blue fallback for unknown
            return {
              fillColor,
              color: "black",
              weight: 0.1,
            };
          }}
          onEachFeature={(feature, layer) => {
              const ID = feature.id || "null";
              const name = feature.properties?.CLC_name || "Zone";
              const zoneCode = feature.properties?.Code_18 ?? "N/A";
              const zoneLabel = getZoneLabel(zoneCode);

              // Show tooltip on hover
              layer.on("mouseover", function (e) {
                layer.bindTooltip(
                  `<b>ID: ${ID}</b><br/><b>${name}</b><br/>Zone: ${zoneLabel}`,
                  { sticky: true, direction: "top" }
                ).openTooltip(e.latlng);
              });

              layer.on("mouseout", function () {
                layer.closeTooltip();
              });
          }}
        />
      )}
      {transmissionLines200 && (
        <GeoJSON
          data={transmissionLines200}
          style={{
            color: "#ff6600", // Transmission lines shown as orange
            weight: 5,
            opacity: 1,
          }}
          onEachFeature={(feature, layer) => {
            const name = feature.properties?.NAZEV || "Electric Line (220 kV)";
            const voltage = feature.properties?.NAPETI || "220 kV";

            // Tooltip on hover
            layer.on("mouseover", function (e) {
              layer.bindTooltip(`<b>${name}</b><br/>Voltage: ${voltage}`, {
                sticky: true,
                direction: "top",
              }).openTooltip(e.latlng);
            });

            layer.on("mouseout", function () {
              layer.closeTooltip();
            });
          }}
        />
      )}
      {transmissionLines400 && (
        <GeoJSON
          data={transmissionLines400}
          style={{
            color: "#000000", // Transmission lines shown as orange
            weight: 5,
            opacity: 1,
          }}
          onEachFeature={(feature, layer) => {
            const name = feature.properties?.NAZEV || "Electric Line (400 kV)";
            const voltage = feature.properties?.NAPETI || "400 kV";

            // Tooltip on hover
            layer.on("mouseover", function (e) {
              layer.bindTooltip(`<b>${name}</b><br/>Voltage: ${voltage}`, {
                sticky: true,
                direction: "top",
              }).openTooltip(e.latlng);
            });

            layer.on("mouseout", function () {
              layer.closeTooltip();
            });
          }}
        />
      )}
    <LegendControl />
    </MapContainer>
  )
}