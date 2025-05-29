# Green Hack
## CORINE Land Cover
https://land.copernicus.eu/en/products/corine-land-cover
Format: Shapefile or GeoTIFF
- classifies every bit of land in Europe into categories based on how the land is used or what covers it.
## Use this to determine:
- Which areas are forested (avoid)
- Which are agricultural (maybe)
- Which are industrial or already degraded (good candidates)

When download and unzip the CORINE dataset, there's a bunch of files in the CORINE Shapefile:
CLC2018_CZ.shp
CLC2018_CZ.dbf
CLC2018_CZ.shx
CLC2018_CZ.prj
...
all files are necessary for GeoPandas.
These form a shapefile, and they go together like gin and tonic. The key file is .shp, but .dbf holds the attribute data (what kind of land it is), and .prj gives you the projection info (so maps don’t look like drunk spaghetti).

## Natura 2000 Protected Areas
https://www.eea.europa.eu/en/datahub/datahubitem-view/6fc8ad2d-195d-40f4-bdec-576e7d1268e4?activeAccordion=1095295%2C1095296
A map of all protected sites under the EU’s Natura 2000 network — these areas are designated to preserve specific species and habitats.
These are hard constraints — building transmission lines here is either impossible or extremely difficult.
