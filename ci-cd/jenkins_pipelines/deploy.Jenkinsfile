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
        stage('Recrear Contenedores') {
            steps {
                echo "Desplegando contenedores en la misma instancia"

                // Bajar contenedores existentes
                sh "docker compose -f infraestructure/docker/docker-compose.yml down || true"

                // Reconstruir y levantar contenedores
                sh "docker compose -f infraestructure/docker/docker-compose.yml up -d --build"
            }
        }
        stage('Verificar Contenedores') {
            steps {
                echo "Verificando contenedores"
                sh "docker ps"
            }
        }
    }

    post {
        success {
            echo "✅ Deploy completado correctamente"
        }
        failure {
            echo "❌ Falló el deploy"
        }
    }
}
