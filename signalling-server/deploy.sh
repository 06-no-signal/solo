#!/bin/bash
docker build -t jakic12/solo-signal:latest .
docker push jakic12/solo-signal:latest

kubectl delete pods -l app.kubernetes.io/component=WebRTC-signalling-server

# ../deploy.sh
