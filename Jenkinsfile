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
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                    aquasec/trivy:latest image --format json -o trivy-report.json %DOCKERHUB_USER%/%IMAGE_NAME%:latest
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                    aquasec/trivy:latest image --format table %DOCKERHUB_USER%/%IMAGE_NAME%:latest
                    """
                }
            }
        }
        stage('Procesar Reporte de Vulnerabilidades') {
            steps {
                script {
                    bat """
                    python -c "import json; from pprint import pprint; print('<html><body><h1>Reporte de Vulnerabilidades</h1><pre>'); pprint(json.load(open('trivy-report.json'))); print('</pre></body></html>')" > trivy-report.html
                    """
                }
                publishHTML(target: [
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: '.',
                    reportFiles: 'trivy-report.html',
                    reportName: 'Reporte de Vulnerabilidades'
                ])
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
