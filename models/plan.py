import geopandas as gdp
from rasterio.transform import rowcol
import numpy as np
import pickle
from pyproj import Transformer
import matplotlib.pyplot as plt
from pathfinding import a_star

def coords_to_index(x, y, transform):
    row, col = rowcol(transform, x, y)
    return (row, col)

def index_to_coords(row, col, transform):
    x, y = transform * (col + 0.5, row + 0.5)
    return (x, y)

def reproject_coords(lon, lat):
    x, y = transformer.transform(lon, lat)
    return x, y

with open("transform.pkl", "rb") as f:
    transform = pickle.load(f)
final_grid = np.load("final_grid.npy")

transformer = Transformer.from_crs("EPSG:4326", "EPSG:5514", always_xy=True)

start = (14.4378, 50.0755)  # Prague
end = (16.6068, 49.1951)    # Brno

start_x, start_y = reproject_coords(14.4378, 50.0755) # Reproject start and goal coords first
goal_x, goal_y = reproject_coords(16.6068, 49.1951)
print(start_x, start_y)
start_idx = coords_to_index(start_x, start_y, transform)
goal_idx = coords_to_index(goal_x, goal_y, transform)

path_indices = a_star(final_grid, start_idx, goal_idx)
path_coords = [index_to_coords(r, c, transform) for r, c in path_indices]

for idx, (x, y) in enumerate(path_coords):
    print(f"Step {idx}: ({x:.5f}, {y:.5f})")


# import folium
# # Set the centre of your map over the Czech Republic
# m = folium.Map(location=[49.8, 15.0], zoom_start=7)
# folium.GeoJson(
#     corine,
#     style_function=lambda x: {
#         'fillColor': '#ff0000' if x['properties']['impact_score'] > 5 else '#00ff00',
#         'color': 'black',
#         'weight': 0.1
#     }
# ).add_to(m)
# m.save('map.html')

# Create a colormap for impact scores
# import matplotlib.pyplot as plt
# Matplotlib is a general-purpose plotting library,
#   not only for maps — it does bar charts, scatter plots, line graphs, etc.
#   But thanks to GeoPandas, it can also draw maps of shapefiles with .plot()

# corine.plot(column='impact_score', cmap='RdYlGn_r', legend=True)
# plt.title("Land Impact Score Visualisation")
# plt.axis('off')
# plt.show()

# urban = corine[corine['Code_18'].str.contains("324")]
# urban.plot()
# plt.show()