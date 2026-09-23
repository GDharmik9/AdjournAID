#!/usr/bin/env bash
# ==============================================================================
# AdjournAID: Google Cloud Run & Vertex AI Deployment Script (Bash)
# Deploys the unified full-stack application (React UI + FastAPI + Vertex AI)
# ==============================================================================

set -e

PROJECT_ID="${1:-$(gcloud config get-value project 2>/dev/null)}"
REGION="${2:-us-central1}"

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: Google Cloud Project ID is not set."
  echo "Usage: ./deploy-cloudrun.sh <PROJECT_ID> [REGION]"
  exit 1
fi

echo "=============================================================================="
echo " 🚀 Deploying AdjournAID to Google Cloud Run with Vertex AI"
echo "=============================================================================="
echo "• GCP Project: $PROJECT_ID"
echo "• Region:      $REGION"

# Step 1: Enable required GCP APIs
echo -e "\n[Step 1/3] Enabling Google Cloud Services..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  aiplatform.googleapis.com \
  cloudbuild.googleapis.com \
  --project="$PROJECT_ID"

# Step 2: Grant Vertex AI IAM permissions to Cloud Run Service Account
echo -e "\n[Step 2/3] Configuring Vertex AI IAM permissions..."
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format 'value(projectNumber)')
DEFAULT_COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "• Granting required Cloud Run & Vertex AI IAM roles to ${DEFAULT_COMPUTE_SA}..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${DEFAULT_COMPUTE_SA}" \
  --role="roles/aiplatform.user" \
  --condition=None \
  --quiet
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${DEFAULT_COMPUTE_SA}" \
  --role="roles/storage.admin" \
  --condition=None \
  --quiet
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${DEFAULT_COMPUTE_SA}" \
  --role="roles/artifactregistry.writer" \
  --condition=None \
  --quiet

# Step 3: Build & Deploy Unified Full-Stack Container to Cloud Run
echo -e "\n[Step 3/3] Building and Deploying Unified Service to Cloud Run..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

gcloud run deploy adjournaid \
  --source . \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars "LLM_PROVIDER=vertex_ai,GEMINI_MODEL=gemini-2.5-flash,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,GOOGLE_CLOUD_LOCATION=$REGION" \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --project "$PROJECT_ID"

SERVICE_URL=$(gcloud run services describe adjournaid --platform managed --region "$REGION" --project "$PROJECT_ID" --format 'value(status.url)')

echo -e "\n=============================================================================="
echo " 🎉 AdjournAID CLOUD RUN & VERTEX AI DEPLOYMENT COMPLETE!"
echo "=============================================================================="
echo "• Live Web Application URL: $SERVICE_URL"
echo "• Health & Model Status:    $SERVICE_URL/api/health"
echo "• Swagger Documentation:    $SERVICE_URL/docs"
echo "=============================================================================="
