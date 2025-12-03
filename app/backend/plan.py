"""
plan.py - Optimized A* route planner (single-file).

Features:
- Keeps your reprojection and grid loading (transform.pkl, final_grid.npy).
- A* core uses NumPy arrays (no Python dict overhead).
- Corridor mask to drastically limit search area.
- Optional parallel execution for multiple segments (each worker loads the grid itself).
- Returns the same output your frontend expects:
    {"route": [{"x": <lng>, "y": <lat>}, ...], "totalLength": <km>}

Usage:
- Drop into your backend (same folder as transform.pkl and final_grid.npy).
- Import compute_route(points) into main.py or your Flask route.
- Configure DEBUG, USE_PARALLEL, CORRIDOR_WIDTH, SEGMENT_TIMEOUT if needed.

Notes:
- Parallel mode spawns processes that each load final_grid.npy. This avoids copying a big numpy
  array from the parent process and is more robust on macOS.
- Keep your Docker/Gunicorn memory/timeouts reasonable; this reduces memory usage but very large
  queries may still be heavy.
"""

from rasterio.transform import rowcol
import numpy as np
import pickle
from pyproj import Transformer
from math import radians, sin, cos, sqrt, atan2
import heapq
from concurrent.futures import ProcessPoolExecutor, as_completed
import os
import time

# ------------- CONFIG -------------
DEBUG = False            # Set True to print debug traces
USE_PARALLEL = True      # Use multiprocessing for multiple segments
CORRIDOR_WIDTH = 40      # corridor half-width in grid cells (tweak to taste)
SEGMENT_TIMEOUT = 25     # seconds per segment (worker timeout)
MAX_WORKERS = 3          # processes for parallel execution (min(cores, ...))
# ----------------------------------

# Load transformers and grid
transformer = Transformer.from_crs("EPSG:4326", "EPSG:5514", always_xy=True)
to_wgs84 = Transformer.from_crs("EPSG:5514", "EPSG:4326", always_xy=True)

_BASE = os.path.dirname(__file__) if '__file__' in globals() else '.'
_transform_path = os.path.join(_BASE, "transform.pkl")
_grid_path = os.path.join(_BASE, "final_grid.npy")

with open(_transform_path, "rb") as f:
    transform = pickle.load(f)

# final_grid: lower cost = preferred (I assume)
# Load grid and convert to lightweight dtype
final_grid = np.load(_grid_path).astype(np.uint16)
  # keep in memory for single-process use

# ------------- helpers: coordinate transforms -------------
def coords_to_index(x, y, transform_local=transform):
    """
    Convert S-JTSK coordinates (x,y in EPSG:5514) to grid row,col using rasterio.transform.rowcol.
    Returns (row, col) integers.
    """
    row, col = rowcol(transform_local, x, y)
    return int(row), int(col)

def index_to_coords(row, col, transform_local=transform):
    """
    Convert grid row,col to S-JTSK coordinates (x,y).
    """
    x, y = transform_local * (col + 0.5, row + 0.5)
    return float(x), float(y)

def reproject_coords(lon, lat):
    """
    Reproject WGS84 lon,lat to S-JTSK (x,y).
    """
    x, y = transformer.transform(lon, lat)
    return float(x), float(y)

def haversine(lat1, lon1, lat2, lon2):
    """
    Distance between lat/lon in kilometres.
    """
    R = 6371.0  # km
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

# ------------- Optimised A* (NumPy arrays, no dicts) -------------
def make_corridor_mask(grid_shape, start_rc, goal_rc, width):
    """
    Build boolean mask of allowed cells within given perpendicular distance (in cells)
    from the line connecting start->goal. grid_shape = (rows, cols).
    width = half-width in grid cells (integer).
    """
    rows, cols = grid_shape
    r0, c0 = start_rc
    r1, c1 = goal_rc

    # Precompute line vector and denominator
    dr = r1 - r0
    dc = c1 - c0
    denom = dr*dr + dc*dc
    if denom == 0:
        # start == goal
        m = np.zeros((rows, cols), dtype=bool)
        if 0 <= r0 < rows and 0 <= c0 < cols:
            m[r0, c0] = True
        return m

    rr = np.arange(rows)[:, None]
    cc = np.arange(cols)[None, :]

    # Compute perpendicular distance to line using cross-product magnitude / |v|
    # but we can keep squared distances scaled; we compare with width**2 * denom to avoid sqrt
    num = np.abs((dr) * (cc - c0) - (dc) * (rr - r0))
    # distance_in_cells = num / sqrt(denom)
    mask = num <= (width * np.sqrt(denom))
    return mask

def a_star_numpy_grid(grid, start, goal, corridor_mask=None):
    """
    grid: 2D numpy array of costs (lower = preferred)
    start, goal: (row, col) tuples of integers
    corridor_mask: optional boolean array same shape as grid (True=allowed)
    returns: list of (row,col) tuples path from start to goal or empty list if not found
    """
    rows, cols = grid.shape
    sr, sc = start
    gr, gc = goal

    # Bounds check
    if not (0 <= sr < rows and 0 <= sc < cols and 0 <= gr < rows and 0 <= gc < cols):
        if DEBUG:
            print("Start or goal out of bounds", start, goal)
        return []

    # If start==goal quick return
    if sr == gr and sc == gc:
        return [(sr, sc)]

    # Preallocated arrays
    g_score = np.full((rows, cols), np.inf, dtype=np.float64)
    visited = np.zeros((rows, cols), dtype=bool)
    # parent array: for memory economy store as int32 pairs; initialized to -1
    parent = np.full((rows, cols, 2), -1, dtype=np.int32)

    g_score[sr, sc] = 0.0

    # heap entries: (f_score, counter, (r,c)) ; counter prevents tuple compare issues
    heap = []
    counter = 0
    def heuristic(a_r, a_c, b_r, b_c):
        # Manhattan heuristic (fast, admissible on grids with 4-neigh)
        return abs(a_r - b_r) + abs(a_c - b_c)

    f0 = heuristic(sr, sc, gr, gc)
    heapq.heappush(heap, (f0, counter, (sr, sc)))
    counter += 1

    # 4-connected moves
    moves = ((-1,0), (1,0), (0,-1), (0,1))

    # main loop
    while heap:
        fval, _, (r, c) = heapq.heappop(heap)
        if visited[r, c]:
            continue
        visited[r, c] = True

        # reached goal?
        if r == gr and c == gc:
            # reconstruct
            path = []
            cr, cc = r, c
            while not (cr == -1 and cc == -1):
                path.append((int(cr), int(cc)))
                pr, pc = parent[cr, cc]
                if pr == -1:
                    break
                cr, cc = pr, pc
            path.reverse()
            return path

        for dr, dc in moves:
            nr = r + dr
            nc = c + dc
            if nr < 0 or nr >= rows or nc < 0 or nc >= cols:
                continue
            if corridor_mask is not None and not corridor_mask[nr, nc]:
                continue

            # you may want to treat very high cost as impassable; adjust threshold if needed
            # e.g., if grid[nr, nc] > SOME_BIG_NUMBER: continue
            tentative = g_score[r, c] + float(grid[nr, nc])

            if tentative < g_score[nr, nc]:
                g_score[nr, nc] = tentative
                parent[nr, nc, 0] = r
                parent[nr, nc, 1] = c
                h = heuristic(nr, nc, gr, gc)
                heapq.heappush(heap, (tentative + h, counter, (nr, nc)))
                counter += 1

    # not found
    return []

# ------------- worker function for parallel segments -------------
def _astar_worker(args):
    """
    Worker function executed in a separate process.
    Loads grid from disk (final_grid.npy) to avoid pickling huge arrays.
    args: (start_rc, goal_rc, width)
    returns: list of (r,c) tuples or empty list
    """
    try:
        start_rc, goal_rc, width = args
        # load grid locally in worker
        grid_local = np.load(_grid_path)
        # build corridor
        mask = make_corridor_mask(grid_local.shape, start_rc, goal_rc, width)
        path = a_star_numpy_grid(grid_local, start_rc, goal_rc, corridor_mask=mask)
        return path
    except Exception as e:
        # in worker, return empty on failure
        if DEBUG:
            print("Worker error:", e)
        return []

# ------------- main compute_route (public API) -------------
def compute_route(points):
    """
    points: list of {'x': <lng>, 'y': <lat>} coming from frontend as {x:lng, y:lat}
    Returns: (planned_route, total_length_km)
      planned_route: list of {"x": lng, "y": lat}  (same as input coordinate order)
      total_length: float in kilometres (rounded to 2 decimals)
    """
    if len(points) < 2:
        raise ValueError("Need at least two points to plan a route.")

    # Convert input points to grid indices
    segments = []
    for i in range(len(points) - 1):
        s = points[i]
        g = points[i+1]

        # reproject lon,lat -> S-JTSK
        sx, sy = reproject_coords(s["x"], s["y"])
        gx, gy = reproject_coords(g["x"], g["y"])

        # to grid indices (row,col)
        s_idx = coords_to_index(sx, sy, transform)
        g_idx = coords_to_index(gx, gy, transform)

        segments.append((s_idx, g_idx))

    # If only one segment, do it directly (avoid process overhead)
    results = []
    if not USE_PARALLEL or len(segments) == 1:
        for start_idx, goal_idx in segments:
            # make corridor mask based on in-memory grid for speed
            mask = make_corridor_mask(final_grid.shape, start_idx, goal_idx, CORRIDOR_WIDTH)
            path_idx = a_star_numpy_grid(final_grid, start_idx, goal_idx, corridor_mask=mask)
            results.append(path_idx)
    else:
        # parallel execution: each worker loads grid from file.
        args = [(s_idx, g_idx, CORRIDOR_WIDTH) for (s_idx, g_idx) in segments]
        with ProcessPoolExecutor(max_workers=min(MAX_WORKERS, len(args))) as ex:
            futures = [ex.submit(_astar_worker, a) for a in args]
            for fut in as_completed(futures, timeout=None):
                try:
                    path_idx = fut.result(timeout=SEGMENT_TIMEOUT)
                    results.append(path_idx)
                except Exception as e:
                    if DEBUG:
                        print("Segment worker failed:", e)
                    results.append([])

    # combine segments, convert to lat/lng coords, compute length
    all_coords = []
    total_length = 0.0

    for i, path_idx in enumerate(results):
        if not path_idx:
            # failed segment -> raise so caller sees error
            raise RuntimeError(f"A* failed for segment {i}")

        # convert indices (row,col) -> S-JTSK coords -> WGS84 lat,lng
        path_coords_sjtsk = [index_to_coords(r, c, transform) for (r, c) in path_idx]
        # to_wgs84.transform(x,y) -> returns (lon, lat), we need (lat, lon)
        geo_path_latlon = [(to_wgs84.transform(x, y)[1], to_wgs84.transform(x, y)[0]) for (x, y) in path_coords_sjtsk]
        # geo_path_latlon elements: (lat, lon)

        # avoid repeating the first point if it was included by previous segment
        if i != 0 and len(geo_path_latlon) > 0:
            geo_path_latlon = geo_path_latlon[1:]

        # accumulate length (haversine expects lat, lon)
        for j in range(1, len(geo_path_latlon)):
            lat1, lon1 = geo_path_latlon[j-1]
            lat2, lon2 = geo_path_latlon[j]
            total_length += haversine(lat1, lon1, lat2, lon2)

        # format for frontend: {"x": lng, "y": lat}
        formatted = [{"x": float(lon), "y": float(lat)} for (lat, lon) in geo_path_latlon]
        all_coords.extend(formatted)

    return all_coords, round(total_length, 2)


# # If run directly, quick sanity test (not required in production)
# if __name__ == "__main__":
#     # small interactive test - pick two points in Prague as demo (lon, lat)
#     demo_points = [
#         {"x": 14.42076, "y": 50.08804},  # Prague center (lon, lat)
#         {"x": 14.4378, "y": 50.0755},    # small offset
#     ]
#     print("Running quick local test (this may be coarse).")
#     t0 = time.time()
#     route, length = compute_route(demo_points)
#     t1 = time.time()
#     print("Time:", t1 - t0, "s")
#     print("Route length km:", length)
#     print("Route points:", route[:5], "...", "total points:", len(route))
