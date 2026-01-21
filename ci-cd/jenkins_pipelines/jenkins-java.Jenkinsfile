pipeline {
    agent any

    options {
        timeout(time: 20, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Static Code Analysis (Java)') {
            when { changeset "**/backend/java/**" }
            steps {
                sh '''
                    cd backend/java
                    mvn clean verify
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "✅ Análisis estático del backend Java completado"
        }
        failure {
            echo "❌ Falló el análisis estático del backend Java"
        }
    }
}