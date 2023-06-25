pipeline {

  environment {
        CI             = 'false'
        GIT_REPO_NAME  = env.GIT_URL.replaceFirst(/^.*\/([^\/]+?).git$/, '$1')
        GIT_AUTHOR     = sh (script: 'git log -1 --pretty=%cn ${GIT_COMMIT}', returnStdout: true).trim()

        AWS_PROFILE       = "bellti9er"
        AWS_REGION        = "ap-northeast-2"
        DOCKER_IMAGE_URI  = "774211786053.dkr.ecr.ap-northeast-2.amazonaws.com/graphql-api-template"
        DOCKER_IMAGE_NAME = "graphql-api-template"
    }

  agent {
    docker {
      alwaysPull true
      image "bellti9er/api-build"
      args "-v /var/run/docker.sock:/var/run/docker.sock -e MYSQL_PASSWORD=test --entrypoint=''"
    }
  }

  stages {
    stage("1. Environment Setup") {
      steps {
        echo "============Initialzing Docker Env================"
        
        script { 
          sh """
            sudo service mysql start

            sleep 10
            
            sudo mysql -uroot -e "CREATE USER 'jenkins'@'%' IDENTIFIED WITH mysql_native_password BY 'test';"
            sudo mysql -uroot -e "GRANT ALL PRIVILEGES ON *.* to 'jenkins'@'%';"
            
            sudo mysql -ujenkins -ptest -e "CREATE DATABASE test_template_database;"
          """
          sh "docker ps"
          
          withCredentials([sshUserPrivateKey(credentialsId: 'bellti9er', keyFileVariable: 'id_rsa')]) {
            sh """
              mkdir -p ~/.ssh
              cp ${id_rsa} ~/.ssh/id_rsa
              echo 'Host *\n    StrictHostKeyChecking no' > ~/.ssh/config                        
            """
            sh "docker ps"
            
            sh """
              git clone git@github.com:bellti9er/template-database-migration.git
              cd template-database-migration
              python3.8 -mpip install -r requirements.txt
              ~/.local/bin/yoyo apply -v -b --database "mysql://jenkins:test@localhost:3306/test_template_database?charset=utf8mb4" 
            """
            sh "docker ps"
          }
          
          withCredentials([string(credentialsId: 'aws', variable: 'secret')]) {
            script {
              def creds = readJSON text: secret
              
              env.AWS_ACCESS_KEY_ID     = creds['aws_access_key_id']
              env.AWS_SECRET_ACCESS_KEY = creds['aws_secret_access_key']
            }
            
            sh """
              mkdir -p ~/.aws
              touch ~/.aws/credentials
              echo '[bellti9er]' >> ~/.aws/credentials
              echo 'aws_access_key_id=${env.AWS_ACCESS_KEY_ID}' >> ~/.aws/credentials
              echo 'aws_secret_access_key=${env.AWS_SECRET_ACCESS_KEY}' >> ~/.aws/credentials
            """
            sh "docker ps"
          }
        } 
      }
    }

    stage('2. Build && Test') {
      steps {
        echo "============Building && Testing================"
        
        sh """ 
          echo 'TEST_DB_HOST     = "localhost"' >> .env
          echo 'TEST_DB_PORT     = 3306' >> .env
          echo 'TEST_DB_NAME     = "test_template_database"' >> .env
          echo 'TEST_DB_USER     = "jenkins"' >> .env
          echo 'TEST_DB_PASSWORD = "test"' >> .env
          echo 'ALLOWED_HOSTS    = "https://belltiger.dev"' >> .env
          echo 'JWT_SECRET_KEY   = "SECRET"' >> .env
          echo 'STAGE            = "DEV"' >> .env
          
          npm install
          npm run test
        """
        sh "docker ps"
      }
    }

    stage('3. Staging Deploy') {
      when {
        branch 'develop'  
      }
      
      steps {
        echo "============Deploying For Staging================"
        
        sh """
          ./scripts/deploy.sh \
          ${env.BUILD_NUMBER} \
          ${DOCKER_IMAGE_URI} \
          ${DOCKER_IMAGE_NAME} \
          ${AWS_PROFILE} \
          ${AWS_REGION} \
          staging
        """
        sh "docker ps"
      }
    }
  }

  post {
    always { 
      cleanWs()
      dir("${env.WORKSPACE}@tmp") {
        deleteDir()
      }
    }
  }

}