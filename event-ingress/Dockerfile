FROM astral/uv:python3.14-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
	build-essential \
	python3-dev \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project

# Install source
COPY  . .
RUN uv sync --frozen

COPY main.py .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
