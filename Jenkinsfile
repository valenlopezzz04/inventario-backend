pipeline {
    agent any
    environment {
        DOCKERHUB_CREDENTIALS = 'dockerhub-credentials'
        DOCKERHUB_USER = 'valenlopezzz04'
        IMAGE_NAME = 'inventario-backend-imagen'
    }
    stages {
        stage('Clonar Repositorio') {
            steps {
                git branch: 'development',
                    credentialsId: 'github-credentials',
                    url: 'https://github.com/valenlopezzz04/inventario-backend.git'
            }
        }
        stage('Instalar Dependencias') {
            steps {
                script {
                    // Instalar dependencias del proyecto
                    sh 'npm install'
                }
            }
        }
        stage('Pruebas') {
            steps {
                script {
                    // Ejecutar pruebas definidas en el proyecto
                    sh 'npm test'
                }
            }
        }
        stage('Construir Imagen Docker') {
            steps {
                script {
                    // Construir la imagen de Docker
                    sh 'docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:latest .'
                }
            }
        }
        stage('Escanear Vulnerabilidades (Trivy)') {
            steps {
                script {
                    // Usar Trivy para escanear la imagen de Docker
                    sh 'trivy image ${DOCKERHUB_USER}/${IMAGE_NAME}:latest'
                }
            }
        }
        stage('Publicar Imagen en Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"
                        sh "docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:latest"
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
            echo 'Pipeline ejecutado exitosamente.'
        }
        failure {
            echo 'Pipeline falló. Revisa los logs para más detalles.'
        }
    }
}

