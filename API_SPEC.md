# API and Control Server Technical Specification

This document outlines the technical specification for the API and control server of the CutByVoice application.

## 1. Architecture Overview

The server-based architecture will consist of two main components:

1.  **Control Server (Raindrop Platform)**: A service running on the Raindrop platform that will handle the natural language processing, API routing, and other control logic.
2.  **File Server (External)**: A dedicated server with `ffmpeg` installed and a file system to store and process your videos.

## 2. Control Server (Raindrop Platform)

### 2.1. API Endpoints

The `api-router` service on the Raindrop platform will expose the following endpoints:

-   `POST /command`: Executes a natural language command.
    -   **Request:**
        ```json
        {
            "command": "Your natural language command here",
            "user": "your_username"
        }
        ```
    -   **Response:**
        ```json
        {
            "output": "The output of the command"
        }
        ```

-   `POST /add-file`: Adds a file to the user's workspace.
    -   **Request:** `multipart/form-data` with a `file` field containing the video file, or a JSON body with a `url` field containing a pre-signed URL.
        -   **Multipart Example:**
            ```
            Content-Type: multipart/form-data; boundary=...
            
            --...
            Content-Disposition: form-data; name="file"; filename="video.mp4"
            Content-Type: video/mp4
            
            ...
            ```
        -   **URL Example:**
            ```json
            {
                "url": "https://your-s3-bucket.s3.amazonaws.com/video.mp4?AWSAccessKeyId=...",
                "user": "your_username"
            }
            ```
    -   **Security:**
        -   Server-side reads of arbitrary filesystem paths are forbidden. Any request containing a local file path will be rejected with a `400 Bad Request` error.
        -   **URL Validation:**
            -   A per-user allowlist of permitted storage hosts/domains will be enforced.
            -   URLs resolving to or containing RFC1918/private ranges, loopback, link-local, multicast, or known cloud metadata endpoints will be rejected.
            -   **DNS Rebinding Protection:**
                -   When a URL is provided, the server must resolve the hostname to an IP address.
                -   The server must check if the resolved IP address is in a disallowed range.
                -   The server must perform this check twice, with a delay in between, to see if the IP address changes. If it changes to a disallowed IP, the request must be rejected.
                -   The server should cache the DNS resolution result for a short period to prevent excessive DNS queries.
                -   The server must use the resolved and validated IP address to make the actual request, not the original hostname.
            -   IP-literal hosts are disallowed unless explicitly allowlisted.
            -   HTTPS with standard certificate and hostname validation is required.
            -   Redirects to non-allowlisted hosts are forbidden.
        -   **Pre-signed URL Validation:**
            -   Pre-signed URLs must be time-limited and scoped to the user's workspace.
            -   For `s3` and `gs` URLs, the bucket/host will be validated to belong to the user's workspace.
        -   Content-type and file-size validation will be performed.
        -   Authentication and authorization checks will be performed to ensure the user owns the target workspace.
        -   Rejected path-read attempts will be logged and alerted.
    -   **Response:**
        ```json
        {
            "message": "File added successfully"
        }
        ```

### 2.2. Authentication

...

## 3. File Server (External)

### 3.1. API Endpoints

The external file server will expose the following endpoints:

-   `POST /execute`: Executes a shell command.
    -   **Request:**
        ```json
        {
            "command": "The shell command to execute"
        }
        ```
    -   **Response:**
        ```json
        {
            "stdout": "The standard output of the command",
            "stderr": "The standard error of the command"
        }
        ```

-   `POST /upload`: Uploads a file.
    -   **Request:** `multipart/form-data` with a `file` field containing the video file.
    -   **Response:**
        ```json
        {
            "message": "File uploaded successfully",
            "filename": "The name of the uploaded file"
        }
        ```

## 4. Data Flow

The data flow will be as follows:

1.  **Adding a file**:
    1.  **Option A: Direct Upload**:
        1.  The client sends a `POST` request with the file as `multipart/form-data` to the `/add-file` endpoint on the Control Server (Raindrop).
        2.  The Control Server then sends a `POST` request with the file to the `/upload` endpoint on the File Server.
        3.  The File Server saves the file to the user's workspace.
    2.  **Option B: Pre-signed URL**:
        1.  The client obtains a pre-signed URL for uploading the file to a cloud storage service (e.g., S3, GCS).
        2.  The client uploads the file directly to the cloud storage service.
        3.  The client sends a `POST` request with the URL of the uploaded file to the `/add-file` endpoint on the Control Server (Raindrop).
        4.  The Control Server validates the URL and instructs the File Server to download the file from the cloud storage service.
        5.  The File Server downloads the file and saves it to the user's workspace.
2.  **Executing a command**:
    1.  The client sends a `POST` request to the `/command` endpoint on the Control Server (Raindrop).
    2.  The Control Server uses the AI model to convert the natural language command to a shell command.
    3.  The Control Server sends a `POST` request with the shell command to the `/execute` endpoint on the File Server.
    4.  The File Server executes the command in the user's workspace.
    5.  The File Server returns the output of the command to the Control Server.
    6.  The Control Server returns the output to the client.

## 5. Authentication and Authorization

### 5.1. Client to Control Server Authentication

A simple API key authentication will be used to secure the communication between the client and the Control Server.

-   Clients will be required to include an API key in the `Authorization` header of all requests to the Control Server.
-   The API key will be a bearer token.
-   **Example Request Header:**
    ```
    Authorization: Bearer <your-api-key>
    ```
-   **Security Requirements:**
    -   All communication must be over TLS.
    -   API keys will be stored securely (e.g., hashed in a database).
    -   A policy for key rotation and revocation will be implemented.
    -   Logging and rate-limiting will be implemented to prevent abuse.

### 5.2. Control Server to File Server Authentication

A simple API key authentication will be used to secure the communication between the Control Server and the File Server.

-   The File Server will require an `X-API-Key` header in all incoming requests.
-   The Control Server will include the API key in all its requests to the File Server.
-   The API key will be stored as a secret on the Raindrop platform.

### 5.3. Authorization

The Control Server will be responsible for authorization.

1.  The Control Server will validate the client's API key.
2.  It will map the API key to a user identity.
3.  It will then pass the validated user identifier to the File Server.
4.  The File Server will use the user identifier to determine the correct workspace for the user and ensure that the user can only access their own files.