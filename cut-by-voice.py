import argparse
import subprocess
import os
import json
import uuid
from openai import AzureOpenAI
from dotenv import load_dotenv

CREATED_FILES_FILE = ".created_files.json"
PROMPT_FILE = "prompts/system_prompt.txt"

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
    
    original_cwd = os.getcwd()
    os.chdir(user_dir)

    created_files = load_created_files()

    shell_command = convert_to_shell_command(args.command, created_files, original_cwd)

    print(f"Executing command: {shell_command}")
    execute_command(shell_command, created_files)

    save_created_files(created_files)
    
    os.chdir(original_cwd)

def load_created_files() -> list:
    if os.path.exists(CREATED_FILES_FILE):
        with open(CREATED_FILES_FILE, "r") as f:
            return json.load(f)
    return []

def save_created_files(created_files: list):
    with open(CREATED_FILES_FILE, "w") as f:
        json.dump(created_files, f)

def sanitize_command(command: str) -> str:
    # Add more sanitization rules here
    if ".." in command or "~" in command:
        return "echo 'Error: command contains invalid characters.'"
    if command.strip().startswith("/"):
        return "echo 'Error: command cannot start with /.'"
    return command

def convert_to_shell_command(command: str, created_files: list, original_cwd: str) -> str:
    with open(os.path.join(original_cwd, PROMPT_FILE), "r") as f:
        system_prompt = f.read()

    client = AzureOpenAI(
        azure_endpoint=os.environ.get("AZURE_OPENAI_ENDPOINT"),
        api_key=os.environ.get("AZURE_OPENAI_KEY"),
        api_version=os.environ.get("AZURE_OPENAI_API_VERSION"),
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": command},
    ]
    if created_files:
        messages.append({"role": "system", "content": f"Here is a list of recently created files: {', '.join(created_files)}"})


    response = client.chat.completions.create(
        model=os.environ.get("AZURE_OPENAI_DEPLOYMENT_NAME"),
        messages=messages,
        max_tokens=100,
    )

    shell_command = response.choices[0].message.content

    if "pwd" in shell_command:
        return "echo 'pwd command is not allowed'"

    return sanitize_command(shell_command)

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