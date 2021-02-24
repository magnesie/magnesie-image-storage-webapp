# Magnesie-Image-Storage-Webapp

Angular webapp with a form to submit climbing wall photos to the Magnesie-Image-Storage-Webservice.
It is assumed that the Magnesie-Image-Storage-Webservice is located on : localhost:7880

## Run with Docker

```sh
docker build -t magnesie-image-storage-webapp .
docker run -p 7882:80 --name magnesie-image-storage-webapp magnesie-image-storage-webapp
```
