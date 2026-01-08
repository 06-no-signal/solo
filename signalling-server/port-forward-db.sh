kubectl port-forward $(kubectl get pod -l cnpg.io/instanceRole=primary,app.kubernetes.io/component=app -o jsonpath="{.items[0].metadata.name}") 5432:5432 &
