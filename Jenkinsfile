pipeline {
    agent any

    environment {
        PUSHER_EMAIL = ''
    }

    stages {
        stage('Checkout') {
            steps {
                // Use checkout scm exactly like your friend does
                checkout scm
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
                sh 'docker compose -f docker-compose-jenkins.yml ps'
            }
        }

        stage('Wait for Environment') {
            steps {
                sh 'sleep 30'
            }
        }

        stage('Run Automated Tests') {
            steps {
                sh 'docker build -t bazaar-hub-tests ./tests'
                sh 'docker run --rm --network host bazaar-hub-tests'
            }
        }
    }
    
    post {
        always {
            echo "Pipeline finished. Committer: ${env.PUSHER_EMAIL}"
        }
        success {
            emailext(
                to: "${env.PUSHER_EMAIL}",
                subject: "✅ [Bazaar Hub CI] Build #${BUILD_NUMBER} PASSED",
                body: "<h2 style='color:green'>All 15 tests passed!</h2><p>Build: #${BUILD_NUMBER}<br>Pusher: ${env.PUSHER_EMAIL}<br>Duration: ${currentBuild.durationString}</p><p><a href='${BUILD_URL}'>View Build</a></p>",
                mimeType: 'text/html'
            )
        }
        failure {
            emailext(
                to: "${env.PUSHER_EMAIL}",
                subject: "❌ [Bazaar Hub CI] Build #${BUILD_NUMBER} FAILED",
                body: "<h2 style='color:red'>Pipeline failed!</h2><p>Build: #${BUILD_NUMBER}<br>Pusher: ${env.PUSHER_EMAIL}</p><p><a href='${BUILD_URL}console'>View Console</a></p>",
                mimeType: 'text/html'
            )
        }
    }
}
