# ==============================================================================
# AdjournAI: Google Cloud Run Deployment Script (PowerShell for Windows)
# ==============================================================================

param (
    [string]$ProjectId = "",
    [string]$Region = "us-central1"
)

if (-not $ProjectId) {
    $ProjectId = (gcloud config get-value project 2>$null)
}

if (-not $ProjectId) {
    Write-Error "Google Cloud Project ID is not set. Usage: .\deploy-cloudrun.ps1 -ProjectId <YOUR_PROJECT_ID>"
    exit 1
}

Write-Host "🚀 Deploying AdjournAI to Google Cloud Run..." -ForegroundColor Cyan
Write-Host "• Project: $ProjectId"
Write-Host "• Region:  $Region"

# Step 1: Enable APIs
Write-Host "`n[Step 1] Enabling Google Cloud Services..." -ForegroundColor Yellow
gcloud services enable `
    run.googleapis.com `
    artifactregistry.googleapis.com `
    aiplatform.googleapis.com `
    cloudbuild.googleapis.com `
    --project=$ProjectId

# Step 2: Deploy Backend
Write-Host "`n[Step 2] Deploying Backend to Cloud Run..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\backend"
gcloud run deploy adjourn-backend `
    --source . `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --set-env-vars "LLM_PROVIDER=gemini,GEMINI_MODEL=gemini-2.0-flash,GOOGLE_CLOUD_PROJECT=$ProjectId,GOOGLE_CLOUD_LOCATION=$Region" `
    --project $ProjectId

$BackendUrl = (gcloud run services describe adjourn-backend --platform managed --region $Region --project $ProjectId --format 'value(status.url)')
Write-Host "✅ Backend deployed at: $BackendUrl" -ForegroundColor Green

# Step 3: Deploy Frontend
Write-Host "`n[Step 3] Deploying Frontend to Cloud Run..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\frontend"
gcloud run deploy adjourn-frontend `
    --source . `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --set-env-vars "VITE_API_URL=$BackendUrl" `
    --project $ProjectId

$FrontendUrl = (gcloud run services describe adjourn-frontend --platform managed --region $Region --project $ProjectId --format 'value(status.url)')
Set-Location -Path $PSScriptRoot

Write-Host "`n==============================================================================" -ForegroundColor Green
Write-Host " 🎉 ADJOURNAI CLOUD RUN DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "• Live Web Application URL: $FrontendUrl" -ForegroundColor Cyan
Write-Host "• Backend API URL:          $BackendUrl" -ForegroundColor Cyan
Write-Host "• Swagger Documentation:    $BackendUrl/docs" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Green
