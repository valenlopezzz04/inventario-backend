pipeline {
    agent any
    environment {
        DOCKERHUB_CREDENTIALS = 'dockerhub-credentials' // ID de las credenciales en Jenkins
        DOCKERHUB_USER = 'valenlopezzz04'              // Tu usuario en DockerHub
        IMAGE_NAME = 'imagenJenkins'                   // Nombre personalizado para la imagen Docker
        IMAGE_TAG = 'latest'                           // Etiqueta de la imagen
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
                    sh 'npm install'
                }
            }
        }
        stage('Validar que el componente compila') {
            steps {
                script {
                    sh 'npm run build' // Asegúrate de que tengas un script build en tu package.json
                }
            }
        }
        stage('Publicar Cobertura HTML') {
            steps {
                publishHTML(target: [
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'coverage/lcov-report', // Ruta al directorio del reporte
                    reportFiles: 'index.html',        // Archivo HTML que se muestra
                    reportName: 'Cobertura de Código'
                ])
            }
        }
        stage('Construir Imagen Docker') {
            steps {
                script {
                    // Construye la imagen Docker con un nombre personalizado
                    sh "docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} ."
                }
            }
        }
        stage('Escanear Vulnerabilidades (Trivy)') {
            steps {
                script {
                    // Escanea la imagen recién construida
                    sh "trivy image ${DOCKERHUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }
        stage('Publicar Imagen en Docker Hub') {
            steps {
                script {
                    // Autenticación y publicación de la imagen en Docker Hub
                    withCredentials([usernamePassword(credentialsId: '${DOCKERHUB_CREDENTIALS}', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"
                        sh "docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
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
            echo 'Pipeline ejecutado con éxito. Imagen subida a DockerHub:'
            echo "${DOCKERHUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
        }
        failure {
            echo 'Pipeline falló. Revisa los errores y vuelve a intentarlo.'
        }
    }
}
