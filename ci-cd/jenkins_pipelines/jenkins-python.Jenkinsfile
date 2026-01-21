pipeline {
    agent any       // Puede ejecutarse sobre cualquier agente disponible

    options {
        timeout(time: 20, unit: 'MINUTES')  //Duración máxima del pipeline (20 minutos), para no dejar pipelines colgados
    }

    stages {                                // Etapas
        stage('Checkout') {
            steps {
                checkout scm                // scm contiene la informacion del repositorio (URL, credenciales) definida al crear el pipeline 
            }                               // checkout clona el repositorio
        }
        stage('Install Dependencies') {
            when { changeset "**/backend/python/**" }
            steps {
                echo "Cambios Detectados"
                echo "Instalando dependencias"
                sh 'python3 -m venv venv'
                sh '. venv/bin/activate && pip install -r backend/python/requirements.txt'
            }
        }
        stage('Lint') {
            when { changeset "**/backend/python/**" }
            steps {
                echo "Ejecutando flake8"
                sh '. venv/bin/activate && flake8 backend/python/'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "✅ Pipeline de backend Python completado exitosamente"
        }
        failure {
            echo "❌ Pipeline de backend Python falló"
        }
    }
}
