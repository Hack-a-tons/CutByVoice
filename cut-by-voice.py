import argparse
import subprocess
import os
import json
import uuid
import requests
import shutil
from openai import AzureOpenAI
from dotenv import load_dotenv

CREATED_FILES_FILE = ".created_files.json"
PROMPT_FILE = "prompts/system_prompt.txt"
YELLOW = '\033[0;33m'
NC = '\033[0m' # No Color

def main():
    load_dotenv()

    parser = argparse.ArgumentParser(description="Converts natural language commands to shell commands.")
    parser.add_argument("command", type=str, nargs='?', default=None, help="The natural language command to execute.")
    parser.add_argument("--user", type=str, help="The user name for the session.")
    parser.add_argument("--add-file", type=str, help="The local path or URL of the file to add.")
    args = parser.parse_args()

    original_cwd = os.getcwd()

    if args.user:
        user_dir = os.path.join("users", args.user)
    else:
        user_dir = os.path.join("users", "anonymous")

    os.makedirs(user_dir, exist_ok=True)
    
    os.chdir(user_dir)

    if args.add_file:
        add_file(args.add_file, original_cwd)
        os.chdir(original_cwd)
        return

    if not args.command:
        parser.print_help()
        os.chdir(original_cwd)
        return

    if not os.listdir():
        print(f"{YELLOW}There are no files in your directory.{NC}")
        os.chdir(original_cwd)
        return

    created_files = load_created_files()
    last_video = created_files[-1] if created_files else None

    shell_command = convert_to_shell_command(args.command, last_video, original_cwd)

    print(f"Executing command: {shell_command}")
    execute_command(shell_command, created_files)

    save_created_files(created_files)
    
    os.chdir(original_cwd)

def add_file(file_path: str, original_cwd: str):
    created_files = load_created_files()
    if file_path.startswith("http"):
        # Download from URL
        try:
            response = requests.get(file_path, stream=True)
            response.raise_for_status()
            filename = os.path.basename(file_path)
            with open(filename, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"{YELLOW}File downloaded: {filename}{NC}")
            if filename not in created_files:
                created_files.append(filename)
        except requests.exceptions.RequestException as e:
            print(f"{YELLOW}Error downloading file: {e}{NC}")
    else:
        # Copy local file
        if not os.path.isabs(file_path):
            file_path = os.path.join(original_cwd, file_path)
        try:
            shutil.copy(file_path, ".")
            filename = os.path.basename(file_path)
            print(f"{YELLOW}File copied: {filename}{NC}")
            if filename not in created_files:
                created_files.append(filename)
        except FileNotFoundError:
            print(f"{YELLOW}File not found: {file_path}{NC}")
    save_created_files(created_files)

def load_created_files() -> list:
    if os.path.exists(CREATED_FILES_FILE):
        with open(CREATED_FILES_FILE, "r") as f:
            return json.load(f)
    return []

def save_created_files(created_files: list):
    with open(CREATED_FILES_FILE, "w") as f:
        json.dump(created_files, f)

def sanitize_command(command: str, original_cwd: str) -> str:
    file_info_path = os.path.join(original_cwd, "file_info.py")
    # Allow the file_info.py script
    if file_info_path in command:
        return command

    # Add more sanitization rules here
    if ".." in command or "~" in command:
        return "echo 'Error: command contains invalid characters.'"
    if command.strip().startswith("/"):
        return "echo 'Error: command cannot start with /.'"
    return command

def convert_to_shell_command(command: str, last_video: str, original_cwd: str) -> str:
    file_info_path = os.path.join(original_cwd, "file_info.py")
    with open(os.path.join(original_cwd, PROMPT_FILE), "r") as f:
        system_prompt = f.read().replace("{FILE_INFO_PATH}", file_info_path)

    if last_video:
        system_prompt = system_prompt.replace("my_last_video.mp4", last_video)

    client = AzureOpenAI(
        azure_endpoint=os.environ.get("AZURE_OPENAI_ENDPOINT"),
        api_key=os.environ.get("AZURE_OPENAI_KEY"),
        api_version=os.environ.get("AZURE_OPENAI_API_VERSION"),
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": command},
    ]
    if last_video:
        messages.append({"role": "system", "content": f"The last video was: {last_video}"})


    response = client.chat.completions.create(
        model=os.environ.get("AZURE_OPENAI_DEPLOYMENT_NAME"),
        messages=messages,
        max_tokens=100,
    )

    shell_command = response.choices[0].message.content

    if "pwd" in shell_command:
        return "echo 'pwd command is not allowed'"

    return sanitize_command(shell_command, original_cwd)

def execute_command(command: str, created_files: list):
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"{YELLOW}{result.stdout}{NC}")
        print(f"{YELLOW}{result.stderr}{NC}")
        if "ffmpeg" in command:
            # A bit of a hack to get the output file name
            output_file = command.split(" ")[-1]
            if output_file not in created_files:
                created_files.append(output_file)
    except subprocess.CalledProcessError as e:
        print(f"{YELLOW}Error executing command: {e}{NC}")
        print(f"{YELLOW}{e.stderr}{NC}")

if __name__ == "__main__":
    main()
