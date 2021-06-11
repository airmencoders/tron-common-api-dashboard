FROM registry.il2.dso.mil/platform-one/devops/pipeline-templates/ironbank/nodejs14:14.15.5 AS builder
USER node 
WORKDIR /home/node
COPY --chown=node:node . /home/node/
RUN npm ci
RUN npm run build
# Stage 2
FROM registry.il2.dso.mil/platform-one/devops/pipeline-templates/base-image/harden-nginx-20:1.20.1
USER appuser
COPY --from=builder --chown=appuser:appuser /home/node/build /var/www
EXPOSE 8080
CMD [ "nginx", "-g", "daemon off;"]
