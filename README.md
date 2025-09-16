# Green Hack

![Screenshot from 2025-05-31 11-44-24](https://github.com/user-attachments/assets/5cff5ee2-df24-4918-aa3d-35ff12931134)

![Screenshot from 2025-05-31 11-43-56](https://github.com/user-attachments/assets/d5f53f51-d57f-4c91-8732-0888b76ef81e)

![Screenshot from 2025-05-31 11-43-12](https://github.com/user-attachments/assets/49061588-0134-40c8-980c-7e46de34af3c)

## ABOUT GREENHACK

GreenHack 2025 is the fourth year of international sustainability hackathon tackling environmentally responsible development and future greatest challenges.

100+ international hackers participated to compete for great prizes with their solutions for one of the 6 specific challenges of this year's partners.

In the end, 19 teams finished and presented their ideas in front of a commitee made of industry experts from all challenges and the Hackathon organizers.

## THE CHALLENGE

Our team, Algorythm, selected the Grid & Green Challenge.

The challenge was sponsored by ČEPS. ČEPS, a.s. is a company responsible for operating the electricity transmission system in the territory of the Czech Republic (including power lines and equipment at 400 kV, 220 kV and selected lines and equipment at 110 kV). ČEPS provides transmission services within the Czech Republic and ensures the real-time balance between electricity production and consumption.

The challenge outline:

"Can we power the future without overpowering the planet? Join ČEPS at GreenHack 2025 and design innovative solutions that make energy infrastructure part of the natural landscape. Use tools like remote sensing, GIS, or AI to assess the environmental impact of today’s power grid and identify areas where sustainable transmission can grow in balance with ecosystems. Think long-term—your solution should hold up for the next 50 years. Leverage open data like Copernicus, CORINE Land Cover, ÚSES, ZABAGED, and more. Get exclusive access to datasets, expert mentoring from ČEPS, and a chance to shape the future of green energy."

## OUR SOLUTION

We developed a web-based tool that helps urban planners, civil engineers and grid design consultants find optimal power grid routes using GIS datasets like CORINE, ZABAGED, and Natura 2000. Our tool provides route visualisation algorithm optimised for cost, sustainability, proximity to existing infrastructure and other metrics selected by filtering options.

First we discussed with the industry mentors to find out which are relevant criteria for transmission routes planning. They identified which land types are most suitable for transmission routes, which are preferred, which should be avoided and which are forbidden due to ecological or other reasons.

We visualized the Czech republic as areas, which we took from the Corine dataset and which can be identified in a legend or by hovering over them. We also visualized the existing transmission routes, 400kV in black and 220kV in orange, to gain comprehension of the existing infrastructure. These data were from ZABAGED provided via ARCGIS API. Leaflet.js was used for visualization on the frontend. Clicking on the map created a list of coordinates, which is then sent to backend for processing and finding the optimal path by the A* pathfinding algorithm. The found path is sent back to frontend and again visualized with leaflet.

Zuzana worked on the frontend in React, frontend-backend communication using axios on frontend and flask on the python backend, fetching geodata from APIs - ARCGIS, rendering data and map components with Leaflet.js.

Yeva worked on searching and preprocessing necessary data in Python as well as creating algorithm for the most sustainable path for new transmission routes, taking into account humidity of the land, temperature distribution and forbidden territories.

## Authors

Built by Yeva Husieva & Zuzana Piarova