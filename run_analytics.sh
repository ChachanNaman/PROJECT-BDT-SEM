#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "[run] Using working dir: $(pwd)"

# Prefer JDK 17 for Spark
if command -v /usr/libexec/java_home >/dev/null 2>&1; then
  if /usr/libexec/java_home -v 17 >/dev/null 2>&1; then
    export JAVA_HOME="$(/usr/libexec/java_home -v 17)"
    export PATH="$JAVA_HOME/bin:$PATH"
    echo "[run] JAVA_HOME set to JDK 17: $JAVA_HOME"
  else
    echo "[run] JDK 17 not found via java_home; using system Java: $(java -version 2>&1 | head -n1)"
  fi
fi

# Python venv (if present)
if [ -f .venv/bin/python ]; then
  echo "[run] Activating venv .venv"
  # shellcheck disable=SC1091
  source .venv/bin/activate
  export PYSPARK_PYTHON="$(pwd)/.venv/bin/python"
  export PYSPARK_DRIVER_PYTHON="$(pwd)/.venv/bin/python"
fi

# Ensure inputs exist
if [ ! -f analytics-in/content.jsonl ] || [ ! -f analytics-in/ratings.jsonl ]; then
  echo "[run] analytics-in/*.jsonl missing; exporting from Mongo first..."
  node scripts/export_for_spark.js
fi

export SPARK_INPUT_DIR="./analytics-in"
export SPARK_OUTPUT_DIR="./analytics-out"

echo "[run] Trying spark-submit..."
if command -v spark-submit >/dev/null 2>&1; then
  set +e
  spark-submit spark_jobs/content_analytics.py
  rc=$?
  set -e
  if [ $rc -ne 0 ]; then
    echo "[run] spark-submit failed (rc=$rc). Falling back to PyPI pyspark via python."
    if ! python -c 'import pyspark' >/dev/null 2>&1; then
      echo "[run] Installing pyspark in current env..."
      python -m pip install --quiet pyspark==3.5.1
    fi
    python spark_jobs/content_analytics.py
  fi
else
  echo "[run] spark-submit not found. Using PyPI pyspark via python."
  if ! python -c 'import pyspark' >/dev/null 2>&1; then
    echo "[run] Installing pyspark in current env..."
    python -m pip install --quiet pyspark==3.5.1
  fi
  python spark_jobs/content_analytics.py
fi

echo "[run] Outputs:"
ls -R analytics-out || true

echo "[run] Done."


