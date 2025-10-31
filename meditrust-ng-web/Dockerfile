FROM node:18-alpine AS builder

WORKDIR /app

COPY meditrust-ng-web/package*.json ./
RUN npm install

COPY meditrust-ng-web .

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=https://ygqftwnzqcuykntpbcnp.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncWZ0d256cWN1eWtudHBiY25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjI1MDgsImV4cCI6MjA3MTc5ODUwOH0.DNbyUStgzBhyBhMP-5eNj0HQRCHb0tUHPPAUtEqagDE

RUN npm run build && ls -la .next

FROM node:18-alpine as runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./

EXPOSE 3000

CMD ["npm", "start"]


