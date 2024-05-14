FROM node:latest as build

WORKDIR /usr/local/app

COPY ./ /usr/local/app/

RUN npm install
RUN npm run build

FROM nginx:1.25
COPY --from=build /usr/local/app/dist/web-crawler /usr/share/nginx/html
COPY --from=build /usr/local/app/server.conf /usr/local/app/server.conf

RUN mv /usr/local/app/server.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
