#!/usr/bin/env bash

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

PORT=${PORT:-5000}
API_KEY=${EXPECTED_API_KEY:-"your-api-key"}
BASE_URL="http://localhost:$PORT"

PASSED=0
FAILED=0

test_case() {
    local name="$1"
    local expected="$2"
    local actual="$3"
    
    if [[ "$actual" == *"$expected"* ]]; then
        echo "✅ $name"
        ((PASSED++))
    else
        echo "❌ $name"
        echo "   Expected: $expected"
        echo "   Actual: $actual"
        ((FAILED++))
    fi
}

echo "Testing CutByVoice File Server on $BASE_URL"
echo "============================================"

# Test 1: Root endpoint should return 404
echo "Test 1: Root endpoint returns 404"
response=$(curl -s "$BASE_URL" 2>&1)
test_case "Root 404" "404 Not Found" "$response"

# Test 2: Execute without auth should return 401
echo "Test 2: Execute without auth returns 401"
response=$(curl -s -X POST "$BASE_URL/execute" -H "Content-Type: application/json" -d '{"command": "ls"}' 2>&1)
test_case "Auth required" "Unauthorized" "$response"

# Test 3: Execute with auth should work
echo "Test 3: Execute with auth works"
response=$(curl -s -X POST "$BASE_URL/execute" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -H "X-User: testuser" \
    -d '{"command": "ls -la"}' 2>&1)
test_case "Execute command" "stdout" "$response"

# Test 4: Create test file and upload
echo "Test 4: File upload works"
echo "test content for upload" > /tmp/test-upload.txt
response=$(curl -s -X POST "$BASE_URL/upload" \
    -H "X-API-Key: $API_KEY" \
    -H "X-User: testuser" \
    -F "file=@/tmp/test-upload.txt" 2>&1)
test_case "File upload" "File uploaded successfully" "$response"

# Test 5: Verify uploaded file exists
echo "Test 5: Uploaded file exists"
response=$(curl -s -X POST "$BASE_URL/execute" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -H "X-User: testuser" \
    -d '{"command": "cat test-upload.txt"}' 2>&1)
test_case "File content" "test content for upload" "$response"

# Test 6: FFmpeg is available
echo "Test 6: FFmpeg is available"
response=$(curl -s -X POST "$BASE_URL/execute" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -H "X-User: testuser" \
    -d '{"command": "ffmpeg -version"}' 2>&1)
test_case "FFmpeg available" "ffmpeg version" "$response"

# Test 7: FFprobe is available
echo "Test 7: FFprobe is available"
response=$(curl -s -X POST "$BASE_URL/execute" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -H "X-User: testuser" \
    -d '{"command": "ffprobe -version"}' 2>&1)
test_case "FFprobe available" "ffprobe version" "$response"

# Test 8: User isolation works
echo "Test 8: User isolation works"
response=$(curl -s -X POST "$BASE_URL/execute" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -H "X-User: anotheruser" \
    -d '{"command": "ls -la"}' 2>&1)
test_case "User isolation" "total 8" "$response"

# Cleanup
rm -f /tmp/test-upload.txt

# Cleanup uploaded files from server
curl -s -X POST "$BASE_URL/execute" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -H "X-User: testuser" \
    -d '{"command": "rm -f test-upload.txt"}' > /dev/null 2>&1

echo ""
echo "============================================"
echo "Test Summary:"
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo "Total: $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "💥 Some tests failed!"
    exit 1
fi
