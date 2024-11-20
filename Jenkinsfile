pipeline {
    agent any
    environment {
        DOCKERHUB_CREDENTIALS = 'dockerhub-credentials'
        DOCKERHUB_USER = 'valenlopezzz04'
        IMAGE_NAME = 'inventario-backend-imagen'
    }
    stages {
        stage('Instalar Dependencias') {
            steps {
                script {
                    sh 'npm install'
                }
            }
        }
        stage('Ejecutar Pruebas') {
            steps {
                script {
                    sh 'npm test'
                }
            }
        }
        stage('Construir Imagen Docker') {
            steps {
                script {
                    sh 'docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:latest .'
                }
            }
        }
        stage('Escanear Vulnerabilidades (Trivy)') {
            steps {
                script {
                    sh 'trivy image ${DOCKERHUB_USER}/${IMAGE_NAME}:latest'
                }
            }
        }
        stage('Publicar Imagen en Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"
                        sh 'docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:latest'
                    }
                }
            }
        }
    }
    post {
        always {
            echo 'Pipeline finalizado.'
        }
        success {
            echo 'Pipeline ejecutado con éxito.'
        }
        failure {
            echo 'Pipeline falló. Revisa los errores.'
        }
    }
}


