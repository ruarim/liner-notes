gcloud run deploy music-research-tool \
  --region=europe-west2 \
  --source . \
  --network=default \
  --subnet=default \
  --env-vars-file .env \
  --allow-unauthenticated