pipeline {
    agent any
    environment {
        DOCKERHUB_CREDENTIALS = 'dockerhub-credentials'
        DOCKERHUB_USER = 'valenlopezzz04'
        IMAGE_NAME = 'inventario-jenkins-imagen'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Instalar Dependencias') {
            steps {
                script {
                    bat 'npm install'
                }
            }
        }
        stage('Validar que el componente compila') {
            steps {
                script {
                    bat 'npm run build'
                }
            }
        }
        stage('Publicar Cobertura HTML') {
            steps {
                publishHTML(target: [
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'coverage\\lcov-report',
                    reportFiles: 'index.html',
                    reportName: 'Cobertura de Código'
                ])
            }
        }
        stage('Construir Imagen Docker') {
            steps {
                script {
                    bat "docker build -t %DOCKERHUB_USER%/%IMAGE_NAME%:latest ."
                }
            }
        }
        stage('Escanear Vulnerabilidades (Trivy)') {
            steps {
                script {
                    bat """
                    docker run --rm aquasec/trivy:latest image --severity HIGH,CRITICAL --no-progress %DOCKERHUB_USER%/%IMAGE_NAME%:latest
                    """
                }
            }
        }
        stage('Publicar Imagen en Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        bat """
                        echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                        docker push %DOCKERHUB_USER%/%IMAGE_NAME%:latest
                        """
                    }
                }
            }
        }
    }
    post {
        always {
            echo 'Pipeline finalizado. Revisa el reporte y los logs.'
        }
        success {
            echo 'Pipeline ejecutado con éxito.'
        }
        failure {
            echo 'Pipeline falló. Revisa los errores.'
        }
    }
}

