FROM registry.il2.dso.mil/platform-one/devops/pipeline-templates/ironbank/nodejs14:14.15.5 AS builder
USER root
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
# Stage 2
FROM registry.il2.dso.mil/platform-one/devops/pipeline-templates/base-image/harden-nginx-19:1.19.2
USER appuser
COPY --from=builder --chown=appuser:appuser /app/build /opt/tron-common-api-dashboard
EXPOSE 8080
CMD [ "nginx", "-g", "daemon off;" ]
