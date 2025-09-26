import argparse
import subprocess
import os
from openai import AzureOpenAI
from dotenv import load_dotenv

def main():
    load_dotenv()
    parser = argparse.ArgumentParser(description="Converts natural language commands to ffmpeg commands.")
    parser.add_argument("command", type=str, help="The natural language command to execute.")
    args = parser.parse_args()

    ffmpeg_command = convert_to_ffmpeg(args.command)

    print(f"Executing command: {ffmpeg_command}")
    execute_command(ffmpeg_command)

def convert_to_ffmpeg(command: str) -> str:
    client = AzureOpenAI(
        azure_endpoint=os.environ.get("AZURE_OPENAI_ENDPOINT"),
        api_key=os.environ.get("AZURE_OPENAI_KEY"),
        api_version=os.environ.get("AZURE_OPENAI_API_VERSION"),
    )

    response = client.chat.completions.create(
        model=os.environ.get("AZURE_OPENAI_DEPLOYMENT_NAME"),
        messages=[
            {"role": "system", "content": "You are a helpful assistant that converts natural language commands to ffmpeg commands."},
            {"role": "user", "content": command},
        ],
        max_tokens=100,
    )

    return response.choices[0].message.content

def execute_command(command: str):
    try:
        subprocess.run(command, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error executing command: {e}")

if __name__ == "__main__":
    main()