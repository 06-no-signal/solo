if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <tenant_name> <database_name>"
  exit 1
fi
echo "Creating tenant '$1' with database name '$2' ..."

kubectl port-forward $(kubectl get pod -l cnpg.io/instanceRole=primary,app.kubernetes.io/component=app -o jsonpath="{.items[0].metadata.name}") 54322:5432 &
PF_PID=$!
echo "Waiting 2s for port-forward to be established ..."
sleep 2

username=$(kubectl get secret pg-usr-secret -o jsonpath="{.data.username}" | base64 -d)
password=$(kubectl get secret pg-usr-secret -o jsonpath="{.data.password}" | base64 -d)
PGPASSWORD=$password psql -h localhost -p 54322 -U $username -d solo_app_db -c "INSERT INTO tenant (name, database_name) VALUES ('$1','$2');"
PGPASSWORD=$password psql -h localhost -p 54322 -U $username -d solo_app_db -c "SELECT * FROM tenant WHERE name='$1' and database_name='$2';"

echo "Tenant '$1' created. Killing port-forward"
kill $PF_PID
