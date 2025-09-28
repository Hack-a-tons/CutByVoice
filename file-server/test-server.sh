#!/usr/bin/env bash

# Change to script directory
cd "$(dirname "$0")"

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    echo "📁 Loaded configuration from: $(pwd)/.env"
else
    echo "⚠️  No .env file found in: $(pwd)"
fi

PORT=${PORT:-5000}
API_KEY=${EXPECTED_API_KEY:-"your-api-key"}
BASE_URL=${BASE_URL:-"http://localhost:$PORT"}

PASSED=0
FAILED=0

# Colors
GRAY='\033[90m'
GREEN='\033[32m'
RED='\033[31m'
RESET='\033[0m'

test_case() {
    local name="$1"
    local expected="$2"
    local actual="$3"
    
    if [[ "$actual" == *"$expected"* ]]; then
        echo -e "${GREEN}✅ $name${RESET}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $name${RESET}"
        echo "   Expected: $expected"
        echo "   Actual: $actual"
        ((FAILED++))
    fi
}

echo "Testing CutByVoice File Server"
echo "🌐 Base URL: $BASE_URL"
echo "🔑 API Key: ${API_KEY:0:8}..."
echo "============================================"

# Test 1: Root endpoint should return 404
echo "Test 1: Root endpoint returns 404"
echo -e "${GRAY}curl -s \"$BASE_URL\" 2>&1${RESET}"
response=$(curl -s "$BASE_URL" 2>&1)
test_case "Root 404" "404 Not Found" "$response"

# Test 2: Execute without auth should return 401
echo "Test 2: Execute without auth returns 401"
echo -e "${GRAY}curl -s -X POST \"$BASE_URL/execute\" -H \"Content-Type: application/json\" -d '{\"command\": \"ls\"}' 2>&1${RESET}"
response=$(curl -s -X POST "$BASE_URL/execute" -H "Content-Type: application/json" -d '{"command": "ls"}' 2>&1)
test_case "Auth required" "Unauthorized" "$response"

# Test 3: Execute with auth should work
echo "Test 3: Execute with auth works"
echo -e "${GRAY}curl -s -X POST \"$BASE_URL/execute\" -H \"Content-Type: application/json\" -H \"X-API-Key: $API_KEY\" -H \"X-User: testuser\" -d '{\"command\": \"ls -la\"}' 2>&1${RESET}"
response=$(curl -s -X POST "$BASE_URL/execute" -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" -H "X-User: testuser" -d '{"command": "ls -la"}' 2>&1)
test_case "Execute command" "stdout" "$response"

# Test 4: Create test file and upload
echo "Test 4: File upload works"
echo "test content for upload" > /tmp/test-upload.txt
echo -e "${GRAY}curl -s -X POST \"$BASE_URL/upload\" -H \"X-API-Key: $API_KEY\" -H \"X-User: testuser\" -F \"file=@/tmp/test-upload.txt\" 2>&1${RESET}"
response=$(curl -s -X POST "$BASE_URL/upload" -H "X-API-Key: $API_KEY" -H "X-User: testuser" -F "file=@/tmp/test-upload.txt" 2>&1)
test_case "File upload" "File uploaded successfully" "$response"

# Test 5: Verify uploaded file exists
echo "Test 5: Uploaded file exists"
echo -e "${GRAY}curl -s -X POST \"$BASE_URL/execute\" -H \"Content-Type: application/json\" -H \"X-API-Key: $API_KEY\" -H \"X-User: testuser\" -d '{\"command\": \"cat test-upload.txt\"}' 2>&1${RESET}"
response=$(curl -s -X POST "$BASE_URL/execute" -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" -H "X-User: testuser" -d '{"command": "cat test-upload.txt"}' 2>&1)
test_case "File content" "test content for upload" "$response"

# Test 6: FFmpeg is available
echo "Test 6: FFmpeg is available"
echo -e "${GRAY}curl -s -X POST \"$BASE_URL/execute\" -H \"Content-Type: application/json\" -H \"X-API-Key: $API_KEY\" -H \"X-User: testuser\" -d '{\"command\": \"ffmpeg -version\"}' 2>&1${RESET}"
response=$(curl -s -X POST "$BASE_URL/execute" -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" -H "X-User: testuser" -d '{"command": "ffmpeg -version"}' 2>&1)
test_case "FFmpeg available" "ffmpeg version" "$response"

# Test 7: FFprobe is available
echo "Test 7: FFprobe is available"
echo -e "${GRAY}curl -s -X POST \"$BASE_URL/execute\" -H \"Content-Type: application/json\" -H \"X-API-Key: $API_KEY\" -H \"X-User: testuser\" -d '{\"command\": \"ffprobe -version\"}' 2>&1${RESET}"
response=$(curl -s -X POST "$BASE_URL/execute" -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" -H "X-User: testuser" -d '{"command": "ffprobe -version"}' 2>&1)
test_case "FFprobe available" "ffprobe version" "$response"

# Test 8: User isolation works
echo "Test 8: User isolation works"
echo -e "${GRAY}curl -s -X POST \"$BASE_URL/execute\" -H \"Content-Type: application/json\" -H \"X-API-Key: $API_KEY\" -H \"X-User: anotheruser\" -d '{\"command\": \"ls -la\"}' 2>&1${RESET}"
response=$(curl -s -X POST "$BASE_URL/execute" -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" -H "X-User: anotheruser" -d '{"command": "ls -la"}' 2>&1)
test_case "User isolation" "total 8" "$response"

# Cleanup
rm -f /tmp/test-upload.txt

# Cleanup uploaded files from server
echo -e "${GRAY}curl -s -X POST \"$BASE_URL/execute\" -H \"Content-Type: application/json\" -H \"X-API-Key: $API_KEY\" -H \"X-User: testuser\" -d '{\"command\": \"rm -f test-upload.txt\"}' > /dev/null 2>&1${RESET}"
curl -s -X POST "$BASE_URL/execute" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -H "X-User: testuser" \
    -d '{"command": "rm -f test-upload.txt"}' > /dev/null 2>&1

echo ""
echo "============================================"
echo "Test Summary:"
echo -e "${GREEN}✅ Passed: $PASSED${RESET}"
echo -e "${RED}❌ Failed: $FAILED${RESET}"
echo "Total: $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "💥 Some tests failed!"
    exit 1
fi
