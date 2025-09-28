# Deployment Instructions

This document provides instructions on how to deploy the CutByVoice application.

## 1. Architecture Overview

The application consists of two main components:

1.  **Control Server (Raindrop Platform)**: A service running on the Raindrop platform that handles the natural language processing, API routing, and other control logic.
2.  **File Server (External)**: A dedicated server with `ffmpeg` installed and a file system to store and process your videos.

## 2. Deploying the File Server

The File Server is a simple Flask application that can be deployed using Docker.

### Prerequisites

-   Docker installed on your server.
-   `docker compose` installed on your server.

### Steps

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Hack-a-tons/CutByVoice.git
    cd CutByVoice
    ```

2.  **Configure the environment variables**:
    -   Create a `.env` file in the `file-server` directory with the following content:
        ```
        EXPECTED_API_KEY=<your-secret-api-key>
        ```
    -   Create a `.env` file in the root directory with the following content:
        ```
        FILE_SERVER_PORT=5000
        ```

3.  **Build and run the Docker container**:
    ```bash
    docker compose up --build
    ```

The File Server will be running on the port specified in the `FILE_SERVER_PORT` environment variable.

## 3. Deploying the Control Server

The Control Server is a Raindrop service. To deploy it, you will need to have a Raindrop account and follow the Raindrop deployment process.

### Prerequisites

-   A Raindrop account.
-   The Raindrop CLI installed and configured.

### Steps

1.  **Configure the environment variables**:
    -   Create a `.env` file in the `control-server` directory with the following content:
        ```
        FILE_SERVER_URL=<your-file-server-url>
        FILE_SERVER_API_KEY=<your-secret-api-key>
        ```
    -   Create a `.env` file in the root directory with the following content:
        ```
        AZURE_OPENAI_ENDPOINT=<your-azure-openai-endpoint>
        AZURE_OPENAI_KEY=<your-azure-openai-key>
        AZURE_OPENAI_API_VERSION=<your-azure-openai-api-version>
        AZURE_OPENAI_DEPLOYMENT_NAME=<your-azure-openai-deployment-name>
        AZURE_OPENAI_VISION_DEPLOYMENT_NAME=<your-azure-openai-vision-deployment-name>
        ```

2.  **Deploy the service**:
    ```bash
    raindrop build deploy
    ```

The Control Server will be deployed to the Raindrop platform, and you will get a public URL for the `api-router` service.