#!/bin/sh

##
## This script is for Jenkinsfile to execute.
##

IMAGE_NAME=graphql-api-template

BUILD_NUMBER=$1
DOCKER_IMAGE_URI=${2:-774211786053.dkr.ecr.ap-northeast-2.amazonaws.com/$IMAGE_NAME}
DOCKER_IMAGE_NAME=${3:-$IMAGE_NAME}
AWS_PROFILE=${4:-bellti9er}
AWS_REGION=${5:-ap-northeast-2}
STAGE=${6:-staging}

echo "Staging = $STAGE"

if [ $STAGE != "prod" ]; then
    PREFIX=$STAGE
fi

##########################################################
# Build & Push Docker Image
##########################################################
echo "🚧 Building and pushing docker image to deploy..."
aws ecr get-login-password --region $AWS_REGION --profile ${AWS_PROFILE} | sudo docker login --username AWS --password-stdin $DOCKER_IMAGE_URI

sudo docker build --build-arg NPM_TOKEN=$NPM_TOKEN -t $DOCKER_IMAGE_NAME:$BUILD_NUMBER .
sudo docker tag $DOCKER_IMAGE_NAME:$BUILD_NUMBER $DOCKER_IMAGE_URI:$STAGE-$BUILD_NUMBER
sudo docker tag $DOCKER_IMAGE_NAME:$BUILD_NUMBER $DOCKER_IMAGE_URI:$STAGE
sudo docker push $DOCKER_IMAGE_URI:$STAGE-$BUILD_NUMBER
sudo docker push $DOCKER_IMAGE_URI:$STAGE

###########################################################
## Get A List Of IPs For The EC2 To Be Deployed
###########################################################
echo "🚂 Deploying lambda function..."
aws lambda update-function-code \
    --function-name ${PREFIX:+$PREFIX-}${DOCKER_IMAGE_NAME} \
    --image-uri ${DOCKER_IMAGE_URI}:${STAGE} \
    --profile ${AWS_PROFILE} \
    --region ${AWS_REGION}
