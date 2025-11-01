# Use Node 20 since Node 18 is deprecated
FROM node:20-alpine AS builder

WORKDIR /app

COPY meditrust-ng-web/package*.json ./
RUN npm install

COPY meditrust-ng-web .

# Declare build args (for docker-compose or CI)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_PUBLISHABLE_KEY

# Export them as environment variables *before* build
ENV NEXT_PUBLIC_SUPABASE_URL=https://ygqftwnzqcuykntpbcnp.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncWZ0d256cWN1eWtudHBiY25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjI1MDgsImV4cCI6MjA3MTc5ODUwOH0.DNbyUStgzBhyBhMP-5eNj0HQRCHb0tUHPPAUtEqagDE
ENV NEXT_PUBLIC_PUBLISHABLE_KEY=sb_publishable_IcmuKibEIEszQCp7oUisFQ_fJ5p-YaW

RUN echo "Building with URL: $NEXT_PUBLIC_SUPABASE_URL" && \
    npm run build && ls -la .next

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_PUBLISHABLE_KEY=$NEXT_PUBLIC_PUBLISHABLE_KEY

EXPOSE 3000
CMD ["npm", "start"]
