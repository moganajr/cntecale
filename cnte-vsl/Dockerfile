FROM node:22-bookworm-slim
ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts --no-package-lock \
    && npm cache clean --force
COPY --chown=node:node . .
USER node
EXPOSE 8080
CMD ["node", "live-server/server.js"]
