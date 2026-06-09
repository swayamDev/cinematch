FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Download NLTK data at build time
RUN python -c "import nltk; nltk.download('stopwords'); nltk.download('wordnet')"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
