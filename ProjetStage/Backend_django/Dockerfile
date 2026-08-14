FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
	build-essential \
	gcc \
	libpq-dev \
	curl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps
COPY requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip setuptools wheel && \
	pip install --no-cache-dir -r /app/requirements.txt

# Copy project
COPY . /app

ENV PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8000/ || exit 1

CMD ["gunicorn", "Backend_django.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
