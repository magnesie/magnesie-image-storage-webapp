FROM node as builder
RUN mkdir -p /magnesie-image-storage-webapp
WORKDIR /magnesie-image-storage-webapp
COPY package.json /magnesie-image-storage-webapp
RUN npm install
COPY . /magnesie-image-storage-webapp
RUN npm run build -- --prod

FROM nginx:1.17.1-alpine
COPY --from=builder /magnesie-image-storage-webapp/dist/magnesie-image-storage-webapp /usr/share/nginx/html
