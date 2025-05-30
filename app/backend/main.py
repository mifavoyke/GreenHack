from flask import Flask, request, jsonify
from flask_cors import CORS
from flask import Response
import geopandas as gpd

app = Flask(__name__)
CORS(app)

@app.route("/api/map-data", methods=["POST"])
def get_filtered_map_data():
    filters = request.get_json()
    print("Received filters:", filters)

    corine = gpd.read_file(
        "/home/zpiarova/projects/greenhack/models/corine_cz_2018/data/U2018_CLC2018_V2020_20u1.shp",
        encoding="utf-8"
    )

    # Apply scores and labels
    SCORES = {
        111: 1, 112: 2, 121: 1, 211: 3,
        231: 6, 311: 8, 312: 8, 324: 6, 511: 10
    }
    corine["Code_18"] = corine["Code_18"].astype(int)
    corine["impact_score"] = corine["Code_18"].map(SCORES).fillna(10)

    corine_labels = {
        111: "Continuous urban fabric", 112: "Discontinuous urban fabric",
        121: "Industrial or commercial units", 211: "Non-irrigated arable land",
        231: "Pastures", 311: "Broad-leaved forest", 312: "Coniferous forest",
        313: "Mixed forest", 324: "Transitional woodland-shrub", 511: "Water bodies"
    }
    corine["CLC_name"] = corine["Code_18"].map(corine_labels)

    # Filtering logic — only apply if value is not empty
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
def plan_route():
    data = request.get_json()  # expecting: { points: [{x: ..., y: ...}, ...] }
    input_points = data.get("points", [])

    # For now just return 8 fixed points (dummy route)
    planned_route = [
        {"x": 14.42076, "y": 50.08804},  # Prague
        {"x": 14.4378, "y": 50.0755},
        {"x": 14.45, "y": 50.08},
        {"x": 14.46, "y": 50.09},
        {"x": 14.47, "y": 50.095},
        {"x": 14.48, "y": 50.10},
        {"x": 14.49, "y": 50.11},
        {"x": 14.50, "y": 50.115},
    ]

    # You would replace above with real route calculation logic

    return jsonify({"route": planned_route, "totalLength": 12.34})  # add any extra info

#  running the Flask server
if __name__ == "__main__":
    app.run(debug=True, port=5000)