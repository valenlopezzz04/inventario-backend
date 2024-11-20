pipeline {
    agent any
    environment {
        DOCKERHUB_CREDENTIALS = 'dockerhub-credentials'
        DOCKERHUB_USER = 'valenlopezzz04'
        IMAGE_NAME = 'inventario-backend-imagen'
        SONAR_TOKEN = 'sonarqube-token'
    }
    triggers {
        pollSCM('* * * * *') // O usa webhook para detectar cambios en tiempo real
    }
    stages {
        stage('Validar que compila') {
            steps {
                sh './gradlew build' // O el comando que uses para compilar
            }
        }
        stage('Pruebas de Integración') {
            steps {
                sh './gradlew test' // O el comando para ejecutar tus pruebas de integración
            }
        }
        stage('Analizar Calidad de Código con SonarQube') {
            steps {
                withSonarQubeEnv('sonarqube-server') {
                    sh './gradlew sonarqube -Dsonar.login=${SONAR_TOKEN}'
                }
            }
        }
        stage('Esperar Análisis de SonarQube') {
            steps {
                script {
                    timeout(time: 1, unit: 'HOURS') {
                        waitForQualityGate abortPipeline: true
                    }
                }
            }
        }
        stage('Escaneo de vulnerabilidades con Trivy') {
            steps {
                sh 'trivy image --exit-code 1 ${DOCKERHUB_USER}/${IMAGE_NAME}:latest'
            }
        }
        stage('Construir Imagen Docker') {
            steps {
                script {
                    sh 'docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:latest .'
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
            echo 'Pipeline terminado.'
        }
        success {
            echo 'Pipeline ejecutado correctamente.'
        }
        failure {
            echo 'Pipeline falló. Revisa los logs para más detalles.'
        }
    }
}
