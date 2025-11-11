#!/bin/bash

# Install deployment using Helm
#helm uninstall hello-world
#echo "Installing, please wait ..."
#helm install hello-world $(dirname "$0")/helm

echo "Ok, please wait ..."
helm upgrade hello-world $(dirname "$0")/helm


