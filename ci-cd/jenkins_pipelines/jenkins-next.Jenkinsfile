pipeline {
    agent any

    options {
        timeout(time: 15, unit: 'MINUTES') // Limita la ejecución a 15 minutos
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install Dependencies & Lint') {
            when { changeset "**/frontend/**" } // Solo corre si hubo cambios en frontend
            steps {
                echo "Cambios detectados en frontend Next.js"
                sh '''
                    cd frontend
                    npm install
                    npm run lint
                '''
            }
        }
        stage('Build') {
            when { changeset "**/frontend/**" }
            steps {
                sh '''
                    cd frontend
                    npm run build
                '''
            }
        }
    }

    post {
        always {
            cleanWs() // Limpia workspace después de cada ejecución
        }
        success {
            echo "✅ Frontend Next.js validado correctamente"
        }
        failure {
            echo "❌ Falló la validación del frontend"
        }
    }
}
