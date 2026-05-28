pipeline {
    agent any

    environment {
        PROJECT_NAME = "visioninspect-ai"
    }

    stages {

        stage('Clone Repository') {
            steps {
                echo 'Cloning GitHub repository...'

                git branch: 'main',
                url: 'https://github.com/Akshita42/visioninspect-ai-cloud-native'
            }
        }

        stage('Verify Docker Environment') {
            steps {
                echo 'Verifying Docker installation...'

                sh 'docker --version'
                sh 'docker compose version'
            }
        }

        stage('Stop Existing Containers') {
            steps {
                echo 'Stopping old containers...'

                sh 'docker rm -f visioninspect-backend visioninspect-frontend || true'
                sh 'docker compose down || true'
            }
        }

        stage('Build Containers') {
            steps {
                echo 'Building fresh Docker containers...'

                sh 'docker compose build'
            }
        }

        stage('Deploy Containers') {
            steps {
                echo 'Deploying application containers...'

                sh 'docker compose up -d'
            }
        }

        stage('Health Check') {
            steps {
                echo 'Checking running containers...'

                sh 'docker ps'
            }
        }

        stage('Cleanup Old Images') {
            steps {
                echo 'Cleaning unused Docker images...'

                sh 'docker image prune -f'
            }
        }

    }

    post {

        success {
            echo 'CI/CD Pipeline executed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check logs for debugging.'
        }
    }
}