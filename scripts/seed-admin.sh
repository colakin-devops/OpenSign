#!/usr/bin/env bash
# ==============================================================================
# Script: seed-admin.sh
# Purpose: Seeds the initial OpenSign Admin user into the database
# ==============================================================================

set -e

# Load environment variables from .env.prod if present and not already set
if [ -f .env.prod ]; then
  [ -z "$SERVER_URL" ] && SERVER_URL=$(grep "^SERVER_URL=" .env.prod | cut -d '=' -f2- | tr -d "'\"")
  [ -z "$APP_ID" ] && APP_ID=$(grep "^APP_ID=" .env.prod | cut -d '=' -f2- | tr -d "'\"")
  [ -z "$MASTER_KEY" ] && MASTER_KEY=$(grep "^MASTER_KEY=" .env.prod | cut -d '=' -f2- | tr -d "'\"")
fi

SERVER_URL=${SERVER_URL:-"https://dex-sign.colakin.com/api/app"}
APP_ID=${APP_ID:-"opensign"}
MASTER_KEY=${MASTER_KEY:-"3bd26302c480ad9612493a0d7c9143fc"}

ADMIN_EMAIL=${1:-"contact@colakin.ai"}
ADMIN_PASSWORD=${2:-"ColakinSign123!"}
ADMIN_NAME=${3:-"Colakin Admin"}
COMPANY=${4:-"Colakin"}

echo "--------------------------------------------------------"
echo "Seeding Admin User in OpenSign"
echo "Server URL: $SERVER_URL"
echo "App ID:     $APP_ID"
echo "Admin:      $ADMIN_EMAIL"
echo "--------------------------------------------------------"

RESPONSE=$(curl -s -X POST "${SERVER_URL}/functions/addadmin" \
  -H "Content-Type: application/json" \
  -H "X-Parse-Application-Id: ${APP_ID}" \
  -H "X-Parse-Master-Key: ${MASTER_KEY}" \
  -d "{
    \"userDetails\": {
      \"name\": \"${ADMIN_NAME}\",
      \"email\": \"${ADMIN_EMAIL}\",
      \"password\": \"${ADMIN_PASSWORD}\",
      \"company\": \"${COMPANY}\",
      \"jobTitle\": \"Administrator\",
      \"role\": \"contracts_Admin\",
      \"timezone\": \"Asia/Kolkata\"
    }
  }")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "User sign up"; then
  echo "✅ Successfully created admin: $ADMIN_EMAIL"
elif echo "$RESPONSE" | grep -q "User already exist"; then
  echo "ℹ️ Admin user already exists: $ADMIN_EMAIL"
else
  echo "⚠️ Result: $RESPONSE"
fi
