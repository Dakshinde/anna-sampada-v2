FROM python:3.12-slim

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose the port Render uses
EXPOSE 10000

# Start the app with gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:10000", "app:app"]