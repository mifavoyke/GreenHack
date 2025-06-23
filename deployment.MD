# JENKINS PIPELINE FOR A WEB TOOL - DESIGNING AND IMPLEMENTING CI/CD PIPELINE

I decided to take the Greenhack2025 project a step further to host it other than locally, make it easier for us to bring new functionality to the project, but mainly to gain practice with more DevOps tools. 

First idea was to deploy the project to one EC2 instance, running 2 containers - one for backend, one for the frontend. Then the plan was to add another EC2 instance tht would run the Jenkins pipeline, triggering on ech code commit. 

However, the plans failed soon, and after running into some issues, I realized the memory on a free-tier t2.micro EC2 type is not nearly enough to run 2 Docker containers. This made me research other cloud rerources or deployment strategies. However, even the bad situations can have good outcomes, and for me, at least I get the chance to try a new deployment strategy. 

I decided to deploy the images to ECS - Elastic Container Service. It is a "serverless" solution, where the programmer cares only about creating teh code and containerizing it, together with all needed resources, and not about providing the infrstructure itself. 

The idea is to first create the Jenkins server, and first manually create the containers and make sure they are deployed and interact properly. I am trying to stay in the free tier, which offers only 1GB of RAM and 1vCPU, so I will need to follow a minimal, optimized pipeline design which will do one job at a time. Most RAM is used by Jenkins and docker build jobs.
Then, I will automate the setup in the Jenkins pipeline adn terraform script to run the new code automatically on each new code commit. 

These are the proposed steps (1-6 first manually, then automate it): 
0. setup the Jenkins server 
1. trigger on code commit 
2. clone the repo
3. build backned image from the new code
4. build the frontend image from the new code
5. if both are built, push them to ECR
6. use terraform to get new images and deploy them to ECS

### 0. Setting up the Jenkins server

An EC2 type t2.micro is created and connected to it using SSH. 

Due to memory capacity, I will be installing Jenins bare-metal, not in a container. I also need docker, terraform, and aws installed.

Jenkins is installed first. First install Java, which is reguired for Jenkins. 

sudo apt update && sudo apt upgrade -y
sudo apt install -y openjdk-17-jdk curl gnupg2 unzip
<!-- verify java version java -version -->
<!-- adding Jenkins Repository and installing Jenkins -->
curl -fsSL https://pkg.jenkins.io/debian/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install -y jenkins
<!-- Start Jenkins and enable it on boot: -->
sudo systemctl enable jenkins
sudo systemctl start jenkins

<!-- finish jenkins setup in browser -->
jenkins should be now available at http://ec2-public-ip:8080
password is stored in /var/lib/jenkins/secrets/initialAdminPassword - use sudo
install necessary plugins for Jenkins - git, pipeline, nodejs, github integration, credentials binding, docker pipeline, maybe Amazon ECR, Pipeline: AWS Steps, Slack Notifier
add Dockerhub credentials into jenkins secrets 

<!-- install Docker -->
sudo apt install -y docker.io
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
docker --version

<!-- install aws cli -->
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
aws --version

<!-- install terraform -->
sudo apt-get update && sudo apt-get install -y gnupg software-properties-common curl

curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list

sudo apt update
sudo apt install -y terraform

### Optimization to not overload t2.micro

1. limit jenkins memory by updating the /etc/default/jenkins file to have JAVA_ARGS="-Xmx512 -Xms256m -Djava.awt.headless=true"
sudo systemctl restart jenkins
2. limit jenkins to 1 executor in Manage JEnkins -> Configure System
3. do not copy large folders into the Dockerfile
4. use lightweight images as nginx:alpine or python:3.11-slim
5. clean docker regularly: docker system prune -af
6. use terraform efficiently - minimal terraform apply runs, use -target if you want to update only specific resources, maybe store backend state on S3? 

swap memory: 



<!-- this setup was for one ec2 without jenkins - but it was too small to host 2 containers
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
# docker build -t my-frontend .

### !!! variables are stored in local .env file and inject environment variables at build time via --build-arg

set -a
source .env
set +a

export $(cat .env | xargs) && docker build  \
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

### WHAT HAPPENS: cannot copy the corine db into docker as it is too big  -->




