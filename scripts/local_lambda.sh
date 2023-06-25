#!/bin/sh
set -e

IMAGE_NAME=${1:-graphql-api-template}
DB_HOST=${2:-host.docker.internal}
REGION=${3:-ap-northeast-2}

read -p "1️⃣  사용할 Database name을 입력해주세요 (예: bellti9er_database): " DB_NAME
read -p "2️⃣  Database username을 입력해주세요 (예: root): " DB_USER
read -p "3️⃣  Database password를 입력해주세요 (예: 123123): " DB_PASSWORD

echo "✅ Building Docker Image for ${IMAGE_NAME}"
docker build -t ${IMAGE_NAME}:test .

echo "\n\n🚀🚀🚀 Lambda running on 👉 http://localhost:9090/grapqhl 👈\n"
docker run                                \
    -e DB_HOST=${DB_HOST}                 \
    -e DB_USER=${DB_USER}                 \
    -e DB_PORT=3306                       \
    -e DB_NAME=${DB_NAME}                 \
    -e DB_PASSWORD=${DB_PASSWORD}         \
    -e REGION=${REGION}                   \
    -e STAGE=DEV                          \
    -e ALLOWED_HOSTS="localhost:9090"     \
    -p 9090:8080 ${IMAGE_NAME}:test
