pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                // This step uses the Git Plugin to fetch the source code
                // Replace the URL with your actual GitHub repository URL
                git branch: 'main', url: 'https://github.com/your-username/bazaar-hub.git'
            }
        }

        stage('Build & Deploy Containers') {
            steps {
                // This stage leverages Docker directly to spin up the container environment
                // It uses the specialized jenkins compose file created for this pipeline
                echo "Starting up the environment using Docker Compose..."
                sh 'docker-compose -f docker-compose-jenkins.yml up -d'
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo "Containers are now running. Listing running containers:"
                sh 'docker-compose -f docker-compose-jenkins.yml ps'
            }
        }
    }
    
    post {
        always {
            echo "CI/CD Pipeline execution has finished."
        }
        success {
            echo "Deployment was successful!"
        }
        failure {
            echo "Deployment failed. Please check the logs."
            // Optionally shut down failed containers
            // sh 'docker-compose -f docker-compose-jenkins.yml down'
        }
    }
}
