import geopandas as gdp

corine = gdp.read_file("/Users/yevahusieva/Documents/42/GreenHack/models/data/corine_cz_2018/U2018_CLC2018_V2020_20u1.shp/U2018_CLC2018_V2020_20u1.shp", encoding='utf-8')
print(corine.columns)
print(corine['Code_18'].unique())
print(corine.dtypes)
print(corine.head())
corine['Code_18'] = corine['Code_18'].astype(int)
SCORES = {
    111: 1,
    112: 2,
    121: 1,
    211: 3,
    231: 6,
    311: 8,
    312: 8,
    324: 6,
    511: 10
}
corine['impact_score'] = corine['Code_18'].map(SCORES)
corine['impact_score'] = corine['impact_score'].fillna(10)
corine_labels = {
    '111': 'Continuous urban fabric',
    '112': 'Discontinuous urban fabric',
    '121': 'Industrial or commercial units',
    '211': 'Non-irrigated arable land',
    '231': 'Pastures',
    '311': 'Broad-leaved forest',
    '312': 'Coniferous forest',
    '313': 'Mixed forest',
    '324': 'Transitional woodland-shrub',
    '511': 'Water bodies',
}
corine['CLC_name'] = corine['Code_18'].map(corine_labels)

# import folium
# # Set the centre of your map over the Czech Republic
# m = folium.Map(location=[49.8, 15.0], zoom_start=7)
# folium.GeoJson(
#     corine,
#     style_function=lambda x: {
#         'fillColor': '#ff0000' if x['properties']['impact_score'] > 5 else '#00ff00',
#         'color': 'black',
#         'weight': 0.5
#     }
# ).add_to(m)
# m.save('map.html')

# Create a colormap for impact scores
import matplotlib.pyplot as plt
# Matplotlib is a general-purpose plotting library,
#   not only for maps — it does bar charts, scatter plots, line graphs, etc.
#   But thanks to GeoPandas, it can also draw maps of shapefiles with .plot()

corine.plot(column='impact_score', cmap='RdYlGn_r', legend=True)
plt.title("Land Impact Score Visualisation")
plt.axis('off')
plt.show()

# urban = corine[corine['Code_18'].str.contains("324")]
# urban.plot()
# plt.show()