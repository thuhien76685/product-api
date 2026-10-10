FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce"

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]
