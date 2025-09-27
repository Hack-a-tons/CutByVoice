from flask import Flask, request, jsonify
import subprocess
import os
import uuid
from werkzeug.utils import secure_filename
import re

app = Flask(__name__)

# This should be stored securely, e.g., in an environment variable
EXPECTED_API_KEY = "your-api-key" 

def is_safe_path(path, base_dir):
    resolved_base = os.path.realpath(base_dir)
    resolved_path = os.path.realpath(path)
    return os.path.commonpath([resolved_base, resolved_path]) == resolved_base

@app.route('/upload', methods=['POST'])
def upload_file():
    api_key = request.headers.get('X-API-Key')
    if not api_key or api_key != EXPECTED_API_KEY:
        return jsonify({"error": "Unauthorized"}), 401

    user = request.headers.get('X-User')
    if not user or not re.match(r'^[a-zA-Z0-9_-]+$', user):
        return jsonify({"error": "Invalid user identifier"}), 400

    base_dir = os.path.abspath("users")
    user_dir = os.path.join(base_dir, user)

    if not is_safe_path(user_dir, base_dir):
        return jsonify({"error": "Invalid user path"}), 400

    os.makedirs(user_dir, exist_ok=True)

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = secure_filename(file.filename)
        if not filename:
            return jsonify({"error": "Invalid filename"}), 400
        
        save_path = os.path.join(user_dir, filename)
        if not is_safe_path(save_path, user_dir):
            return jsonify({"error": "Invalid file path"}), 400

        file.save(save_path)
        return jsonify({"message": "File uploaded successfully", "filename": filename})

@app.route('/execute', methods=['POST'])
def execute_command_endpoint():
    api_key = request.headers.get('X-API-Key')
    if not api_key or api_key != EXPECTED_API_KEY:
        return jsonify({"error": "Unauthorized"}), 401

    user = request.headers.get('X-User')
    if not user or not re.match(r'^[a-zA-Z0-9_-]+$', user):
        return jsonify({"error": "Invalid user identifier"}), 400

    base_dir = os.path.abspath("users")
    user_dir = os.path.join(base_dir, user)

    if not is_safe_path(user_dir, base_dir):
        return jsonify({"error": "Invalid user path"}), 400

    os.makedirs(user_dir, exist_ok=True)

    data = request.get_json()
    if not data or 'command' not in data:
        return jsonify({"error": "command is required"}), 400

    command = data['command']

    original_cwd = os.getcwd()
    os.chdir(user_dir)

    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        os.chdir(original_cwd)
        return jsonify({"stdout": result.stdout, "stderr": result.stderr})
    except subprocess.CalledProcessError as e:
        os.chdir(original_cwd)
        return jsonify({"error": str(e), "stdout": e.stdout, "stderr": e.stderr}), 500

if __name__ == '__main__':
    app.run(debug=True)