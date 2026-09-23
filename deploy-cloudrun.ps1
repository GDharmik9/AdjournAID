# ==============================================================================
# AdjournAID: Google Cloud Run & Vertex AI Deployment Script (PowerShell)
# Deploys the unified full-stack application (React UI + FastAPI + Vertex AI)
# ==============================================================================

param (
    [string]$ProjectId = "",
    [string]$Region = "us-central1"
)

$ErrorActionPreference = "Stop"

if (-not $ProjectId) {
    $ProjectId = (gcloud config get-value project 2>$null)
}

if (-not $ProjectId) {
    Write-Error "Google Cloud Project ID is not set. Usage: .\deploy-cloudrun.ps1 -ProjectId <YOUR_PROJECT_ID>"
    exit 1
}

Write-Host "`n==============================================================================" -ForegroundColor Cyan
Write-Host " 🚀 Deploying AdjournAID to Google Cloud Run with Vertex AI" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "• GCP Project: $ProjectId"
Write-Host "• Region:      $Region"

# Step 1: Enable required GCP APIs
Write-Host "`n[Step 1/3] Enabling Google Cloud Services..." -ForegroundColor Yellow
gcloud services enable `
    run.googleapis.com `
    artifactregistry.googleapis.com `
    aiplatform.googleapis.com `
    cloudbuild.googleapis.com `
    --project=$ProjectId

# Step 2: Grant Vertex AI IAM permissions to Cloud Run Service Account
Write-Host "`n[Step 2/3] Configuring Vertex AI IAM permissions..." -ForegroundColor Yellow
$ProjectNumber = (gcloud projects describe $ProjectId --format 'value(projectNumber)').Trim()
$DefaultComputeSA = "$ProjectNumber-compute@developer.gserviceaccount.com"

Write-Host "• Granting required Cloud Run & Vertex AI IAM roles to $DefaultComputeSA..."
gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:$DefaultComputeSA" `
    --role="roles/aiplatform.user" `
    --condition=None `
    --quiet
gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:$DefaultComputeSA" `
    --role="roles/storage.admin" `
    --condition=None `
    --quiet
gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:$DefaultComputeSA" `
    --role="roles/artifactregistry.writer" `
    --condition=None `
    --quiet

# Step 3: Build & Deploy Unified Full-Stack Container to Cloud Run
Write-Host "`n[Step 3/3] Building and Deploying Unified Service to Cloud Run..." -ForegroundColor Yellow
Set-Location -Path $PSScriptRoot

gcloud run deploy adjournaid `
    --source . `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --set-env-vars "LLM_PROVIDER=vertex_ai,GEMINI_MODEL=gemini-2.5-flash,GOOGLE_CLOUD_PROJECT=$ProjectId,GOOGLE_CLOUD_LOCATION=$Region" `
    --memory 1Gi `
    --cpu 1 `
    --timeout 300 `
    --project $ProjectId

$ServiceUrl = (gcloud run services describe adjournaid --platform managed --region $Region --project $ProjectId --format 'value(status.url)').Trim()

Write-Host "`n==============================================================================" -ForegroundColor Green
Write-Host " 🎉 AdjournAID CLOUD RUN & VERTEX AI DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "• Live Web Application URL: $ServiceUrl" -ForegroundColor Cyan
Write-Host "• Health & Model Status:    $ServiceUrl/api/health" -ForegroundColor Cyan
Write-Host "• Swagger Documentation:    $ServiceUrl/docs" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Green
