FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libxcb1 \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies from the backend folder
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt

# Copy all backend files into the root of the container
COPY backend/ .

# Expose port 7860 (Required by Hugging Face Spaces)
EXPOSE 7860

CMD ["python", "app.py"]
