FROM amazon/aws-lambda-nodejs:18

######################################
# Copy TS Files Into Temp Dir
# And Compile
######################################
RUN mkdir build-temp
COPY . build-temp

WORKDIR build-temp
RUN npm install
RUN npm run complie
RUN npm prune --production

######################################
# Copy Compiled JS Files
######################################
RUN cp dist/aws_lambda.js ${LAMBDA_TASK_ROOT}
RUN cp dist/app.js        ${LAMBDA_TASK_ROOT}
RUN cp dist/database.js   ${LAMBDA_TASK_ROOT}

RUN cp -rf dist/api     ${LAMBDA_TASK_ROOT}/api
RUN cp -rf dist/schema  ${LAMBDA_TASK_ROOT}/schema
RUN cp -rf node_modules ${LAMBDA_TASK_ROOT}/node_modules

WORKDIR ${LAMBDA_TASK_ROOT}
RUN rm -rf ${LAMBDA_TASK_ROOT}/build-temp

######################################
# Set CMD To The Handler
######################################
CMD [ "aws_lambda.handler" ]
