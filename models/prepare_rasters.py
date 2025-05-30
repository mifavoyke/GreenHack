from rasterio.transform import from_bounds
from rasterio.features import rasterize
from shapely.geometry import box
import geopandas as gpd
import os
import matplotlib.pyplot as plt
import pickle
import numpy as np

TARGET_CRS = "EPSG:5514"
GRID_SHAPE = (1000, 1000)  # rows, cols

cz_border = gpd.read_file("/home/yhusieva/sgoinfre/GreenHack/models/CZ_Shape/gadm41_CZE_shp/gadm41_CZE_2.shp")
cz_border = cz_border.to_crs(TARGET_CRS)

def get_transform_and_bounds():
    corine = gpd.read_file("/home/yhusieva/sgoinfre/GreenHack/models/data/CORINE/U2018_CLC2018_V2020_20u1.shp/U2018_CLC2018_V2020_20u1.shp")
    corine = corine.to_crs(TARGET_CRS)
    bounds = corine.total_bounds  # [minx, miny, maxx, maxy]
    
    # Shrink slightly to crop any weird edge effects
    minx, miny, maxx, maxy = bounds
    buffer = 10000  # 10km
    minx += buffer
    miny += buffer
    maxx -= buffer
    maxy -= buffer

    transform = from_bounds(minx, miny, maxx, maxy, GRID_SHAPE[1], GRID_SHAPE[0])
    bounds_geom = box(minx, miny, maxx, maxy)
    return transform, bounds_geom

def rasterize_gdf(gdf, value_column, transform):
    out_shape = GRID_SHAPE
    shapes = ((geom, val) for geom, val in zip(gdf.geometry, gdf[value_column]))
    return rasterize(shapes, out_shape=out_shape, transform=transform, fill=0, dtype='float32')

def process_corine(transform, bounds_geom):
    corine = gpd.read_file("/home/yhusieva/sgoinfre/GreenHack/models/data/CORINE/U2018_CLC2018_V2020_20u1.shp/U2018_CLC2018_V2020_20u1.shp")
    corine = corine.to_crs(TARGET_CRS)
    corine = corine[corine.geometry.intersects(bounds_geom)]
    
    corine["score"] = corine["Code_18"].map({
        111: 1, 112: 2, 121: 1, 211: 3,
        231: 25, 311: 40, 312: 40, 324: 20, 511: 50
    }).fillna(10)

    return rasterize_gdf(corine, "score", transform)

def process_natura(transform, bounds_geom):
    natura = gpd.read_file("/home/yhusieva/sgoinfre/GreenHack/models/data/NATURA2000/eea_v_3035_100_k_natura2000_p_2023_v01_r00/SHP_files/Natura2000_end2023_epsg3035.shp")
    natura = natura.to_crs(TARGET_CRS)
    natura = natura[natura.geometry.intersects(bounds_geom)]
    natura = gpd.overlay(natura, cz_border, how="intersection")

    natura["score"] = 50  # Massive penalty to avoid
    return rasterize_gdf(natura, "score", transform)

def process_zabaged(transform, bounds_geom):
    zabaged_path = "/home/yhusieva/sgoinfre/GreenHack/models/data/ZABAGED/ZABAGED-5514-gpkg-20250407/ZABAGED_RESULTS.gpkg"
    layer_name = "ElektrickeVedeni"  # ⚠️ try this one first
    zabaged = gpd.read_file(zabaged_path, layer=layer_name)
    zabaged = zabaged.to_crs(TARGET_CRS)
    zabaged = zabaged[zabaged.geometry.intersects(bounds_geom)]
    zabaged = gpd.overlay(zabaged, cz_border, how="intersection")

    zabaged["score"] = -10  # Reduce cost to favour these cells
    return rasterize_gdf(zabaged, "score", transform)

transform, bounds_geom = get_transform_and_bounds()
corine_raster = process_corine(transform, bounds_geom)
natura_raster = process_natura(transform, bounds_geom)
zabaged_raster = process_zabaged(transform, bounds_geom)
# You can tune these weights later
final_grid = corine_raster + natura_raster + zabaged_raster
np.save("final_grid.npy", final_grid)
with open("transform.pkl", "wb") as f:
    pickle.dump(transform, f)

# TESTING
# def print_gdf_summary(path):
#     try:
#         gdf = gpd.read_file(path)
#         print(f"\n✅ {os.path.basename(path)}")
#         print(f"  CRS: {gdf.crs}")
#         print(f"  Number of features: {len(gdf)}")
#         print(f"  Columns: {list(gdf.columns)}")
#         print(f"  Geometry type: {gdf.geom_type.unique()}")
#         print("  Sample data:")
#         print(gdf.head(2))
#     except Exception as e:
#         print(f"❌ Failed to load {path}: {e}")

# print_gdf_summary("models/data/CORINE/U2018_CLC2018_V2020_20u1.shp")
# print_gdf_summary("models/data/NATURA2000/eea_v_3035_100_k_natura2000_p_2023_v01_r00/SHP files/Natura2000_end2023_epsg4326.shp")
# print_gdf_summary("models/data/ZABAGED/ZABAGED-5514-gpkg-20250407/ZABAGED_RESULTS.gpkg")

# def test_grid_with_overlay():
#     grid, transform = build_final_cost_grid()
#     corine = gpd.read_file("/home/yhusieva/sgoinfre/GreenHack/models/data/CORINE/U2018_CLC2018_V2020_20u1.shp/U2018_CLC2018_V2020_20u1.shp")
#     corine = corine.to_crs(TARGET_CRS)

#     fig, ax = plt.subplots(figsize=(12, 12))
#     ax.set_title("Final Grid")

#     extent = (
#         transform.c,
#         transform.c + transform.a * grid.shape[1],
#         transform.f + transform.e * grid.shape[0],
#         transform.f
#     )
#     ax.imshow(grid, cmap='viridis', extent=extent, origin='upper')
#     corine.boundary.plot(ax=ax, linewidth=0.2, color="white")
#     plt.axis('off')
#     plt.show()

# test_grid_with_overlay()
