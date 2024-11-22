pipeline {
    agent any
    environment {
        DOCKERHUB_CREDENTIALS = 'dockerhub-credentials' // ID de tus credenciales Docker en Jenkins
        DOCKERHUB_USER = 'valenlopezzz04'              // Tu usuario de DockerHub
        IMAGE_NAME = 'inventario-backend-imagen'       // Nombre de la imagen
    }
    stages {
        stage('Instalar Dependencias') {
            steps {
                script {
                    sh 'npm install'
                }
            }
        }
        stage('Ejecutar Pruebas') {
            steps {
                script {
                    // Ejecutar las pruebas con cobertura
                    sh 'npm test -- --coverage'

                    // Extraer porcentaje de cobertura usando Node.js
                    def cobertura = sh(script: """
                        node -e "
                        const fs = require('fs');
                        const data = fs.readFileSync('coverage/lcov-report/index.html', 'utf8');
                        const match = data.match(/All files.*?([0-9]+)%/);
                        if (match && match[1]) console.log(match[1]);
                        else process.exit(1);
                        "
                    """, returnStdout: true).trim()

                    echo "Cobertura actual: ${cobertura}%"
                    if (cobertura.toInteger() < 90) {
                        error "La cobertura es inferior al 90%. Abortando pipeline."
                    }
                }
            }
        }
        stage('Construir Imagen Docker') {
            steps {
                script {
                    sh 'docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:latest .'
                }
            }
        }
        stage('Escanear Vulnerabilidades (Trivy)') {
            steps {
                script {
                    sh 'trivy image ${DOCKERHUB_USER}/${IMAGE_NAME}:latest'
                }
            }
        }
        stage('Publicar Imagen en Docker Hub') {
            steps {
                script {
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
            publishHTML(target: [
                allowMissing: false,
                keepAll: true,
                reportDir: 'coverage/lcov-report',
                reportFiles: 'index.html',
                reportName: 'Reporte de Cobertura'
            ])
        }
        failure {
            echo 'Pipeline falló. Revisa los errores.'
        }
    }
}


