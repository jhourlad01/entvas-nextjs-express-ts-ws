#!/bin/bash

# Define shared variables
API_APP="entvas-api"
CLIENT_APP="entvas-client"

# Function to deploy with proper error handling
deploy_app() {
  local app_name=$1
  local service_dir=$2
  local extra_args=$3
  
  echo "Deploying $app_name..."
  cd "$service_dir"
  
  # Use immediate strategy to avoid rolling update issues
  if fly deploy --app "$app_name" --strategy immediate $extra_args; then
    echo "✅ $app_name deployed successfully"
    cd ../..
    return 0
  else
    echo "❌ $app_name deployment failed. Showing logs:"
    fly logs -a "$app_name" | tail -20
    cd ../..
    return 1
  fi
}

# 1. Set secrets for API
echo "Setting secrets for API..."
fly secrets set \
  DATABASE_URL="postgres://postgres:Dr64IHnB6PYz6cUJ@db.oadmpowxrzupmcindpbl.supabase.co:5432/postgres" \
  JWT_ISSUER_DOMAIN="joe-estrella.us.auth0.com" \
  JWT_AUDIENCE="https://joe-estrella.us.auth0.com/api/v2/" \
  WEBHOOK_API_KEY="entvas_webhook_secret_key_8797f88b5f2e10fbf09d7ef162ffc75b" \
  -a "$API_APP"

# 2. Deploy API
if ! deploy_app "$API_APP" "services/api" "--build-arg CACHEBUST=$(date +%s)"; then
  echo "❌ API deployment failed, but continuing with client..."
fi

# 3. Deploy Client
if ! deploy_app "$CLIENT_APP" "services/client" ""; then
  echo "❌ Client deployment failed"
  exit 1
fi

echo "*** Deployment completed for API and Client. ***"
