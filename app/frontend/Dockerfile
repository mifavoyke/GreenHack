# multi-stage build - first build with node, then deploy with nginx

# Stage 1: Build
FROM node:18 AS build

WORKDIR /frontend

COPY package*.json ./

RUN npm install

COPY . .

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