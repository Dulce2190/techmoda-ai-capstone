#!/bin/bash
set -e

usage() {
    echo "Usage: $0 --api-url URL --search-url URL --assistant-url URL --voice-url URL [-d DIST_DIR]"
    exit 1
}

DIST_DIR="frontend/dist"
API_URL=""
SEARCH_URL=""
ASSISTANT_URL=""
VOICE_URL=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -a|--api-url) API_URL="$2"; shift 2 ;;
        --search-url) SEARCH_URL="$2"; shift 2 ;;
        --assistant-url) ASSISTANT_URL="$2"; shift 2 ;;
        --voice-url) VOICE_URL="$2"; shift 2 ;;
        -d|--dist-dir) DIST_DIR="$2"; shift 2 ;;
        -h|--help) usage ;;
        *) echo "Error: Unknown option $1"; usage ;;
    esac
done

if [ -z "$API_URL" ]; then
    echo "❌ Error: API URL is required"
    usage
fi

API_URL="${API_URL%/}"
SEARCH_URL="${SEARCH_URL%/}"
ASSISTANT_URL="${ASSISTANT_URL%/}"
VOICE_URL="${VOICE_URL%/}"

if [ ! -d "$DIST_DIR" ]; then
    echo "❌ Error: Distribution directory not found: $DIST_DIR"
    exit 1
fi

TEMPLATE_FILE="frontend/public/env-config.js.template"
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "❌ Error: Template file not found: $TEMPLATE_FILE"
    exit 1
fi

echo "=========================================="
echo "  Runtime Environment Injection"
echo "=========================================="
echo "📋 Configuration:"
echo "   API URL:       $API_URL"
echo "   Search URL:    $SEARCH_URL"
echo "   Assistant URL: $ASSISTANT_URL"
echo "   Voice URL:     $VOICE_URL"
echo "   Dist dir:      $DIST_DIR"
echo ""

OUTPUT_FILE="$DIST_DIR/env-config.js"

echo "🔧 Generating runtime configuration..."
sed \
  -e "s|%%VITE_API_URL%%|$API_URL|g" \
  -e "s|%%VITE_SEARCH_URL%%|$SEARCH_URL|g" \
  -e "s|%%VITE_ASSISTANT_URL%%|$ASSISTANT_URL|g" \
  -e "s|%%VITE_VOICE_URL%%|$VOICE_URL|g" \
  "$TEMPLATE_FILE" > "$OUTPUT_FILE"

if [ ! -f "$OUTPUT_FILE" ]; then
    echo "❌ Error: Failed to create $OUTPUT_FILE"
    exit 1
fi

echo "✅ Runtime configuration injected successfully!"
echo ""
echo "🔍 Content preview:"
cat "$OUTPUT_FILE"
echo ""
