
import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

const code18ColorMap = {
  "211": "#00FF00",
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

export default function LegendControl() {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: "bottomleft" });

    legend.onAdd = function () {
      const div = L.DomUtil.create("div", "info legend");
      div.style.background = "white";
      div.style.padding = "10px";
      div.style.borderRadius = "6px";
      div.style.boxShadow = "0 0 6px rgba(0,0,0,0.2)";
      div.style.maxWidth = "100%";
      div.style.width = "100%";

      // Add transmission line legend first:
      let html = `
        <div style="margin-bottom: 8px; font-weight: bold;">Transmission Lines</div>
        <div style="margin-bottom: 8px;">
          <i style="background:#ff6600; width: 16px; height: 16px; display:inline-block; margin-right:6px; border:1px solid #999;"></i>220 kV Line<br>
          <i style="background:#000000; width: 16px; height: 16px; display:inline-block; margin-right:6px; border:1px solid #999;"></i>400 kV Line
        </div>
        <div style="margin-top: 8px; font-weight: bold;">Land Cover Suitability</div>
        <div style="display: flex; flex-wrap: wrap;">
      `;

      const keys = Object.keys(code18ColorMap);
      html += keys
        .map((code) => {
          const color = code18ColorMap[code];
          const label = code18LabelMap[code] || code;
          return `
            <div style="display: inline-flex; align-items: center; margin: 3px 12px 3px 0; white-space: nowrap;">
              <div style="width: 16px; height: 16px; background: ${color}; border: 1px solid #999; margin-right: 6px;"></div>
              <small>${label}</small>
            </div>
          `;
        })
        .join("");

      html += "</div>";

      div.innerHTML = html;

      return div;
    };

    legend.addTo(map);
    return () => map.removeControl(legend);
  }, [map]);

  return null;
}