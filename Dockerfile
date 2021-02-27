FROM registry.il2.dso.mil/platform-one/devops/pipeline-templates/base-image/harden-nodejs14:14.15.5

EXPOSE 3000

WORKDIR /opt/tron-common-api-dashboard

COPY . .
RUN npm install
RUN npm run build

RUN npm install -g serve

CMD ["serve", "-s", "build", "-l", "3000"]


