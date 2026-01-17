gcloud run deploy music-research-tool \
  --project=music-research-483121 \
  --region=europe-west2 \
  --source . \
  --network=default \
  --subnet=default \
  --env-vars-file .env \
  --allow-unauthenticated