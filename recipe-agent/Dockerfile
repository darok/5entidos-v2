FROM node:20-slim

# ffmpeg: audio transcoding for the Whisper fallback
# python3/pip: needed to install yt-dlp
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Installed unpinned so image rebuilds always pick up the latest yt-dlp —
# YouTube-side breakage is usually patched upstream within days.
RUN pip3 install --no-cache-dir --break-system-packages -U yt-dlp

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "server.js"]
