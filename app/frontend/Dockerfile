# multi-stage build - first build with node, then deploy with nginx

# Stage 1: Build
FROM node:18 AS build

WORKDIR /frontend

COPY package*.json ./

RUN npm ci

COPY . .

# use envs from local .env 
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

ARG REACT_APP_OPENSTREETMAP_URL
ENV REACT_APP_OPENSTREETMAP_URL=$REACT_APP_OPENSTREETMAP_URL

ARG REACT_APP_ZABAGED_220V
ENV REACT_APP_ZABAGED_220V=$REACT_APP_ZABAGED_220V

ARG REACT_APP_ZABAGED_400V
ENV REACT_APP_ZABAGED_400V=$REACT_APP_ZABAGED_400V

RUN npm run build

# Stage 2: Deploy
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /frontend/build /usr/share/nginx/html

# Optional: Replace default NGINX config if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]