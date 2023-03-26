pipeline {
  agent any
  options {
    disableConcurrentBuilds abortPrevious: true
  }
  stages {
    stage('Build Index') {
      agent {
        docker {
          reuseNode true
          image 'alpine/helm:3.3.4'
          args '--entrypoint=""'
        }
      }
      steps {
        sh '''
          helm repo index ./
          mkdir /tmp/helm-repo-html
          wget -O - https://github.com/halkeye/helm-repo-html/releases/download/v0.0.8/helm-repo-html_0.0.8_linux_x86_64.tar.gz | tar xzf - -C /tmp/helm-repo-html
          /tmp/helm-repo-html/bin/helm-repo-html
        '''
      }
    }
    stage('Setup Git') {
      steps {
        sh '''
          git config --global user.email "jenkins@gavinmogan.com"
          git config --global user.name "Jenkins"
          git config --global push.default simple
        '''
      }
    }
    stage('Commit') {
      when{
        allOf {
          branch "gh-pages"
          not { changeset 'index.html' }
        }
      }
      steps {
        sh '''
          git add index.yaml index.html
          git commit -m "Adding package [skip-ci]"
        '''
        script {
          withCredentials([usernamePassword(credentialsId: 'github-app-halkeye', usernameVariable: 'GITHUB_APP', passwordVariable: 'GITHUB_TOKEN')]) {
            sh '''
              git remote remove ghpages || true
              git remote add ghpages "https://x-access-token:${GITHUB_TOKEN}@github.com/halkeye/helm-charts.git"
              git push ghpages
            '''
          }
        }
      }
    }
  }
  post {
    failure {
      emailext(
        attachLog: true,
        recipientProviders: [developers()],
        body: 'Check console output at $BUILD_URL to view the results. \n\n ${CHANGES} \n\n -------------------------------------------------- \n${BUILD_LOG, maxLines=100, escapeHtml=false}',
        subject: '[JENKINS] ${JOB_NAME} failed',
        to: 'jenkins@gavinmogan.com'
      )
    }
    always {
      cleanWs()
    }
  }
}
