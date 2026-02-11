#!/usr/bin/env bash
# ============================================================================
# ATUM CREA -- Quality Gate Script
# ============================================================================
#
# Runs all quality checks in sequence and prints a pass/fail summary.
# Designed to work in Git Bash on Windows, macOS, and Linux.
#
# Usage:
#   bash scripts/quality-gate.sh           # Run all checks
#   bash scripts/quality-gate.sh --quick   # Skip E2E and bundle analysis
#   bash scripts/quality-gate.sh --ci      # CI mode (strict, no interactive)
#
# Add to package.json scripts:
#   "quality-gate": "bash scripts/quality-gate.sh",
#   "quality-gate:quick": "bash scripts/quality-gate.sh --quick",
#   "quality-gate:ci": "bash scripts/quality-gate.sh --ci"
#
# ============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Color helpers (works in Git Bash / MINGW / Linux / macOS)
# ---------------------------------------------------------------------------
if [[ -t 1 ]] && command -v tput &>/dev/null && [[ $(tput colors 2>/dev/null || echo 0) -ge 8 ]]; then
  RED=$(tput setaf 1)
  GREEN=$(tput setaf 2)
  YELLOW=$(tput setaf 3)
  CYAN=$(tput setaf 6)
  BOLD=$(tput bold)
  DIM=$(tput dim)
  RESET=$(tput sgr0)
else
  RED=''
  GREEN=''
  YELLOW=''
  CYAN=''
  BOLD=''
  DIM=''
  RESET=''
fi

# ---------------------------------------------------------------------------
# Resolve project root (parent of scripts/)
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# ---------------------------------------------------------------------------
# Parse arguments
# ---------------------------------------------------------------------------
QUICK_MODE=false
CI_MODE=false

for arg in "$@"; do
  case "$arg" in
    --quick) QUICK_MODE=true ;;
    --ci)    CI_MODE=true ;;
    --help|-h)
      echo "Usage: bash scripts/quality-gate.sh [--quick] [--ci]"
      echo "  --quick   Skip E2E tests and bundle analysis"
      echo "  --ci      CI mode (strict failures, no interactive prompts)"
      exit 0
      ;;
    *)
      echo "${RED}Unknown argument: $arg${RESET}"
      exit 1
      ;;
  esac
done

# ---------------------------------------------------------------------------
# State tracking
# ---------------------------------------------------------------------------
declare -a STEP_NAMES=()
declare -a STEP_RESULTS=()     # "pass" | "fail" | "skip" | "warn"
declare -a STEP_DURATIONS=()
CRITICAL_FAILURE=false
TOTAL_START=$(date +%s)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
step_header() {
  local step_num="$1"
  local step_name="$2"
  echo ""
  echo "${BOLD}${CYAN}[$step_num] $step_name${RESET}"
  echo "${DIM}$(printf '%.0s-' {1..60})${RESET}"
}

record_result() {
  local name="$1"
  local result="$2"      # pass | fail | skip | warn
  local duration="$3"    # seconds
  STEP_NAMES+=("$name")
  STEP_RESULTS+=("$result")
  STEP_DURATIONS+=("$duration")
}

format_duration() {
  local secs="$1"
  if (( secs >= 60 )); then
    printf "%dm %ds" $((secs / 60)) $((secs % 60))
  else
    printf "%ds" "$secs"
  fi
}

# ---------------------------------------------------------------------------
# Check node_modules exist
# ---------------------------------------------------------------------------
if [[ ! -d "$PROJECT_ROOT/node_modules" ]]; then
  echo "${RED}${BOLD}ERROR:${RESET} node_modules not found. Run 'npm install --force' first."
  exit 1
fi

echo ""
echo "${BOLD}${CYAN}============================================================${RESET}"
echo "${BOLD}${CYAN}  ATUM CREA -- Quality Gate${RESET}"
echo "${BOLD}${CYAN}============================================================${RESET}"
echo "${DIM}  Project:  $(node -p "require('./package.json').name") v$(node -p "require('./package.json').version")${RESET}"
echo "${DIM}  Mode:     $(if $QUICK_MODE; then echo 'Quick'; elif $CI_MODE; then echo 'CI'; else echo 'Full'; fi)${RESET}"
echo "${DIM}  Started:  $(date '+%Y-%m-%d %H:%M:%S')${RESET}"
echo "${BOLD}${CYAN}============================================================${RESET}"


# ===========================
# STEP 1: TypeScript Check (CRITICAL)
# ===========================
step_header "1/7" "TypeScript Type Check"
STEP_START=$(date +%s)

# The project uses composite tsconfigs: tsconfig.node.json (main+preload) and tsconfig.web.json (renderer).
# The root tsconfig.json uses "references" so we check both sub-projects.
TSC_EXIT=0
echo "${DIM}  Checking tsconfig.node.json (main + preload)...${RESET}"
if npx tsc --noEmit -p tsconfig.node.json 2>&1; then
  echo "  ${GREEN}tsconfig.node.json passed${RESET}"
else
  TSC_EXIT=1
fi

echo "${DIM}  Checking tsconfig.web.json (renderer)...${RESET}"
if npx tsc --noEmit -p tsconfig.web.json 2>&1; then
  echo "  ${GREEN}tsconfig.web.json passed${RESET}"
else
  TSC_EXIT=1
fi

STEP_END=$(date +%s)
STEP_DURATION=$((STEP_END - STEP_START))

if [[ $TSC_EXIT -eq 0 ]]; then
  echo "${GREEN}${BOLD}  PASS${RESET} -- TypeScript type check ($(format_duration $STEP_DURATION))"
  record_result "TypeScript Check" "pass" "$STEP_DURATION"
else
  echo "${RED}${BOLD}  FAIL${RESET} -- TypeScript type check ($(format_duration $STEP_DURATION))"
  record_result "TypeScript Check" "fail" "$STEP_DURATION"
  CRITICAL_FAILURE=true
fi


# ===========================
# STEP 2: ESLint (NON-CRITICAL)
# ===========================
step_header "2/7" "ESLint"
STEP_START=$(date +%s)

# Check if ESLint is available and configured at the project level
ESLINT_CONFIG_FOUND=false
for cfg in .eslintrc .eslintrc.js .eslintrc.cjs .eslintrc.json .eslintrc.yml .eslintrc.yaml eslint.config.js eslint.config.mjs eslint.config.cjs eslint.config.ts; do
  if [[ -f "$PROJECT_ROOT/$cfg" ]]; then
    ESLINT_CONFIG_FOUND=true
    break
  fi
done

# Also check package.json for eslintConfig field
if [[ "$ESLINT_CONFIG_FOUND" = false ]]; then
  if node -e "const p = require('./package.json'); process.exit(p.eslintConfig ? 0 : 1)" 2>/dev/null; then
    ESLINT_CONFIG_FOUND=true
  fi
fi

STEP_END=$(date +%s)
STEP_DURATION=$((STEP_END - STEP_START))

if [[ "$ESLINT_CONFIG_FOUND" = true ]]; then
  if npx eslint src/ --ext .ts,.tsx --max-warnings 0 2>&1; then
    echo "${GREEN}${BOLD}  PASS${RESET} -- ESLint ($(format_duration $STEP_DURATION))"
    record_result "ESLint" "pass" "$STEP_DURATION"
  else
    STEP_END=$(date +%s)
    STEP_DURATION=$((STEP_END - STEP_START))
    echo "${YELLOW}${BOLD}  WARN${RESET} -- ESLint found issues ($(format_duration $STEP_DURATION))"
    record_result "ESLint" "warn" "$STEP_DURATION"
  fi
else
  echo "${YELLOW}  No ESLint configuration found at project root. Skipping.${RESET}"
  echo "${DIM}  To enable: npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin${RESET}"
  echo "${DIM}  Then create eslint.config.js at the project root.${RESET}"
  record_result "ESLint" "skip" "$STEP_DURATION"
fi


# ===========================
# STEP 3: Vitest Unit Tests (CRITICAL)
# ===========================
step_header "3/7" "Vitest Unit Tests"
STEP_START=$(date +%s)

VITEST_EXIT=0
if [[ -f "$PROJECT_ROOT/tests/vitest.config.ts" ]]; then
  if npx vitest run --config tests/vitest.config.ts 2>&1; then
    echo "${GREEN}${BOLD}  PASS${RESET} -- Unit tests"
  else
    VITEST_EXIT=$?
    echo "${RED}${BOLD}  FAIL${RESET} -- Unit tests"
  fi
else
  echo "${YELLOW}  No vitest config found. Skipping.${RESET}"
  VITEST_EXIT=-1
fi

STEP_END=$(date +%s)
STEP_DURATION=$((STEP_END - STEP_START))

if [[ $VITEST_EXIT -eq 0 ]]; then
  record_result "Vitest Unit Tests" "pass" "$STEP_DURATION"
elif [[ $VITEST_EXIT -eq -1 ]]; then
  record_result "Vitest Unit Tests" "skip" "$STEP_DURATION"
else
  record_result "Vitest Unit Tests" "fail" "$STEP_DURATION"
  CRITICAL_FAILURE=true
fi


# ===========================
# STEP 4: Playwright E2E Tests (NON-CRITICAL, skippable)
# ===========================
step_header "4/7" "Playwright E2E Tests"
STEP_START=$(date +%s)

if $QUICK_MODE; then
  echo "${YELLOW}  Skipped (--quick mode)${RESET}"
  STEP_END=$(date +%s)
  STEP_DURATION=$((STEP_END - STEP_START))
  record_result "Playwright E2E" "skip" "$STEP_DURATION"
elif [[ ! -f "$PROJECT_ROOT/tests/playwright.config.ts" ]]; then
  echo "${YELLOW}  No playwright config found. Skipping.${RESET}"
  STEP_END=$(date +%s)
  STEP_DURATION=$((STEP_END - STEP_START))
  record_result "Playwright E2E" "skip" "$STEP_DURATION"
else
  # Check if a built app exists (Playwright E2E tests need a built Electron binary)
  APP_EXISTS=false
  if [[ -d "$PROJECT_ROOT/dist" ]]; then
    APP_EXISTS=true
  fi

  if [[ "$APP_EXISTS" = false ]]; then
    echo "${YELLOW}  No built app found in dist/. Run 'npm run build:win' first for E2E tests.${RESET}"
    STEP_END=$(date +%s)
    STEP_DURATION=$((STEP_END - STEP_START))
    record_result "Playwright E2E" "skip" "$STEP_DURATION"
  else
    PW_EXIT=0
    if npx playwright test --config tests/playwright.config.ts 2>&1; then
      echo "${GREEN}${BOLD}  PASS${RESET} -- E2E tests"
    else
      PW_EXIT=$?
      echo "${YELLOW}${BOLD}  WARN${RESET} -- E2E tests had failures"
    fi

    STEP_END=$(date +%s)
    STEP_DURATION=$((STEP_END - STEP_START))

    if [[ $PW_EXIT -eq 0 ]]; then
      record_result "Playwright E2E" "pass" "$STEP_DURATION"
    else
      # E2E failures are warnings, not critical blockers
      record_result "Playwright E2E" "warn" "$STEP_DURATION"
    fi
  fi
fi


# ===========================
# STEP 5: Coverage Report (INFORMATIONAL)
# ===========================
step_header "5/7" "Coverage Report"
STEP_START=$(date +%s)

COVERAGE_EXIT=0
if [[ -f "$PROJECT_ROOT/tests/vitest.config.ts" ]]; then
  echo "${DIM}  Running vitest with V8 coverage provider...${RESET}"
  if npx vitest run --config tests/vitest.config.ts --coverage 2>&1; then
    echo "${GREEN}${BOLD}  PASS${RESET} -- Coverage report generated"
  else
    COVERAGE_EXIT=$?
    echo "${YELLOW}${BOLD}  WARN${RESET} -- Coverage run completed with issues"
  fi
else
  echo "${YELLOW}  No vitest config found. Skipping coverage.${RESET}"
  COVERAGE_EXIT=-1
fi

STEP_END=$(date +%s)
STEP_DURATION=$((STEP_END - STEP_START))

if [[ $COVERAGE_EXIT -eq 0 ]]; then
  record_result "Coverage Report" "pass" "$STEP_DURATION"
elif [[ $COVERAGE_EXIT -eq -1 ]]; then
  record_result "Coverage Report" "skip" "$STEP_DURATION"
else
  record_result "Coverage Report" "warn" "$STEP_DURATION"
fi


# ===========================
# STEP 6: Build Check (CRITICAL)
# ===========================
step_header "6/7" "Build Check (electron-vite)"
STEP_START=$(date +%s)

BUILD_EXIT=0
echo "${DIM}  Running electron-vite build...${RESET}"
if npx electron-vite build 2>&1; then
  echo "${GREEN}${BOLD}  PASS${RESET} -- Build succeeded"
else
  BUILD_EXIT=$?
  echo "${RED}${BOLD}  FAIL${RESET} -- Build failed"
fi

STEP_END=$(date +%s)
STEP_DURATION=$((STEP_END - STEP_START))

if [[ $BUILD_EXIT -eq 0 ]]; then
  record_result "Build Check" "pass" "$STEP_DURATION"
else
  record_result "Build Check" "fail" "$STEP_DURATION"
  CRITICAL_FAILURE=true
fi


# ===========================
# STEP 7: Bundle Analysis (INFORMATIONAL, skippable)
# ===========================
step_header "7/7" "Bundle Size Analysis"
STEP_START=$(date +%s)

if $QUICK_MODE; then
  echo "${YELLOW}  Skipped (--quick mode)${RESET}"
  STEP_END=$(date +%s)
  STEP_DURATION=$((STEP_END - STEP_START))
  record_result "Bundle Analysis" "skip" "$STEP_DURATION"
else
  # Check if out/ directory exists from the build step
  if [[ -d "$PROJECT_ROOT/out" ]]; then
    echo "${DIM}  Analyzing bundle sizes in out/...${RESET}"
    echo ""

    # Main process bundle
    if [[ -f "$PROJECT_ROOT/out/main/index.mjs" ]]; then
      MAIN_SIZE=$(wc -c < "$PROJECT_ROOT/out/main/index.mjs" 2>/dev/null || echo "0")
      MAIN_SIZE_KB=$((MAIN_SIZE / 1024))
      echo "  ${CYAN}Main process:${RESET}    ${BOLD}${MAIN_SIZE_KB} KB${RESET}  (out/main/index.mjs)"
    fi

    # Preload bundle
    if [[ -f "$PROJECT_ROOT/out/preload/index.mjs" ]]; then
      PRELOAD_SIZE=$(wc -c < "$PROJECT_ROOT/out/preload/index.mjs" 2>/dev/null || echo "0")
      PRELOAD_SIZE_KB=$((PRELOAD_SIZE / 1024))
      echo "  ${CYAN}Preload:${RESET}         ${BOLD}${PRELOAD_SIZE_KB} KB${RESET}  (out/preload/index.mjs)"
    fi

    # Renderer bundles (all JS files in out/renderer/)
    if [[ -d "$PROJECT_ROOT/out/renderer" ]]; then
      RENDERER_TOTAL=0
      RENDERER_JS_COUNT=0
      while IFS= read -r -d '' file; do
        FILE_SIZE=$(wc -c < "$file" 2>/dev/null || echo "0")
        RENDERER_TOTAL=$((RENDERER_TOTAL + FILE_SIZE))
        RENDERER_JS_COUNT=$((RENDERER_JS_COUNT + 1))
      done < <(find "$PROJECT_ROOT/out/renderer" -name "*.js" -print0 2>/dev/null)

      RENDERER_TOTAL_KB=$((RENDERER_TOTAL / 1024))
      echo "  ${CYAN}Renderer JS:${RESET}     ${BOLD}${RENDERER_TOTAL_KB} KB${RESET}  ($RENDERER_JS_COUNT files)"

      # CSS files
      CSS_TOTAL=0
      CSS_COUNT=0
      while IFS= read -r -d '' file; do
        FILE_SIZE=$(wc -c < "$file" 2>/dev/null || echo "0")
        CSS_TOTAL=$((CSS_TOTAL + FILE_SIZE))
        CSS_COUNT=$((CSS_COUNT + 1))
      done < <(find "$PROJECT_ROOT/out/renderer" -name "*.css" -print0 2>/dev/null)

      CSS_TOTAL_KB=$((CSS_TOTAL / 1024))
      echo "  ${CYAN}Renderer CSS:${RESET}    ${BOLD}${CSS_TOTAL_KB} KB${RESET}  ($CSS_COUNT files)"
    fi

    # Total out/ size
    TOTAL_OUT=$(find "$PROJECT_ROOT/out" -type f -print0 2>/dev/null | xargs -0 wc -c 2>/dev/null | tail -1 | awk '{print $1}')
    TOTAL_OUT_KB=$((TOTAL_OUT / 1024))
    TOTAL_OUT_MB=$((TOTAL_OUT / 1048576))
    echo ""
    echo "  ${BOLD}Total output:    ${TOTAL_OUT_MB} MB${RESET} (${TOTAL_OUT_KB} KB)"

    # Warn if bundle is very large
    if (( TOTAL_OUT_MB > 50 )); then
      echo "  ${YELLOW}WARNING: Total output exceeds 50 MB. Consider reviewing dependencies.${RESET}"
    fi

    STEP_END=$(date +%s)
    STEP_DURATION=$((STEP_END - STEP_START))
    record_result "Bundle Analysis" "pass" "$STEP_DURATION"
  else
    echo "${YELLOW}  No out/ directory found. Build may have failed. Skipping.${RESET}"
    STEP_END=$(date +%s)
    STEP_DURATION=$((STEP_END - STEP_START))
    record_result "Bundle Analysis" "skip" "$STEP_DURATION"
  fi
fi


# ===========================
# SUMMARY
# ===========================
TOTAL_END=$(date +%s)
TOTAL_DURATION=$((TOTAL_END - TOTAL_START))

echo ""
echo ""
echo "${BOLD}${CYAN}============================================================${RESET}"
echo "${BOLD}${CYAN}  QUALITY GATE SUMMARY${RESET}"
echo "${BOLD}${CYAN}============================================================${RESET}"
echo ""

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0
SKIP_COUNT=0

for i in "${!STEP_NAMES[@]}"; do
  name="${STEP_NAMES[$i]}"
  result="${STEP_RESULTS[$i]}"
  duration="${STEP_DURATIONS[$i]}"

  case "$result" in
    pass)
      icon="${GREEN}PASS${RESET}"
      PASS_COUNT=$((PASS_COUNT + 1))
      ;;
    fail)
      icon="${RED}FAIL${RESET}"
      FAIL_COUNT=$((FAIL_COUNT + 1))
      ;;
    warn)
      icon="${YELLOW}WARN${RESET}"
      WARN_COUNT=$((WARN_COUNT + 1))
      ;;
    skip)
      icon="${DIM}SKIP${RESET}"
      SKIP_COUNT=$((SKIP_COUNT + 1))
      ;;
  esac

  printf "  %-4s  %-25s  %s\n" "$icon" "$name" "${DIM}$(format_duration "$duration")${RESET}"
done

echo ""
echo "${DIM}$(printf '%.0s-' {1..60})${RESET}"
echo "  ${GREEN}Passed: $PASS_COUNT${RESET}  ${RED}Failed: $FAIL_COUNT${RESET}  ${YELLOW}Warnings: $WARN_COUNT${RESET}  ${DIM}Skipped: $SKIP_COUNT${RESET}"
echo "  ${DIM}Total time: $(format_duration $TOTAL_DURATION)${RESET}"
echo ""

if $CRITICAL_FAILURE; then
  echo "${RED}${BOLD}  QUALITY GATE FAILED${RESET}"
  echo "${RED}  One or more critical checks did not pass (TypeScript, Unit Tests, or Build).${RESET}"
  echo ""
  exit 1
else
  if [[ $WARN_COUNT -gt 0 ]]; then
    echo "${GREEN}${BOLD}  QUALITY GATE PASSED${RESET} ${YELLOW}(with $WARN_COUNT warning(s))${RESET}"
  else
    echo "${GREEN}${BOLD}  QUALITY GATE PASSED${RESET}"
  fi
  echo ""
  exit 0
fi
