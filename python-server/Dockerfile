FROM python:3.9-slim

WORKDIR /app

# Install required system packages (libgl1 replaces obsolete libgl1-mesa-glx on newer Debian)
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    libev-dev \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (install before COPY to avoid copying venv)
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy app code only (create .dockerignore to exclude venv, .cache)
COPY app.py .
COPY *.pkl .

EXPOSE 5002
CMD ["python", "app.py"]
