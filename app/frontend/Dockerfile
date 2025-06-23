# Lightweight container
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

COPY . /build

# Copy built frontend files to NGINX web root
COPY build/ /usr/share/nginx/html/

# Replace default NGINX config if you need routing (e.g. for React Router)
# You need to configure NGINX to redirect all requests to index.html, except for actual files like JS/CSS
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]