FROM node:18-alpine AS builder

WORKDIR .

COPY package*.json ./
RUN npm install

COPY . .

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build && ls -la .next

FROM node:18-alpine as runner

WORKDIR .

COPY --from=builder ./package.json ./
COPY --from=builder ./next.config.js ./
COPY --from=builder ./public ./public
COPY --from=builder ./node_modules ./node_modules
COPY --from=builder ./.next ./.next
COPY --from=builder ./next.config.js ./

EXPOSE 3000

CMD ["npm", "start"]


