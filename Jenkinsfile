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
                    // Ejecutar el comando npm install en Windows
                    bat 'npm install'
                }
            }
        }
        stage('Validar que el componente compila') {
            steps {
                script {
                    // Asegúrate de tener un script build en tu package.json
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
                    reportDir: 'coverage\\lcov-report', // Usa rutas de Windows con \\ 
                    reportFiles: 'index.html', // Archivo HTML que se muestra
                    reportName: 'Cobertura de Código'
                ])
            }
        }
        stage('Construir Imagen Docker') {
            steps {
                script {
                    // Construir la imagen Docker
                    bat "docker build -t %DOCKERHUB_USER%/%IMAGE_NAME%:latest ."
                }
            }
        }
        stage('Escanear Vulnerabilidades (Trivy)') {
            steps {
                script {
                    // Ejecutar Trivy para escanear vulnerabilidades
                    bat "trivy image %DOCKERHUB_USER%/%IMAGE_NAME%:latest"
                }
            }
        }
        stage('Publicar Imagen en Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        // Autenticación en Docker Hub y push de la imagen
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
