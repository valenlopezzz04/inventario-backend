pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Publicar cobertura HTML existente') {
            steps {
                publishHTML(target: [
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'coverage/lcov-report', // Ruta a tu carpeta específica
                    reportFiles: 'index.html', // El archivo HTML que se mostrará
                    reportName: 'Cobertura de Código'
                ])
            }
        }
    }
    post {
        always {
            echo 'Pipeline terminado. Revisa el reporte de cobertura.'
        }
    }
}



