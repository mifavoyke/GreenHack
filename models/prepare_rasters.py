from rasterio.transform import from_bounds
from rasterio.features import rasterize
from shapely.geometry import box
import geopandas as gpd
import os
import matplotlib.pyplot as plt
import pickle
import numpy as np
import rasterio
from rasterio.enums import Resampling as Rsp

TARGET_CRS = "EPSG:5514"
GRID_SHAPE = (1000, 1000)  # rows, cols

cz_border = gpd.read_file("../backend/corine.shp")
cz_border = cz_border.to_crs(TARGET_CRS)

# def process_temperature_raster(transform):
#     path = "/sgoinfre/yhusieva/GreenHack/models/data/TEMPERATURE/192656/c_gls_LST_202505011400_GLOBE_GEO_V2.1.1__esko_LST.tif"  # pick one LST file
#     array = load_raster_as_array(path, transform, GRID_SHAPE, TARGET_CRS)
#     # Convert Kelvin to Celsius
#     array = array - 273.15
#     # Normalise (adjust these thresholds based on your context)
#     normalised = np.clip((array - 10) / 30, 0, 1)  # scale between 0 (cool) and 1 (hot)
#     return normalised * 20  # Scale penalty up to max 20

# def process_moisture_raster(transform):
#     path = "/sgoinfre/yhusieva/GreenHack/models/data/MOISTURE/Results/c_gls_SSM1km_202505080000_CEURO_S1CSAR_V1.2.1__esko_ssm.tif"  # pick one .tif file
#     array = load_raster_as_array(path, transform, GRID_SHAPE, TARGET_CRS)
#     # Normalise: scale 0–1 (assuming 0–100 is possible range)
#     normalised = np.clip(array / 100.0, 0, 1)
#     return normalised * 15  # moisture penalty

def get_transform_and_bounds():
    corine = gpd.read_file("../backend/corine.shp")
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
    corine = gpd.read_file("../backend/corine.shp")
    corine = corine.to_crs(TARGET_CRS)
    corine = corine[corine.geometry.intersects(bounds_geom)]
    
    corine["score"] = corine["Code_18"].map({
        111: 1,   # Continuous Urban
        112: 2,   # Discontinuous Urban
        121: 1,   # Industrial
        211: 5,   # Arable Land – more suitable
        231: 8,   # Pastures – better than forests
        311: 30,  # Broadleaf Forest
        312: 35,  # Coniferous Forest – slightly harder
        313: 32,  # Mixed Forest
        321: 12,  # Natural Grasslands
        322: 10,  # Moors and Heathland – not awful
        324: 18,  # Transitional Woodland
        511: 50,  # Water
        512: 45,  # Water bodies
        523: 20,  # Sea and ocean – less relevant inland but still bad
    }).fillna(15)  # Reasonable default for other land types

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

    zabaged["score"] = -20  # Reduce cost to favour these cells
    return rasterize_gdf(zabaged, "score", transform)

transform, bounds_geom = get_transform_and_bounds()
print("Processing CORINE...")
corine_raster = process_corine(transform, bounds_geom)
print("Processing NATURA2000...")
natura_raster = process_natura(transform, bounds_geom)
print("Processing ZABAGED...")
zabaged_raster = process_zabaged(transform, bounds_geom)
# print("Processing Temperature...")
# temp_raster = process_temperature_raster(transform)
# print(f"Temperature (°C) – min: {temp_raster.min() + 273.15}, max: {temp_raster.max() + 273.15}")
# print("Processing Moisture...")
# moisture_raster = process_moisture_raster(transform)
# print(f"Moisture (%) – min: {moisture_raster.min() / 15 * 100}, max: {moisture_raster.max() / 15 * 100}")
final_grid = (
    corine_raster +
    natura_raster +
    zabaged_raster
    # temp_raster +
    # moisture_raster
)
np.save("/home/yhusieva/sgoinfre/GreenHack/app/backend/final_grid.npy", final_grid)
with open("/home/yhusieva/sgoinfre/GreenHack/app/backend/transform.pkl", "wb") as f:
    pickle.dump(transform, f)

# def show_final_grid(grid, transform, cz_border):
#     extent = (
#         transform.c,
#         transform.c + transform.a * grid.shape[1],
#         transform.f + transform.e * grid.shape[0],
#         transform.f
#     )

#     fig, ax = plt.subplots(figsize=(12, 12))
#     ax.set_title("Final Combined Cost Grid")
#     grid_img = ax.imshow(grid, cmap='viridis', extent=extent, origin='upper')
#     cz_border.boundary.plot(ax=ax, linewidth=0.5, color="white")
#     fig.colorbar(grid_img, ax=ax, shrink=0.8, label="Combined Penalty")
#     ax.axis('off')
#     plt.tight_layout()
#     plt.show()

# show_final_grid(final_grid, transform, cz_border)