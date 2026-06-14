#!/bin/bash
set -e

echo "=== Building SimpleTunning Platform ==="

# Build C++ engine
echo "[1/3] Building C++ engine..."
cd "$(dirname "$0")/../engine"
mkdir -p build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build . -j$(nproc)

# Build frontend
echo "[2/3] Building frontend..."
cd "$(dirname "$0")/../frontend"
npm ci
npm run build

# Collect backend deps
echo "[3/3] Installing Python dependencies..."
cd "$(dirname "$0")/../backend"
pip install -r requirements.txt

echo "=== Build Complete ==="
