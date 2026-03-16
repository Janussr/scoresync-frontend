FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY .next .next
COPY public public
COPY .env.local .env.local

EXPOSE 3000

CMD ["npm", "start"]