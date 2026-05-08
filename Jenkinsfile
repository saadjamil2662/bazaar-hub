pipeline {
    agent any

    environment {
        PUSHER_EMAIL = ''
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    sh '''
                        git config --global --add safe.directory $(pwd)
                        git log -1 --format='%ae' > /tmp/pusher_email.txt
                    '''
                    env.PUSHER_EMAIL = readFile('/tmp/pusher_email.txt').trim()
                    echo "=== PUSHER EMAIL: ${env.PUSHER_EMAIL} ==="
                }
            }
        }

        stage('Build & Deploy Containers') {
            steps {
                echo "Starting up the environment using Docker Compose..."
                sh 'docker compose -f docker-compose-jenkins.yml down || true'
                sh 'docker compose -f docker-compose-jenkins.yml up -d --build'
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
            script {
                def recipient = (env.PUSHER_EMAIL && env.PUSHER_EMAIL != 'null' && env.PUSHER_EMAIL.trim() != '') ? env.PUSHER_EMAIL.trim() : 'saadjamil6226@gmail.com'
                try {
                    emailext(
                        to: recipient,
                        subject: "✅ [Bazaar Hub CI] Build #${BUILD_NUMBER} PASSED",
                        body: "<h2 style='color:green'>All 15 tests passed!</h2><p>Build: #${BUILD_NUMBER}<br>Pusher: ${recipient}<br>Duration: ${currentBuild.durationString}</p><p><a href='${BUILD_URL}'>View Build</a></p>",
                        mimeType: 'text/html'
                    )
                } catch (Exception e) {
                    echo "Notice: Email failed to send due to Jenkins SMTP config, but build succeeded!"
                }
            }
        }
        failure {
            script {
                def recipient = (env.PUSHER_EMAIL && env.PUSHER_EMAIL != 'null' && env.PUSHER_EMAIL.trim() != '') ? env.PUSHER_EMAIL.trim() : 'saadjamil6226@gmail.com'
                try {
                    emailext(
                        to: recipient,
                        subject: "❌ [Bazaar Hub CI] Build #${BUILD_NUMBER} FAILED",
                        body: "<h2 style='color:red'>Pipeline failed!</h2><p>Build: #${BUILD_NUMBER}<br>Pusher: ${recipient}</p><p><a href='${BUILD_URL}console'>View Console</a></p>",
                        mimeType: 'text/html'
                    )
                } catch (Exception e) {
                    echo "Notice: Email failed to send due to Jenkins SMTP config."
                }
            }
        }
    }
}
