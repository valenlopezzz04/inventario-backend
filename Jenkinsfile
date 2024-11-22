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
                    echo 'Instalando dependencias...'
                    sh 'npm install'
                }
            }
        }
        stage('Generar Reporte de Cobertura') {
            steps {
                script {
                    echo 'Generando reporte de cobertura...'
                    // Genera solo el reporte de cobertura usando tu jest.config.js
                    sh 'jest --config jest.config.js --coverage --coverage-only'
                }
            }
        }
        stage('Validar Cobertura') {
            steps {
                script {
                    echo 'Validando cobertura global...'
                    // Extraer cobertura global directamente del archivo de cobertura generado
                    def coverage = sh(script: "grep -Po 'All files.*\\K\\d+\\.\\d+(?=%)' coverage/lcov-report/index.html", returnStdout: true).trim()
                    echo "Cobertura Global: ${coverage}%"
                    if (coverage.toFloat() < 90) {
                        error("La cobertura de código es inferior al 90%. Deteniendo el pipeline.")
                    }
                }
            }
        }
        stage('Construir Imagen Docker') {
            steps {
                script {
                    echo 'Construyendo imagen Docker...'
                    sh 'docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:latest .'
                }
            }
        }
        stage('Escanear Vulnerabilidades (Trivy)') {
            steps {
                script {
                    echo 'Escaneando vulnerabilidades en la imagen Docker...'
                    sh 'trivy image ${DOCKERHUB_USER}/${IMAGE_NAME}:latest'
                }
            }
        }
        stage('Publicar Imagen en Docker Hub') {
            steps {
                script {
                    echo 'Publicando imagen Docker en Docker Hub...'
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

