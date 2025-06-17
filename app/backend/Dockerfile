# Use official Python base image
FROM python:3.10-slim

# Set working directory
WORKDIR /backend

# Copy files
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose Flask port
EXPOSE 5000

# Run the app
CMD ["python", "app.py"]