#!/bin/bash
# Script para debug do Keycloak

echo "=== Testando conectividade do Keycloak ==="

echo -e "\n1. Testando porta 8080:"
curl -v http://localhost:8080 2>&1 | head -20

echo -e "\n2. Testando /realms/master:"
curl -s http://localhost:8080/realms/master

echo -e "\n3. Testando /.well-known/openid-configuration:"
curl -s http://localhost:8080/realms/master/.well-known/openid-configuration | head -20

echo -e "\n4. Testando porta 9000:"
curl -v http://localhost:9000 2>&1 | head -20

echo -e "\n5. Testando /health:"
curl -s http://localhost:8080/health

echo -e "\n6. Testando /health/ready:"
curl -s http://localhost:8080/health/ready

echo -e "\n7. Verificando se curl existe no container:"
podman exec durvalcrm_keycloak which curl

echo -e "\n8. Executando healthcheck manualmente no container:"
podman exec durvalcrm_keycloak sh -c "curl -s http://localhost:8080/realms/master/.well-known/openid-configuration > /dev/null && echo 'OK' || echo 'FAILED'"