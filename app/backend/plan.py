from rasterio.transform import rowcol
import numpy as np
import pickle
from pyproj import Transformer
from pathfinding import a_star
from math import radians, sin, cos, sqrt, atan2

transformer = Transformer.from_crs("EPSG:4326", "EPSG:5514", always_xy=True)
to_wgs84 = Transformer.from_crs("EPSG:5514", "EPSG:4326", always_xy=True)
with open("transform.pkl", "rb") as f:
    transform = pickle.load(f)
final_grid = np.load("final_grid.npy")

def coords_to_index(x, y, transform):
    row, col = rowcol(transform, x, y)
    return (row, col)

def index_to_coords(row, col, transform):
    x, y = transform * (col + 0.5, row + 0.5)
    return (x, y)

def reproject_coords(lon, lat):
    x, y = transformer.transform(lon, lat)
    return x, y

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in kilometres
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

def compute_multi_route(points):
    if len(points) < 2:
        raise ValueError("Need at least two points to plan a route.")
    
    all_coords = []
    total_length = 0.0

    for i in range(len(points) - 1):
        start = points[i]
        goal = points[i + 1]

        # Reproject to S-JTSK
        start_x, start_y = reproject_coords(start["x"], start["y"])
        goal_x, goal_y = reproject_coords(goal["x"], goal["y"])

        # Convert to grid indices
        start_idx = coords_to_index(start_x, start_y, transform)
        goal_idx = coords_to_index(goal_x, goal_y, transform)

        # Compute A* path
        path_indices = a_star(final_grid, start_idx, goal_idx)

        # Convert path to S-JTSK then to WGS84
        path_coords = [index_to_coords(r, c, transform) for r, c in path_indices]
        geo_path_coords = [to_wgs84.transform(x, y)[::-1] for x, y in path_coords]  # (lat, lng)

        # Avoid duplicate join points
        if i != 0:
            geo_path_coords = geo_path_coords[1:]

        # Accumulate length
        for j in range(1, len(geo_path_coords)):
            lat1, lon1 = geo_path_coords[j - 1]
            lat2, lon2 = geo_path_coords[j]
            total_length += haversine(lat1, lon1, lat2, lon2)

        # Format for frontend
        formatted_coords = [{"x": lat, "y": lng} for lng, lat in geo_path_coords]
        all_coords.extend(formatted_coords)

    return all_coords, round(total_length, 2)
