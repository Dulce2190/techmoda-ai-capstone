#!/usr/bin/env bash
set -uo pipefail
echo "--- 1. Configurando tu stack personal ---"
STACK_NAME="techmoda-ai-dulcepoll"
echo "--- 2. Compilando el frontend ---"
cd frontend
npm install
npm run build
cd ..
echo "--- 3. Desplegando el backend con SAM ---"
sam build
sam deploy --stack-name "$STACK_NAME" --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND --no-confirm-
echo "--- 4. Sincronizando el frontend con S3 ---"
aws s3 sync frontend/dist s3://${STACK_NAME}-frontend/ --delete
echo "¡Despliegue completado con éxito!"
