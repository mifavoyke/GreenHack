from flask import Flask, request, jsonify
from flask_cors import CORS
from flask import Response
import geopandas as gpd
from plan import compute_multi_route
import sys
import requests
import traceback
import json
from shapely.geometry import mapping
import os

app = Flask(__name__)

CORS(app)

# Endpoint when no route 
@app.route("/")
def hello():
    return "Hello from backend!", 200

# health checks
@app.route("/health", methods=["GET"])
def health_check():
    return "OK", 200

@app.route("/api/map-data", methods=["POST"])
def get_filtered_map_data():
    # filters = request.get_json()
    # print("Received filters:", filters)
    data = request.get_json()
    corine_url = "https://image.discomap.eea.europa.eu/arcgis/rest/services/Corine/CLC2018_WM/MapServer/0/query"
    
   # THIS code was used to load and prepare the ESRI geometry - borders of the CZ 
    # borders_gdf = gpd.read_file("./ne_10m_admin_0_countries.shp")
    # czech_polygon = borders_gdf[borders_gdf["ADMIN"] == "Czechia"].geometry.values[0]

    # esri_geometry = {
    #     "rings": mapping(czech_polygon)["coordinates"],
    #     "spatialReference": {"wkid": 4326}
    # }

    # # Save to file (run this once)
    # with open("czech_esri_geometry.json", "w") as f:
    #     json.dump(esri_geometry, f)
    # until here

    # Later, in your fetch loop, load it from the file and use it:
    with open("czech_esri_geometry.json", "r") as f:
        esri_geometry_loaded = json.load(f)

    all_features = []
    result_offset = 0
    page_size = 1000  # Max records per request
    
    while result_offset < 15001:
        params = {
            "f": "geojson",
            "geometry": json.dumps(esri_geometry_loaded),
            "geometryType": "esriGeometryPolygon",
            "spatialRel": "esriSpatialRelIntersects",
            "inSR": 4326,
            "outSR": 4326,
            "outFields": "*",
            "returnGeometry": "true",
            "resultOffset": result_offset,
            "resultRecordCount": page_size,
        }
        
        try:
            print(f"[DEBUG] Requesting offset {result_offset}", file=sys.stderr, flush=True)
            response = requests.post(corine_url, data=params, stream=True, headers={'Content-Type': 'application/x-www-form-urlencoded'}, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            features = data.get("features", [])
            all_features.extend(features)
            
            # If server indicates no more data or fewer features than page_size returned, break loop
            if not data.get("exceededTransferLimit", False) or len(features) < page_size:
                break
            
            result_offset += page_size
        
        except Exception as e:
            print(f"[ERROR] Exception during request: {str(e)}", file=sys.stderr, flush=True)
            return jsonify({"error": str(e)}), 500
    
    geojson = {
        "type": "FeatureCollection",
        "features": all_features
    }

    return jsonify(geojson)
    
# ROUTE PLANNING 
@app.route("/api/plan-route", methods=["POST"])
def route_endpoint():
    try:
        data = request.get_json()
        print("Received data:", data)
        input_points = data.get("points", [])
        
        planned_route, length = compute_multi_route(input_points)

        return jsonify({"route": planned_route, "totalLength": length})
    except Exception as e:
        print("Error in /api/plan-route:", str(e))
        return jsonify({"error": str(e)}), 500

# running the Flask server
# 0.0.0.0: binds to all network interfaces, making your Flask app reachable from outside (e.g., your browser via the EC2 public IP).
if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=5000)