import argparse
import subprocess
import os
import json
import uuid
from openai import AzureOpenAI
from dotenv import load_dotenv

CREATED_FILES_FILE = ".created_files.json"

def main():
    load_dotenv()

    parser = argparse.ArgumentParser(description="Converts natural language commands to shell commands.")
    parser.add_argument("command", type=str, help="The natural language command to execute.")
    parser.add_argument("--user", type=str, help="The user name for the session.")
    args = parser.parse_args()

    if args.user:
        user_dir = os.path.join("users", args.user)
    else:
        user_dir = os.path.join("users", str(uuid.uuid4()))

    os.makedirs(user_dir, exist_ok=True)
    os.chdir(user_dir)

    created_files = load_created_files()

    shell_command = convert_to_shell_command(args.command, created_files)

    print(f"Executing command: {shell_command}")
    execute_command(shell_command, created_files)

    save_created_files(created_files)

def load_created_files() -> list:
    if os.path.exists(CREATED_FILES_FILE):
        with open(CREATED_FILES_FILE, "r") as f:
            return json.load(f)
    return []

def save_created_files(created_files: list):
    with open(CREATED_FILES_FILE, "w") as f:
        json.dump(created_files, f)

def convert_to_shell_command(command: str, created_files: list) -> str:
    client = AzureOpenAI(
        azure_endpoint=os.environ.get("AZURE_OPENAI_ENDPOINT"),
        api_key=os.environ.get("AZURE_OPENAI_KEY"),
        api_version=os.environ.get("AZURE_OPENAI_API_VERSION"),
    )

    messages = [
        {"role": "system", "content": "You are a helpful assistant that converts natural language commands to shell commands. You can use ls, du, and other common shell commands. You should only return the shell command, without any explanation. For example, if the user says 'Take the last frame of input.mp4', you should return 'ffmpeg -y -sseof -1 -i input.mp4 -vframes 1 last_frame.png'. If the user asks 'What was the last file I added?', and the last created file is 'last_frame.png', you should return 'echo last_frame.png'."},
        {"role": "user", "content": command},
    ]
    if created_files:
        messages.append({"role": "system", "content": f"Here is a list of recently created files: {', '.join(created_files)}"})


    response = client.chat.completions.create(
        model=os.environ.get("AZURE_OPENAI_DEPLOYMENT_NAME"),
        messages=messages,
        max_tokens=100,
    )

    return response.choices[0].message.content

def execute_command(command: str, created_files: list):
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(result.stdout)
        if "ffmpeg" in command:
            # A bit of a hack to get the output file name
            output_file = command.split(" ")[-1]
            created_files.append(output_file)
    except subprocess.CalledProcessError as e:
        print(f"Error executing command: {e}")
        print(e.stderr)

if __name__ == "__main__":
    main()