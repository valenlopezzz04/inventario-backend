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
                    // Crear la carpeta output
                    bat 'if not exist output mkdir output'

                    // Escaneo con Trivy y guardar el reporte
                    bat """
                    docker run --rm -v %cd%:/output aquasec/trivy:latest image --severity HIGH,CRITICAL --no-progress %IMAGE_NAME%:latest > output\\trivy_report.txt
                    """
                    
                    // Mostrar resumen de vulnerabilidades críticas y altas en la consola
                    echo '--- Resumen del reporte de vulnerabilidades ---'
                    bat 'findstr "CRITICAL HIGH" output\\trivy_report.txt || echo No se encontraron vulnerabilidades relevantes.'
                }
            }
        }
        stage('Publicar Cobertura HTML') {
            steps {
                publishHTML(target: [
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'coverage/lcov-report',
                    reportFiles: 'index.html',
                    reportName: 'Cobertura de Código'
                ])
            }
        }
    }
    post {
        always {
            echo 'Pipeline finalizado. Revisa el reporte y los logs.'
            archiveArtifacts artifacts: 'output/trivy_report.txt', fingerprint: true
        }
        success {
            echo 'Pipeline ejecutado con éxito.'
        }
        failure {
            echo 'Pipeline falló. Revisa los errores.'
        }
    }
}
