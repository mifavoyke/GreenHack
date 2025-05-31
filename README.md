# Green Hack

<h1 align="center" style="color:#55F03D; background:#FF69B4; padding:20px; border-radius:12px; border: 4px dashed #FFD700;">
  🎉 PRESENTATION 🎉<br>
  <a href="./your-presentation.pdf" style="color:#ffffff; font-size:24px; text-decoration:underline;">
    📄 View Full Presentation (PDF)
  </a>
</h1>

## CORINE Land Cover
https://land.copernicus.eu/en/products/corine-land-cover
Format: Shapefile or GeoTIFF
- classifies every bit of land in Europe into categories based on how the land is used or what covers it.
## Use this to determine:
- Which areas are forested (avoid)
- Which are agricultural (maybe)
- Which are industrial or already degraded (good candidates)

When download and unzip the CORINE dataset, there's a bunch of files in the CORINE Shapefile:
```
CLC2018_CZ.shp
CLC2018_CZ.dbf
CLC2018_CZ.shx
CLC2018_CZ.prj
...
```
all files are necessary for GeoPandas.
These form a shapefile, and they go together like gin and tonic. The key file is .shp, but .dbf holds the attribute data (what kind of land it is), and .prj gives you the projection info (so maps don’t look like drunk spaghetti).

## Natura 2000 Protected Areas
https://www.eea.europa.eu/en/datahub/datahubitem-view/6fc8ad2d-195d-40f4-bdec-576e7d1268e4?activeAccordion=1095295%2C1095296
A map of all protected sites under the EU’s Natura 2000 network — these areas are designated to preserve specific species and habitats.
These are hard constraints — building transmission lines here is either impossible or extremely difficult.

https://land.copernicus.eu/en/products/temperature-and-reflectance/10-daily-land-surface-temperature-thermal-condition-index-global-v1-0-5km
https://land.copernicus.eu/en/products/soil-moisture/daily-surface-soil-moisture-v1.0

Parameters to consider:
- existing grid + its deprecation grade
- hills

Checklist:
1. Preprocess the Data
2. Create scoring
3. Separate areas by colours
4. Implement the pathfinding algorithm

Data needed:
- Energy infrastructure and its current condition
- Protected areas and biodiversity / protected species
- Transport and urban plans
- Climate, hydrology and water bodies
- Hills

A* (pronounced "A-star") is a graph-based pathfinding algorithm. It finds the most efficient path between two nodes (e.g. points on a map), using:
- g(n): cost from the start node to node n.
- h(n): heuristic estimate of the cost from n to the goal.
- f(n) = g(n) + h(n): total estimated cost of the cheapest path through n.
Nodes could represent grid cells or specific points on your map, and the cost can be influenced by:
- impact_score (from CORINE),
- temperature or flooding risks (Copernicus),
- legal constraints (Natura2000),
- existing infrastructure (ZABAGED).
cost = impact_score + temp_penalty + flood_penalty + legal_penalty
