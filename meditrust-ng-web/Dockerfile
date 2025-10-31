FROM node:18-alpine AS builder

WORKDIR /meditrust-ng-web/app

COPY package*.json ./
RUN npm install

COPY . .

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build && ls -la .next

FROM node:18-alpine as runner

WORKDIR /meditrust-ng-web/app

COPY --from=builder /meditrust-ng-web/app/package.json ./
COPY --from=builder /meditrust-ng-web/app/next.config.js ./
COPY --from=builder /meditrust-ng-web/app/public ./public
COPY --from=builder /meditrust-ng-web/app/node_modules ./node_modules
COPY --from=builder /meditrust-ng-web/app/.next ./.next
COPY --from=builder /meditrust-ng-web/app/next.config.js ./

EXPOSE 3000

CMD ["npm", "start"]


