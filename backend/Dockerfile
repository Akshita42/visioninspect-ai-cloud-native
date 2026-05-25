FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt

RUN pip install --no-cache-dir \
    torch==2.3.1+cpu \
    torchvision==0.18.1+cpu \
    torchaudio==2.3.1+cpu \
    --index-url https://download.pytorch.org/whl/cpu

COPY . .

EXPOSE 8000

CMD ["python", "app.py"]