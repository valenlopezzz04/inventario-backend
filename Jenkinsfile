pipeline {
    agent any

    environment {
        // Definir cualquier variable de entorno necesaria
        DOCKER_IMAGE = 'my-docker-image'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Instalar Dependencias') {
            steps {
                bat 'npm install'  // Comando para instalar dependencias en Windows
            }
        }

        stage('Validar que el componente compila') {
            steps {
                bat 'npm run build'  // Comando para compilar el proyecto
            }
        }

        stage('Publicar Cobertura HTML') {
            steps {
                // Aquí podrías agregar el comando para generar y publicar el reporte de cobertura
                echo 'Publicando cobertura HTML...'
            }
        }

        stage('Construir Imagen Docker') {
            steps {
                script {
                    // Asegúrate de que Docker esté instalado y funcionando
                    bat 'docker build -t ${DOCKER_IMAGE} .'  // Construye la imagen de Docker
                }
            }
        }

        stage('Escanear Vulnerabilidades (Trivy)') {
            steps {
                script {
                    // Aquí debes poner el comando para ejecutar Trivy, por ejemplo:
                    bat 'trivy image ${DOCKER_IMAGE}'  // Escaneo de vulnerabilidades con Trivy
                }
            }
        }

        stage('Publicar Imagen en Docker Hub') {
            steps {
                script {
                    // Comando para hacer push a Docker Hub, ajusta con tus credenciales y nombre de imagen
                    bat 'docker push ${DOCKER_IMAGE}'  // Publica la imagen en Docker Hub
                }
            }
        }
    }

    post {
        always {
            // Acciones que siempre se ejecutan después de cada build (por ejemplo, limpieza)
            echo 'Pipeline finalizado'
        }
        failure {
            // Acciones en caso de fallo
            echo 'Pipeline falló. Revisa los logs para más detalles.'
        }
    }
}
