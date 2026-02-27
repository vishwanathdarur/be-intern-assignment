#!/usr/bin/env bash
set -u

BASE="http://localhost:3000"
USERS_URL="$BASE/api/users"
POSTS_URL="$BASE/api/posts"
FOLLOWS_URL="$BASE/api/follows"
LIKES_URL="$BASE/api/likes"
HASHTAG_URL="$BASE/api/posts/hashtag"
FEED_URL="$BASE/api/feed"
ACTIVITY_URL="$BASE/api/users"

RETRIES=30
SLEEP=1

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m'

TOTAL=0
PASSED=0
FAILED=0
TMP="/tmp/test_resp_$$.json"

log() { echo -e "$@"; }
section() { echo -e "\n${GREEN}== $1 ==${NC}"; }
err() { echo -e "${RED}ERROR:${NC} $1"; FAILED=$((FAILED+1)); }

# HTTP wrapper
request() {
    local method=$1 url=$2 data="${3-}"
    TOTAL=$((TOTAL+1))

    echo -e "\n${YELLOW}${method} $url${NC}"
    [ -n "$data" ] && echo "Payload: $data"

    if [ "$method" = "GET" ]; then
        code=$(curl -s -S -w "%{http_code}" -o "$TMP" "$url")
    else
        code=$(curl -s -S -w "%{http_code}" -o "$TMP" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi

    echo "HTTP $code"
    jq . "$TMP" 2>/dev/null || cat "$TMP"

    if [ "$code" -ge 400 ]; then
        err "${method} $url failed"
    else
        PASSED=$((PASSED+1))
    fi
}

# Start server if not running
start_server() {
    echo "Checking server..."
    if curl -s "$BASE" >/dev/null 2>&1; then
        echo "Server already running."
        SERVER_PID=""
        return
    fi

    echo "Starting server..."
    npm run dev > server.log 2>&1 &
    SERVER_PID=$!

    n=0
    while [ $n -lt $RETRIES ]; do
        if curl -s "$BASE" >/dev/null 2>&1; then
            echo "Server is ready."
            return
        fi
        sleep $SLEEP
        n=$((n+1))
    done

    err "Server did not start."
}

stop_server() {
    if [ -n "${SERVER_PID-}" ] && ps -p "$SERVER_PID" >/dev/null 2>&1; then
        echo "Stopping server..."
        kill $SERVER_PID 2>/dev/null || true
        sleep 1
    fi
}

### RUN TESTS ###

start_server

NOW=$(date +%s)
U1="user1+$NOW@example.com"
U2="user2+$NOW@example.com"
U3="user3+$NOW@example.com"

section "CREATE 3 USERS"
request POST "$USERS_URL" "{\"firstName\":\"U1\",\"lastName\":\"Test\",\"email\":\"$U1\"}"
USER1=$(jq -r '.id' "$TMP")
request POST "$USERS_URL" "{\"firstName\":\"U2\",\"lastName\":\"Test\",\"email\":\"$U2\"}"
USER2=$(jq -r '.id' "$TMP")
request POST "$USERS_URL" "{\"firstName\":\"U3\",\"lastName\":\"Test\",\"email\":\"$U3\"}"
USER3=$(jq -r '.id' "$TMP")

section "UPDATE USER1"
request PUT "$USERS_URL/$USER1" "{\"firstName\":\"UpdatedName\"}"

section "CREATE POSTS"
request POST "$POSTS_URL" "{\"authorId\":$USER2,\"content\":\"Post by U2 #fun #test\"}"
POST1=$(jq -r '.id' "$TMP")

request POST "$POSTS_URL" "{\"authorId\":$USER3,\"content\":\"Second post #Test #other\"}"
POST2=$(jq -r '.id' "$TMP")

section "FOLLOW user2"
request POST "$FOLLOWS_URL/$USER2/follow" "{\"followerId\":$USER1}"

section "LIKE POST1"
request POST "$LIKES_URL/$POST1/like" "{\"userId\":$USER1}"

section "HASHTAG SEARCH"
request GET "$HASHTAG_URL/1?limit=10&offset=0"

section "FEED FOR USER1"
request GET "$FEED_URL?userId=$USER1&limit=10&offset=0"

section "USER ACTIVITY FOR USER1"
request GET "$USERS_URL/$USER1/activity?limit=10&offset=0"

section "UNLIKE POST1"
request DELETE "$LIKES_URL/$POST1/like" "{\"userId\":$USER1}"

section "UNFOLLOW USER2"
request DELETE "$FOLLOWS_URL/$USER2/follow" "{\"followerId\":$USER1}"

sqlite3 database.sqlite "DELETE FROM activities WHERE actorId IN ($USER1,$USER2,$USER3);" || true

sqlite3 database.sqlite "DELETE FROM likes WHERE userId IN ($USER1,$USER2,$USER3);" || true

sqlite3 database.sqlite "DELETE FROM follows WHERE followerId IN ($USER1,$USER2,$USER3);" || true


sqlite3 database.sqlite "DELETE FROM posts WHERE id IN ($POST1,$POST2);" || true

sqlite3 database.sqlite "DELETE FROM users WHERE id IN ($USER1,$USER2,$USER3);" || true

### SUMMARY ###
section "SUMMARY"
echo "TOTAL TESTS: $TOTAL"
echo "PASSED: $PASSED"
echo "FAILED: $FAILED"

rm -f "$TMP"
stop_server

exit $FAILED