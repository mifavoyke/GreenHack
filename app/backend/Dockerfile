# Use official Python base image
FROM python:3.10-slim

# Set working directory
WORKDIR /backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libgdal-dev \
    gdal-bin \
    libspatialindex-dev \
    libgeos-dev \
    libproj-dev \
    libgl1 \
    libexpat1 \
    && rm -rf /var/lib/apt/lists/*

# Copy files
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose Flask port
EXPOSE 5000

# Run the app
# CMD ["python", "main.py"] # this only ran dev server on 127.0.0.1
# gunicorn starts a production-ready server listening on all interfaces on port 5000 
CMD ["gunicorn", "--timeout", "120", "-w", "1", "--bind", "0.0.0.0:5000", "main:app"] 