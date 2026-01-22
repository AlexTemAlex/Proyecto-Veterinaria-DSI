pipeline {
    agent any

    options {
        timeout(time: 20, unit: 'MINUTES')
    }

    environment {
        DEPLOY_HOST = credentials('ip-ec2-contenedores')
        DEPLOY_USER = "ec2-user"
        APP_PATH = "/opc/Proyecto-Veterinaria-DSI/"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Sync Files') {
            when { changeset "infraestructure/docker/docker-compose.yml" }
            steps {
                echo "📦 Sincronizando archivos hacia EC2 remota"
                sshagent(credentials: ['aws-ec2-contenedores']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} 'mkdir -p ${APP_PATH}'
                        rsync -avz --delete ./ ${DEPLOY_USER}@${DEPLOY_HOST}:${APP_PATH}/
                    """
                }
            }
        }
        stage('Deploy Remoto') {
            when { changeset "infraestructure/docker/docker-compose.yml" }
            steps {
                echo "🚀 Desplegando en EC2 remota"
                sshagent(credentials: ['aws-ec2-contenedores']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} '
                            cd ${APP_PATH}
                            docker compose -f infraestructure/docker/docker-compose.yml down || true
                            docker compose -f infraestructure/docker/docker-compose.yml pull
                            docker compose -f infraestructure/docker/docker-compose.yml up -d --build
                        '
                    """
                }
            }
        }
        stage('Verificar Contenedores') {
            when { changeset "infraestructure/docker/docker-compose.yml" }
            steps {
                echo "🔍 Verificando contenedores en EC2"
                sshagent(credentials: ['aws-ec2-contenedores']) {
                    sh """
                        ssh ${DEPLOY_USER}@${DEPLOY_HOST} 'docker ps'
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deploy remoto completado correctamente"
        }
        failure {
            echo "❌ Falló el deploy remoto"
        }
        skipped {
            echo "⏭️ No hubo cambios en docker-compose.yml, se omite deploy"
        }
    }
}
