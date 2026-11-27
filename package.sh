#!/usr/bin/env bash
# Build image and bundle with compose file for scp to another machine.
# Single host deployment only.
#
# Usage: ./package.sh [-p platform] [-t tag] [-o outdir]

set -euo pipefail

cd "$(dirname "$0")"

PLATFORM="linux/amd64"
TAG="latest"
OUT_DIR="dist"

while getopts "p:t:o:h" opt; do
  case "$opt" in
    p) PLATFORM="$OPTARG" ;;
    t) TAG="$OPTARG" ;;
    o) OUT_DIR="$OPTARG" ;;
    *) sed -n '2,4p' "$0"; exit 1 ;;
  esac
done

export IMAGE_TAG="$TAG"
export DOCKER_DEFAULT_PLATFORM="$PLATFORM"

# compose requires .env to exist; use a temporary copy of the example if absent.
if [ ! -f .env ]; then
  cp .env.example .env
  trap 'rm -f .env' EXIT
fi

BUNDLE="$OUT_DIR/liner-notes"
rm -rf "$BUNDLE"
mkdir -p "$BUNDLE"

echo "Building image for $PLATFORM (tag: $TAG)..."
docker compose build

echo "Saving image..."
docker save "liner-notes-app:$TAG" | gzip > "$BUNDLE/image.tar.gz"

cp docker-compose.yml "$BUNDLE/docker-compose.yml"
cp .env.example "$BUNDLE/.env.example"

cat > "$BUNDLE/run.sh" <<'EOF'
#!/usr/bin/env bash
# Load image and start the stack. Requires a .env (copy from .env.example).
set -euo pipefail
cd "$(dirname "$0")"
[ -f .env ] || { echo "Missing .env; copy .env.example and fill it in." >&2; exit 1; }
gunzip -c image.tar.gz | docker load
docker compose -f docker-compose.yml up -d --no-build
EOF
chmod +x "$BUNDLE/run.sh"

tar -C "$OUT_DIR" -czf "$OUT_DIR/liner-notes.tar.gz" liner-notes

echo
echo "Bundle: $OUT_DIR/liner-notes.tar.gz"
echo "Transfer: rsync -avP $OUT_DIR/liner-notes.tar.gz user@host:~/"
echo "On target: tar xzf liner-notes.tar.gz && cd liner-notes && cp .env.example .env && ./run.sh"
