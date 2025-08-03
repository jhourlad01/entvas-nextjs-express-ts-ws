#!/bin/bash

set -e

# Define shared variables
API_APP="entvas-api"
CLIENT_APP="entvas-client"

# 1. Set secrets for API
echo "Setting secrets for API..."
fly secrets set \
  DATABASE_URL="postgres://postgres:Dr64IHnB6PYz6cUJ@db.oadmpowxrzupmcindpbl.supabase.co:5432/postgres" \
  AUTH0_DOMAIN="joe-estrella.us.auth0.com" \
  AUTH0_AUDIENCE="https://joe-estrella.us.auth0.com/api/v2/" \
  AUTH0_CLIENT_ID="Wd1t5JLE8OMxtFV0qv2IZ2URagwb0S7V" \
  WEBHOOK_API_KEY="entvas_webhook_secret_key_8797f88b5f2e10fbf09d7ef162ffc75b" \
  NODE_ENV="production" \
  -a "$API_APP"

# Check if API changed
if git diff --quiet HEAD~1 -- services/api; then
  echo "No changes in API. Skipping deployment."
else
  echo "Deploying API..."
cd services/api
if ! fly deploy --app "$API_APP" --build-arg CACHEBUST=$(date +%s); then
  echo "API deployment failed. Showing logs:"
  fly logs -a "$API_APP" --tail 50
  exit 1
fi
  cd ../..
fi

# Check if Client changed
if git diff --quiet HEAD~1 -- services/client; then
  echo "No changes in Client. Skipping deployment."
else
  echo "Deploying Client..."
  cd services/client
  if ! fly deploy --app "$CLIENT_APP"; then
    echo "Client deployment failed. Showing logs:"
    fly logs -a "$CLIENT_APP" --tail 50
    exit 1
  fi
  cd ../..
fi

echo "*** Deployment completed for API and Client. ***"
