pipeline {
    agent any
    environment {
        DOCKERHUB_USER = 'valenlopezzz04' // Tu usuario de Docker Hub
        IMAGE_NAME = 'inventario-jenkins-imagen' // Nombre de la imagen
        SONAR_TOKEN = credentials('sonarqube-token') // Token de SonarQube almacenado en Jenkins
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
        stage('Análisis con SonarQube') {
            steps {
                script {
                    withSonarQubeEnv('SonarQube-Server') {
                        bat """
                        docker run --rm --network sonarqube-network \
                        -v %WORKSPACE%:/usr/src \
                        sonarsource/sonar-scanner-cli \
                        sonar-scanner \
                        -Dsonar.projectKey=inventario-backend \
                        -Dsonar.sources=/usr/src \
                        -Dsonar.host.url=http://sonarqube:9000 \
                        -Dsonar.javascript.lcov.reportPaths=/usr/src/coverage/lcov.info\
                        -Dsonar.login=${env.SONAR_TOKEN}
                        """
                    }
                }
            }
        }
        stage('Escanear Vulnerabilidades (Trivy)') {
            steps {
                script {
                    bat """
                    chcp 65001 > nul
                    docker run --rm -v //var/run/docker.sock:/var/run/docker.sock \
                    aquasec/trivy:latest image --severity HIGH,CRITICAL --no-progress \
                    %DOCKERHUB_USER%/%IMAGE_NAME%:latest > vulnerabilities-report.txt
                    """
                }
            }
        }
        stage('Construir Imagen Docker') {
            steps {
                script {
                    bat "docker build -t %DOCKERHUB_USER%/%IMAGE_NAME%:latest ."
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
                    reportFiles: 'index.html', // Archivo HTML que se muestra
                    reportName: 'Cobertura de Código'
                ])
            }
        }
        stage('Publicar Imagen en Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                        bat """
                        docker login -u %USERNAME% -p %PASSWORD%
                        docker push %DOCKERHUB_USER%/%IMAGE_NAME%:latest
                        """
                    }
                }
            }
        }
    }
    post {
        always {
            script {
                archiveArtifacts artifacts: 'vulnerabilities-report.txt', fingerprint: true
            }
            echo 'Pipeline finalizado. Revisa el reporte de vulnerabilidades y cobertura en el workspace.'
        }
        success {
            echo 'Pipeline ejecutado con éxito. Imagen publicada en Docker Hub.'
        }
        failure {
            echo 'Pipeline falló. Revisa los errores, vulnerabilidades y los logs.'
        }
    }
}

