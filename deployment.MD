# SETUP FOR THE EC2 INSTANCE - user data script

sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release

### add officila docker key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

### add docker's apt repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release-cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

### update package list and install docker 
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

### run docker without sudo
sudo usermod -aG docker $USER
newgrp docker

# Start Docker now - containers will not run unless manually started
sudo systemctl start docker

# Enable Docker to start on boot - so docker will automatically start when instance boots, so we do not have to start it manually
sudo systemctl enable docker

### install git and docker compose
sudo apt install -y git
sudo apt install docker-compose-plugin
docker compose up -d

### pull the code initially
git clone https://github.com/mifavoyke/GreenHack.git app

# FRONTEND 
cd greenhack/app/frontend

### build the frontend after change
docker build -t my-frontend .

### !!! variables are stored in local .env file and inject environment variables at build time via --build-arg

export $(cat .env | xargs)

docker build  \
--build-arg REACT_APP_API_URL=$REACT_APP_API_URL \
--build-arg REACT_APP_OPENSTREETMAP_URL=$REACT_APP_OPENSTREETMAP_URL \
--build-arg REACT_APP_ZABAGED_220V=$REACT_APP_ZABAGED_220V \
--build-arg REACT_APP_ZABAGED_400V=$REACT_APP_ZABAGED_400V \
-t my-frontend .


### run the container 
docker run -d -p 80:80 --name frontend my-frontend

# BACKEND
cd greenhack/app/backend

##### do not need to use .venv inside a Docker container - Docker isolates everything inside the container so we are already using a clean Python environment via the base image (e.g., python:3.10-slim) so .venv would be redundant

### build the backend after change
docker build -t my-backend .

### run the container 
docker run -d -p 5000:5000 --name backend my-backend




