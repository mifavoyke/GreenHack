from flask import Flask, request, jsonify
from flask_cors import CORS
from flask import Response
import geopandas as gpd
from plan import compute_multi_route

app = Flask(__name__)

CORS(app)

@app.route("/api/map-data", methods=["POST"])
def get_filtered_map_data():
    # filters = request.get_json()
    # print("Received filters:", filters)
    data = request.get_json()
    bbox = data.get("bbox")
    # zone = data.get("zone")

    # Fallback: default bounding box for Czech Republic
    if not bbox:
        bbox = [12.0905752, 48.5518081, 18.8592531, 51.0557008]

    # Create bounding box string: xmin, ymin, xmax, ymax
    geometry_param = ",".join(map(str, bbox))

     # Parameters for ArcGIS REST API /query endpoint
    params = {
        "f": "geojson",  # Get proper FeatureCollection as GeoJSON
        "geometry": geometry_param,
        "geometryType": "esriGeometryEnvelope",
        "spatialRel": "esriSpatialRelIntersects",
        "inSR": 4326,
        "outSR": 4326,
        "outFields": "*",
        "returnGeometry": "true", 
        "resultOffset": 0,
        "resultRecordCount": 1000,  # or max allowed
    }

    # # Filtering logic — only apply if value is not empty
    # corine = gpd.read_file("./corine.shp")

    try:
        corine_url = "https://image.discomap.eea.europa.eu/arcgis/rest/services/Corine/CLC2018_WM/MapServer/0"
        response = requests.get(corine_url, params=params, timeout=30)
        response.raise_for_status()
        try:
            geojson = response.json()
        except Exception as e:
            print("Failed to parse JSON")
            raise e

        # if zone:
        #     try:
        #         zone_code = int(zone)
        #         geojson["features"] = [
        #             f for f in geojson["features"]
        #             if f["properties"].get("Code_18") == zone_code
        #         ]
        #     except ValueError:
        #         pass  # Invalid zone filter

        return jsonify(geojson)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    # Return filtered GeoJSON
    # geojson = corine.to_crs(epsg=4326).to_json()
    # return Response(geojson, mimetype="application/json")
    
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