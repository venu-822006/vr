FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# `npm ci` installs exactly what's in package-lock.json — reproducible builds,
# unlike `npm install` which can silently drift between environments.
RUN npm ci --omit=dev

COPY . .

# Run as a non-root user inside the container instead of root. Ownership
# needs to be transferred explicitly, since files copied above land as root.
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 3001

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=5 \
  CMD node -e "fetch('http://localhost:3001/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npm", "start"]
