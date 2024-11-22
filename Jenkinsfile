
pipeline {
    agent any
    environment {
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
        stage('Construir Imagen Docker') {
            steps {
                script {
                    bat "docker build -t %IMAGE_NAME%:latest ."
                }
            }
        }
        stage('Escanear Vulnerabilidades (Trivy)') {
            steps {
                script {
                    // Escanear y guardar el reporte en un archivo de texto
                    bat """
                    chcp 65001 > nul
                    docker run --rm -v //var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --severity HIGH,CRITICAL --no-progress %IMAGE_NAME%:latest > vulnerabilities-report.txt
                    """
                }
            }
        }
    }
    post {
        always {
            // Archivar el reporte en el workspace para referencia futura
            archiveArtifacts artifacts: 'vulnerabilities-report.txt', fingerprint: true
            echo 'Pipeline finalizado. Revisa el reporte en vulnerabilities-report.txt en el workspace.'
        }
        success {
            echo 'Pipeline ejecutado con éxito.'
        }
        failure {
            echo 'Pipeline falló. Revisa los errores y el reporte de vulnerabilidades.'
        }
    }
}
