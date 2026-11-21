# Multi-stage Dockerfile for AssetTrack FastAPI Backend
FROM python:3.12-slim AS builder

WORKDIR /app

# Install system build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies to wheels cache
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt


# Production runtime stage
FROM python:3.12-slim

WORKDIR /app

# Install runtime libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    libjpeg62-turbo \
    zlib1g \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python wheels from builder stage
COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache /wheels/*

# Copy application source code
COPY . /app

# Create unprivileged application user
RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup --home /home/appuser appuser && \
    mkdir -p /app/media /app/media/qr /app/media/reports && \
    chown -R appuser:appgroup /app

# Set executable permissions on entrypoint script
RUN chmod +x /app/entrypoint.sh

USER appuser

EXPOSE 8000

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
