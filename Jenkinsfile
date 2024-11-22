pipeline {
    agent any
    environment {
        NODE_ENV = 'test'
    }
    stages {
        stage('Declarative: Checkout SCM') {
            steps {
                checkout scm
            }
        }
        stage('Instalar Dependencias') {
            steps {
                echo 'Instalando dependencias...'
                sh 'npm install'
            }
        }
        stage('Generar Reporte de Cobertura con NYC') {
            steps {
                echo 'Generando reporte de cobertura con NYC...'
                // Ejecuta nyc para analizar la cobertura
                sh 'npx nyc --reporter=text --reporter=html'
            }
        }
        stage('Validar Cobertura') {
            steps {
                echo 'Validando niveles de cobertura...'
                // Opcional: Usa jq o grep para validar cobertura mínima
                sh '''
                COVERAGE=$(npx nyc report --reporter=text-summary | grep -oP "(?<=Statements   : )\\d+")
                if [ "$COVERAGE" -lt 80 ]; then
                  echo "Cobertura insuficiente: $COVERAGE%"
                  exit 1
                else
                  echo "Cobertura aceptable: $COVERAGE%"
                fi
                '''
            }
        }
    }
    post {
        always {
            echo 'Pipeline finalizado.'
        }
        failure {
            echo 'Pipeline falló. Revisa los errores.'
        }
    }
}



