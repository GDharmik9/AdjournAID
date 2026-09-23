#!/usr/bin/env bash
# ==============================================================================
# AdjournAI: Google Cloud Run Deployment Script (Concept B)
# Deploys backend and frontend to Google Cloud Run to provide live https://*.a.run.app URLs.
# ==============================================================================

set -e

PROJECT_ID="${1:-$(gcloud config get-value project)}"
REGION="${2:-us-central1}"

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: Google Cloud Project ID is not set."
  echo "Usage: ./deploy-cloudrun.sh <PROJECT_ID> [REGION]"
  exit 1
fi

echo "🚀 Deploying AdjournAI to Google Cloud Run..."
echo "• Project: $PROJECT_ID"
echo "• Region:  $REGION"

# Enable required Google Cloud APIs
echo "\n[Step 1] Enabling Google Cloud Services..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  aiplatform.googleapis.com \
  cloudbuild.googleapis.com \
  --project="$PROJECT_ID"

# Deploy Backend Service
echo "\n[Step 2] Building and Deploying Backend Service to Cloud Run..."
cd backend
gcloud run deploy adjourn-backend \
  --source . \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars "LLM_PROVIDER=gemini,GEMINI_MODEL=gemini-2.0-flash,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,GOOGLE_CLOUD_LOCATION=$REGION" \
  --project "$PROJECT_ID"

BACKEND_URL=$(gcloud run services describe adjourn-backend --platform managed --region "$REGION" --project "$PROJECT_ID" --format 'value(status.url)')
echo "✅ Backend deployed at: $BACKEND_URL"

# Deploy Frontend Service
echo "\n[Step 3] Building and Deploying Frontend Service to Cloud Run..."
cd ../frontend
gcloud run deploy adjourn-frontend \
  --source . \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars "VITE_API_URL=$BACKEND_URL" \
  --project "$PROJECT_ID"

FRONTEND_URL=$(gcloud run services describe adjourn-frontend --platform managed --region "$REGION" --project "$PROJECT_ID" --format 'value(status.url)')

echo "\n=============================================================================="
echo " 🎉 ADJOURNAI CLOUD RUN DEPLOYMENT COMPLETE!"
echo "=============================================================================="
echo "• Live Web Application URL: $FRONTEND_URL"
echo "• Backend API URL:          $BACKEND_URL"
echo "• Swagger Documentation:    $BACKEND_URL/docs"
echo "=============================================================================="
