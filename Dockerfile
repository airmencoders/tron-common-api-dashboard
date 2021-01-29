FROM registry.il2.dso.mil/platform-one/devops/pipeline-templates/harden-nodejs-12-18-3:8.2.276

EXPOSE 3000

WORKDIR /opt/tron-common-api-dashboard

COPY . .
RUN npm install
RUN npm run build

RUN npm install -g serve

CMD ["serve", "-s", "build", "-l", "3000"]

