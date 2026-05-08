pipeline {
    agent any

    environment {
        PUSHER_EMAIL = ''
    }

    stages {
        // NO manual Checkout Code stage needed — Jenkins does it automatically
        
        stage('Get Committer Email') {
            steps {
                script {
                    // Use GIT_COMMIT env variable Jenkins sets automatically
                    // This is more reliable than running git log yourself
                    env.PUSHER_EMAIL = sh(
                        script: "git show -s --format='%ae' ${env.GIT_COMMIT}",
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
            script {
                def recipient = env.PUSHER_EMAIL?.trim() && env.PUSHER_EMAIL != 'null' 
                    ? env.PUSHER_EMAIL 
                    : 'saadjamil2662@gmail.com'
                echo "Emailing: ${recipient}"
                emailext(
                    to: recipient,
                    subject: "✅ [Bazaar Hub CI] Build #${BUILD_NUMBER} PASSED",
                    body: """<h2 style='color:green'>All 15 tests passed!</h2>
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
                def recipient = env.PUSHER_EMAIL?.trim() && env.PUSHER_EMAIL != 'null'
                    ? env.PUSHER_EMAIL
                    : 'saadjamil2662@gmail.com'
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
