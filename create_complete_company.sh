#!/bin/bash

EMAIL="malena@example.com"
PASSWORD="malena123"
COMPANY_NAME="Moja Komplet Firma"
CITY_UPDATE="Novi Beograd"
PHONE_UPDATE="011/987-654"
DESKTOP_DIR="$HOME/Desktop"

echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
  echo "❌ Login failed"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Token acquired"

echo "Deleting existing companies named '$COMPANY_NAME'..."
EXISTING_IDS=$(curl -s http://localhost:3001/api/companies \
  -H "Authorization: Bearer $TOKEN" | jq -r ".[] | select(.name==\"$COMPANY_NAME\") | .id")

for ID in $EXISTING_IDS; do
  curl -s -X DELETE http://localhost:3001/api/companies/$ID \
    -H "Authorization: Bearer $TOKEN"
  echo "Deleted company ID $ID"
done

echo "Creating new company..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/companies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Moja Komplet Firma",
    "city": "Beograd",
    "description": "Opis firme za test",
    "services": ["Frizer","Kozmetika","","Pedikir"]
  }')

COMPANY_ID=$(echo "$CREATE_RESPONSE" | jq -r '.company.id')

if [[ -z "$COMPANY_ID" || "$COMPANY_ID" == "null" ]]; then
  echo "❌ Company creation failed"
  echo "$CREATE_RESPONSE"
  exit 1
fi

echo "✅ Company created with ID: $COMPANY_ID"

echo "Uploading images..."
for FILE in "$DESKTOP_DIR"/*.jpg; do
  if [[ -f "$FILE" ]]; then
    curl -s -X POST http://localhost:3001/api/companies/$COMPANY_ID/images \
      -H "Authorization: Bearer $TOKEN" \
      -F "images=@$FILE"
    echo "Uploaded $(basename "$FILE")"
  fi
done

echo "Updating company..."
curl -s -X PUT http://localhost:3001/api/companies/$COMPANY_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"city\": \"$CITY_UPDATE\",
    \"phone\": \"$PHONE_UPDATE\"
  }"

echo "Fetching company details..."
curl -s http://localhost:3001/api/companies/$COMPANY_ID \
  -H "Authorization: Bearer $TOKEN" | jq

echo "🎉 DONE"
