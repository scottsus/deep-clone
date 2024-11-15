FROM python:3.10-bullseye

RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app

COPY packages/database packages/database
RUN pip install prisma
RUN prisma generate --schema="/app/packages/database/prisma/schema" --generator py

WORKDIR /app/apps/fastapi
COPY apps/fastapi/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/fastapi .

EXPOSE 8000

CMD ["uvicorn", "app.main:api_router", "--reload", "--host", "0.0.0.0", "--port", "8000"]
