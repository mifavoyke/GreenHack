pipeline {
    agent any

    environment {
        DOCKERHUB_USER='zuzanapiarova'
        BACKEND_IMAGE='backend-img'
        FRONTEND_IMAGE='frontend-img'
    }

    stages {

        stage('Clone repository') {
            steps {
                git branch:'main', url: 'https://github.com/mifavoyke/GreenHack.git'
            }
        }

        stage ('Build frontend app') {
            steps {
                 dir('app/frontend') {
                    withCredentials([
                        string(credentialsId: 'REACT_APP_ZABAGED_220V', variable: 'REACT_APP_ZABAGED_220V'),
                        string(credentialsId: 'REACT_APP_ZABAGED_400V', variable: 'REACT_APP_ZABAGED_400V'), 
                        string(credentialsId: 'REACT_APP_OPENSTREETMAP_URL', variable: 'REACT_APP_OPENSTREETMAP_URL'),
                        string(credentialsId: 'REACT_APP_API_URL', variable: 'REACT_APP_API_URL'), 
                        ]) {
                        sh '''
                            # Write envs to .env file dynamically
                            echo "REACT_APP_API_URL=$RECT_APP_API_URL" > .env
                            echo "REACT_APP_OPENSTREETMAP_URL=$RECT_APP_OPENSTREETMAP_URL" >> .env
                            echo "REACT_APP_ZABAGED_220V=$REACT_APP_ZABAGED_220V" >> .env
                            echo "REACT_APP_ZABAGED_400V=$REACT_APP_ZABAGED_400V" >> .env

                            npm install
                            npm run build

                            rm .env
                            rm -rf node_modules
                        '''
                    }
                }
            }
        }

        stage('Build frontend image') {
            steps {
                dir('app/frontend') {
                    sh 'docker build -t $DOCKERHUB_USER/$FRONTEND_IMAGE .'
                }
            }
        }

        stage('Build backend image') {
            steps {
                dir('app/backend') {
                    script {
                        sh 'docker build -t $DOCKERHUB_USER/$BACKEND_IMAGE .'
                    }
                }
            }
        }

        stage('Push Docker images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    script {
                        sh 'echo $PASS | docker login -u $USER --password-stdin'
                        // maybe add something some check that the containers were created properly ? 
                        sh 'docker push $DOCKERHUB_USER/$BACKEND_IMAGE'
                        sh 'docker push $DOCKERHUB_USER/$FRONTEND_IMAGE'
                    }
                }
            }
        }
    }

    post {
        always {
            sh 'docker system prune -af'
        }
    }
}