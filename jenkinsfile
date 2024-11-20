pipeline {
    agent any
    environment {
        DOCKERHUB_CREDENTIALS = 'github-credentials' // ID de las credenciales configuradas en Jenkins
        DOCKERHUB_USER = 'valenlopezzz04'           // Tu usuario de Docker Hub
        IMAGE_NAME = 'inventario-backend-imagen'    // Nombre de la imagen en español
    }
    stages {
        stage('Clonar Repositorio') {
            steps {
                git branch: 'development',
                    credentialsId: 'github-credentials', // Credenciales para GitHub
                    url: 'https://github.com/valenlopezzz04/inventario-backend.git'
            }
        }
        stage('Construir Imagen Docker') {
            steps {
                script {
                    sh 'docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:latest .'
                }
            }
        }
        stage('Loguearse en Docker Hub') {
            steps {
                script {
                    sh "echo ${env.DOCKERHUB_PASSWORD} | docker login -u ${DOCKERHUB_USER} --password-stdin"
                }
            }
        }
        stage('Publicar Imagen en Docker Hub') {
            steps {
                script {
                    sh 'docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:latest'
                }
            }
        }
    }
    post {
        always {
            echo 'Pipeline terminado.'
        }
        success {
            echo 'Pipeline ejecutado correctamente.'
        }
        failure {
            echo 'Pipeline falló. Revisa los logs para más detalles.'
        }
    }
}
