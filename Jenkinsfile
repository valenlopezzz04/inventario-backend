pipeline {
    agent any
    stages {
        stage('Clonar Repositorio') {
            steps {
                git branch: 'development',
                    credentialsId: 'github-credentials',
                    url: 'https://github.com/valenlopezzz04/inventario-backend.git'
            }
        }
        stage('Compilar') {
            steps {
                echo 'Validando que el componente compila correctamente...'
                sh './gradlew build' // Usa el comando apropiado para compilar tu proyecto
            }
        }
        stage('Pruebas') {
            steps {
                echo 'Ejecutando pruebas de integración...'
                sh './gradlew test' // Usa el comando que ejecuta tus pruebas
            }
        }
        stage('Análisis de Calidad con SonarQube') {
            steps {
                echo 'Analizando la calidad del código...'
                // Aquí deberás integrar SonarQube con Jenkins
            }
        }
        stage('Construir Imagen Docker') {
            steps {
                echo 'Construyendo la imagen Docker...'
                sh 'docker build -t valenlopezzz04/inventario-backend-imagen:latest .'
            }
        }
        stage('Escanear Vulnerabilidades') {
            steps {
                echo 'Escaneando la imagen con Trivy...'
                sh 'trivy image --severity HIGH,CRITICAL valenlopezzz04/inventario-backend-imagen:latest'
            }
        }
        stage('Subir Imagen a DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        docker push valenlopezzz04/inventario-backend-imagen:latest
                    '''
                }
            }
        }
    }
    post {
        always {
            echo 'Pipeline finalizado.'
        }
        success {
            echo 'Pipeline ejecutado exitosamente.'
        }
        failure {
            echo 'Pipeline fallido. Revisa los errores.'
        }
    }
}

