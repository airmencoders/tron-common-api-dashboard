FROM registry.il2.dso.mil/platform-one/devops/pipeline-templates/ironbank/nodejs16:16.3.0 AS builder
USER node 
WORKDIR /home/node
COPY --chown=node:node . /home/node/
RUN npm run build
    
# Stage 2
FROM registry.il2.dso.mil/platform-one/devops/pipeline-templates/base-image/harden-nginx-20:1.20.1
USER appuser
COPY --from=builder --chown=appuser:appuser /home/node/build /var/www
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
CMD [ "nginx", "-g", "daemon off;"]
