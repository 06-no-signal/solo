# Solo

<div align="center">

### The Screen Sharing App Your Homies Actually Want to Use

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Built with Love](https://img.shields.io/badge/Built%20with-%E2%9D%A4-red)](https://github.com/jakic12/solo)
[![Not Microsoft Teams](https://img.shields.io/badge/Not-Microsoft%20Teams-success)](https://github.com/jakic12/solo)
[![All Homies Approved](https://img.shields.io/badge/All%20Homies-Approved-brightgreen)](https://github.com/jakic12/solo)

**Solo** is a next-generation screen sharing application designed for people who value their sanity, performance, and freedom.

</div>

### Why Solo?

| Feature | Solo | Microsoft Teams | Zoom | Discord |
|---------|------|-----------------|------|---------|
| **Homie Approval** | 🟢 💯% | 🔴 0% | 🟡 50% | 🟡 75% |

---

## Zahteve
- [x] Repozitorij
- [x] Mikrostoritve in »cloud-native« aplikacija
- [ ] Dokumentacija
- [ ] Dokumentacija API
- [ ] Cevovod CI/CD
- [x] Helm charts
- [x] Namestitev v oblak
- [ ] »Serverless« funkcija
- [x] Zunanji API
- [ ] Večnajemništvo (ang. multitenancy)
- [ ] Preverjanje zdravja
- [ ] GraphQL in gRPC
- [ ] Sporočilni sistemi
- [ ] »Event sourcing« in CQRS
- [x] Centralizirano beleženje dnevnikov
- [x] Zbiranje metrik
- [ ] Izolacija in toleranca napak
- [ ] Upravljanje s konfiguracijo
- [x] Grafični vmesnik
- [ ] Vmesna predstavitev
- [ ] Oddaja projekta
- [ ] Terraform
- [x] API Gateway
- [ ] Ingress controller
- [ ] IAM, OAuth2, OIDC

---

## Install gateway controller

nginx gateway controller installed in the cluster.
1. Install gateway-api CRDs
```bash
kubectl apply -k "github.com/kubernetes-sigs/gateway-api/config/crd?ref=v1.1.0"
```
2. Install nginx gateway fabric
```bash
helm install ngf oci://ghcr.io/nginx/charts/nginx-gateway-fabric --create-namespace -n nginx-gateway
```
3. Install TLS secrets
```bash
sops --decrypt secrets.enc.yaml | kubectl apply -f -
```

## Development
```bash
# Build and deploy frontend image
cd client
sudo docker build -t plojyon/solo-frontend:latest .
sudo docker push plojyon/solo-frontend:latest
cd ..

# Import secrets
sops --decrypt secrets.enc.yaml | kubectl apply -f -

# Connect to k8s cluster
#export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
export KUBECONFIG=~/.kube/config
```

## helm dependencies
```bash
helm repo add fluent https://fluent.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add minio https://charts.min.io/
helm dependency update ./helm
```

## Configure kubectl
```bash
az aks get-credentials --resource-group solo-rg --name solo-aks
# TODO: configure terraform
```


