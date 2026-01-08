#!/bin/bash
docker build -t jakic12/solo-frontend:latest . # -f Dockerfile.dev
docker push jakic12/solo-frontend:latest

kubectl delete pods -l app.kubernetes.io/component=frontend-server
