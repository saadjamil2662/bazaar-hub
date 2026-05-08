pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                // This step uses the Git Plugin to fetch the source code
                git branch: 'main', url: 'https://github.com/saadjamil2662/bazaar-hub.git'
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

        stage('Wait for Environment') {
            steps {
                echo "Waiting for the React frontend and Node backend to fully start..."
                // Sleep for 30 seconds to allow the web server to start before running tests
                sh 'sleep 30'
            }
        }

        stage('Run Automated Tests') {
            steps {
                echo "Building the test container..."
                sh 'docker build -t bazaar-hub-tests ./tests'
                echo "Running Selenium tests inside the container..."
                sh 'docker run --rm --network host bazaar-hub-tests'
            }
        }
    }
    
    post {
        always {
            echo "CI/CD Pipeline execution has finished."
            emailext (
                subject: "Test Results: ${env.JOB_NAME} Build #${env.BUILD_NUMBER}",
                body: "The Jenkins pipeline has completed. The automated Selenium tests resulted in: ${currentBuild.currentResult}\n\nPlease check the Jenkins console for the full logs: ${env.BUILD_URL}",
                to: "qasimalik@gmail.com",
                recipientProviders: [developers(), requestor()]
            )
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
