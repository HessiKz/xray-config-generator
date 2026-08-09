#!/usr/bin/env bash
set -euo pipefail

BASE="${1:-http://127.0.0.1:3000}"
COOKIE_JAR="$(mktemp)"
PASS=0
FAIL=0

ok() { echo "PASS: $1"; PASS=$((PASS+1)); }
bad() { echo "FAIL: $1"; FAIL=$((FAIL+1)); }

echo "=== LIVE E2E against $BASE ==="

code=$(curl -sS -o /tmp/h.json -w "%{http_code}" "$BASE/api/health")
if [[ "$code" == "200" ]] && grep -q '"ok":true' /tmp/h.json; then ok "health"; else bad "health ($code)"; cat /tmp/h.json; fi

code=$(curl -sS -o /tmp/login.json -w "%{http_code}" -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
  -H 'Content-Type: application/json' \
  -d '{"username":"ceo","password":"ceo1234"}' \
  "$BASE/api/auth/login")
if [[ "$code" == "200" ]] && grep -q '"ok":true' /tmp/login.json; then ok "login ceo"; else bad "login ($code)"; cat /tmp/login.json; fi

code=$(curl -sS -o /tmp/me.json -w "%{http_code}" -c "$COOKIE_JAR" -b "$COOKIE_JAR" "$BASE/api/auth/me")
if [[ "$code" == "200" ]] && grep -q 'ceo' /tmp/me.json; then ok "auth/me"; else bad "auth/me ($code)"; cat /tmp/me.json; fi

code=$(curl -sS -o /tmp/dash.json -w "%{http_code}" -c "$COOKIE_JAR" -b "$COOKIE_JAR" "$BASE/api/dashboard")
if [[ "$code" == "200" ]] && grep -q 'slaughterers' /tmp/dash.json; then ok "dashboard"; else bad "dashboard ($code)"; cat /tmp/dash.json; fi

code=$(curl -sS -o /tmp/wh.json -w "%{http_code}" -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
  "$BASE/api/reports/warehouse-daily?day=1405/05/01")
if [[ "$code" == "200" ]] && grep -q 'lines' /tmp/wh.json; then ok "warehouse-daily"; else bad "warehouse-daily ($code)"; fi

code=$(curl -sS -o /tmp/trade.json -w "%{http_code}" -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
  "$BASE/api/trade/daily?day=1405/05/01")
if [[ "$code" == "200" ]] && grep -q 'groups' /tmp/trade.json; then ok "trade-daily"; else bad "trade-daily ($code)"; fi

code=$(curl -sS -o /tmp/people.json -w "%{http_code}" -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
  "$BASE/api/people/slaughterers")
if [[ "$code" == "200" ]] && grep -q 'rows' /tmp/people.json; then ok "slaughterers"; else bad "slaughterers ($code)"; fi

code=$(curl -sS -o /tmp/cold.json -w "%{http_code}" -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
  -H 'Content-Type: application/json' \
  -d '{"storeCode":"18-","productTitle":"E2E کسری","quantity":2,"enteredOn":"1405/05/01","expiresOn":"1405/05/20"}' \
  "$BASE/api/coldroom")
if [[ "$code" == "200" ]] && grep -q 'internal_only' /tmp/cold.json; then ok "coldroom create"; else bad "coldroom create ($code)"; cat /tmp/cold.json; fi
LOT_ID=$(python3 -c 'import json;print(json.load(open("/tmp/cold.json"))["lot"]["id"])' 2>/dev/null || true)

if [[ -n "${LOT_ID:-}" ]]; then
  code=$(curl -sS -o /tmp/coldm.json -w "%{http_code}" -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
    -H 'Content-Type: application/json' \
    -d "{\"id\":\"$LOT_ID\",\"status\":\"matched_in_enekas\",\"matchedRef\":\"e2e\"}" \
    -X PATCH "$BASE/api/coldroom")
  if [[ "$code" == "200" ]] && grep -q 'matched_in_enekas' /tmp/coldm.json; then ok "coldroom match"; else bad "coldroom match ($code)"; fi
fi

code=$(curl -sS -o /tmp/sug.json -w "%{http_code}" -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
  -X POST "$BASE/api/suggestions/generate?day=1405/05/01")
if [[ "$code" == "200" ]] && grep -q 'createdCount' /tmp/sug.json; then ok "suggestions generate"; else bad "suggestions ($code)"; cat /tmp/sug.json; fi

code=$(curl -sS -o /tmp/audit.json -w "%{http_code}" -c "$COOKIE_JAR" -b "$COOKIE_JAR" "$BASE/api/audit")
if [[ "$code" == "200" ]] && grep -q 'items' /tmp/audit.json; then ok "audit"; else bad "audit ($code)"; fi

code=$(curl -sS -o /tmp/loginpage.html -w "%{http_code}" "$BASE/login")
if [[ "$code" == "200" ]]; then ok "login page"; else bad "login page ($code)"; fi

code=$(curl -sS -o /tmp/dashpage.html -w "%{http_code}" -c "$COOKIE_JAR" -b "$COOKIE_JAR" -L "$BASE/dashboard")
if [[ "$code" == "200" ]]; then ok "dashboard page"; else bad "dashboard page ($code)"; fi

echo "=== RESULT $BASE: $PASS passed, $FAIL failed ==="
rm -f "$COOKIE_JAR"
[[ "$FAIL" -eq 0 ]]
