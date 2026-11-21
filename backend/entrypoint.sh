#!/bin/bash
set -e

echo "Starting AssetTrack Backend Services..."

# Run Alembic Database Migrations
echo "Applying database schema migrations..."
alembic upgrade head

# Run Idempotent Seed Data Script
echo "Checking seed data..."
python -m app.seed

echo "AssetTrack Database Ready."

# Execute CMD passed to container (e.g. uvicorn)
exec "$@"
