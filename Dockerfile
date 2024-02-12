# Use the official Python image as base
FROM python:latest

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js and npm
RUN apt-get update && apt-get install -y nodejs npm

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

# Ensure that Poetry is in the PATH
ENV PATH="/root/.local/bin:${PATH}"

# Install Python dependencies using Poetry
RUN poetry install

# Expose the port the app runs on
EXPOSE 3000

# Start the Express API
CMD ["node", "index.js"]