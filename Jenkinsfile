pipeline {
    agent any

    // Define at pipeline level so it's always accessible, including in post{}
    environment {
        PUSHER_EMAIL = ''
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/saadjamil2662/bazaar-hub.git'
            }
        }

        // Separate stage so the variable is set before anything else can fail
        stage('Get Committer Email') {
            steps {
                script {
                    env.PUSHER_EMAIL = sh(
                        script: "git log -1 --pretty=format:'%ae'",
                        returnStdout: true
                    ).trim()
                    echo "Push made by: ${env.PUSHER_EMAIL}"
                }
            }
        }

        stage('Build & Deploy Containers') {
            steps {
                echo "Starting up the environment using Docker Compose..."
                sh 'docker compose -f docker-compose-jenkins.yml up -d'
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo "Containers are now running. Listing running containers:"
                sh 'docker compose -f docker-compose-jenkins.yml ps'
            }
        }

        stage('Wait for Environment') {
            steps {
                echo "Waiting for the React frontend and Node backend to fully start..."
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
            // Debug line - check Jenkins console to confirm the value
            echo "Sending email to: ${env.PUSHER_EMAIL}"
        }
        success {
            script {
                // Fallback to your own email if variable is somehow empty
                def recipient = env.PUSHER_EMAIL?.trim() ? env.PUSHER_EMAIL : 'saadjamil2662@gmail.com'
                emailext(
                    to: recipient,
                    subject: "✅ [Bazaar Hub CI] Build #${BUILD_NUMBER} PASSED",
                    body: """<h2 style='color:green'>All tests passed!</h2>
                             <p>Build: #${BUILD_NUMBER}<br>
                             Pusher: ${recipient}<br>
                             Duration: ${currentBuild.durationString}</p>
                             <p><a href='${BUILD_URL}'>View Build</a></p>""",
                    mimeType: 'text/html'
                )
            }
        }
        failure {
            script {
                def recipient = env.PUSHER_EMAIL?.trim() ? env.PUSHER_EMAIL : 'saadjamil2662@gmail.com'
                emailext(
                    to: recipient,
                    subject: "❌ [Bazaar Hub CI] Build #${BUILD_NUMBER} FAILED",
                    body: """<h2 style='color:red'>Pipeline failed!</h2>
                             <p>Build: #${BUILD_NUMBER}<br>
                             Pusher: ${recipient}</p>
                             <p><a href='${BUILD_URL}console'>View Console</a></p>""",
                    mimeType: 'text/html'
                )
            }
        }
    }
}
