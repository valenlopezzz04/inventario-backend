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
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"
                    }
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

