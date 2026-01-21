#!/bin/bash

# Configuration
SERVICE_ACCOUNT_NAME="github-actions-deployer"
PROJECT_ID="music-research-483121" # Hardcoded based on user's existing deploy command, or could be passed as arg
KEY_FILE="key.json"

echo "Creating Service Account: ${SERVICE_ACCOUNT_NAME} in project ${PROJECT_ID}..."

# Create the service account
gcloud iam service-accounts create "${SERVICE_ACCOUNT_NAME}" \
  --description="Service account for GitHub Actions deployment" \
  --display-name="GitHub Actions Deployer" \
  --project="${PROJECT_ID}"

# Grant necessary roles
ROLES=(
  "roles/run.admin"
  "roles/storage.admin"
  "roles/cloudbuild.builds.editor"
  "roles/iam.serviceAccountUser"
  "roles/artifactregistry.admin"
) 

for role in "${ROLES[@]}"; do
  echo "Granting role: ${role}..."
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="${role}"
done

echo "Generating JSON key..."
gcloud iam service-accounts keys create "${KEY_FILE}" \
  --iam-account="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --project="${PROJECT_ID}"

echo "Done! The key is saved to ${KEY_FILE}."
echo "Please add the content of ${KEY_FILE} to your GitHub Secrets as GCP_SA_KEY."
