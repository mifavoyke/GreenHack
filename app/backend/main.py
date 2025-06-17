from flask import Flask, request, jsonify
from flask_cors import CORS
from flask import Response
import geopandas as gpd
from plan import compute_multi_route

app = Flask(__name__)

CORS(app)

@app.route("/api/map-data", methods=["POST"])
def get_filtered_map_data():
    filters = request.get_json()
    print("Received filters:", filters)

    # Filtering logic — only apply if value is not empty
    corine = gpd.read_file("./corine.shp")

    if filters.get("zone"):
        try:
            zone_code = int(filters["zone"])
            corine = corine[corine["Code_18"] == zone_code]
        except ValueError:
            pass     # If conversion fails, ignore the filter or handle error

    # Example of other filters (adjust column names as needed)
    # if filters.get("voltage"):
    #     corine = corine[corine["voltage_column"] == filters["voltage"]]

    # if filters.get("lineType"):
    #     corine = corine[corine["line_type_column"] == filters["lineType"]]

    # Add similar filters for lineStatus, zone, terrainType, weatherCondition if you have those columns

    # Return filtered GeoJSON
    geojson = corine.to_crs(epsg=4326).to_json()
    return Response(geojson, mimetype="application/json")
    
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