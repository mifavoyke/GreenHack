from rasterio.transform import rowcol
import numpy as np
import pickle
from pyproj import Transformer
from pathfinding import a_star

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

def plan_route(x0, y0, x1, y1):
    start_x, start_y = reproject_coords(x0, y0)
    goal_x, goal_y = reproject_coords(x1, y1)
    # print(start_x, start_y)
    start_idx = coords_to_index(start_x, start_y, transform)
    goal_idx = coords_to_index(goal_x, goal_y, transform)
    path_indices = a_star(final_grid, start_idx, goal_idx)
    path_coords = [index_to_coords(r, c, transform) for r, c in path_indices]
    geo_path_coords = [to_wgs84.transform(x, y)[::-1] for x, y in path_coords]
    formatted_coords = [{"x": lat, "y": lng} for lng, lat in geo_path_coords]
    return (formatted_coords)
