FROM --platform=linux/amd64 node:18.17.1

WORKDIR /app

COPY package.json ./

COPY sequelizerc-docker ./

RUN yarn install --production


EXPOSE 80

COPY . .

RUN npm install -g typescript

RUN  yarn run build

RUN mv /app/sequelizerc-docker /app/.sequelizerc


CMD yarn start --bind 0.0.0.0:$PORT