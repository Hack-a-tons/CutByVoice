import os
import json
import subprocess
import sys
from datetime import datetime

def get_file_info(filename):
    try:
        stat = os.stat(filename)
        size = stat.st_size
        date = datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S')

        # Get video info using ffprobe
        try:
            cmd = ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", filename]
            result = subprocess.run(cmd, check=True, capture_output=True, text=True)
            info = json.loads(result.stdout)

            duration = info.get("format", {}).get("duration", "N/A")
            video_stream = next((stream for stream in info.get("streams", []) if stream.get("codec_type") == "video"), None)
            if video_stream:
                width = video_stream.get("width", "N/A")
                height = video_stream.get("height", "N/A")
                dimensions = f"{width}x{height}"
                r_frame_rate = video_stream.get("r_frame_rate", "N/A/N/A")
                if r_frame_rate != "N/A/N/A":
                    try:
                        num, den = r_frame_rate.split('/')
                        if int(den) != 0:
                            framerate = f"{int(num) / int(den):.2f} fps"
                        else:
                            framerate = "N/A"
                    except (ValueError, ZeroDivisionError):
                        framerate = "N/A"
                else:
                    framerate = "N/A"
            else:
                dimensions = "N/A"
                framerate = "N/A"
        except (subprocess.CalledProcessError, json.JSONDecodeError):
            duration = "N/A"
            dimensions = "N/A"
            framerate = "N/A"

        print(f"{filename} | {size} | {date} | {duration} | {dimensions} | {framerate}")

    except FileNotFoundError:
        print(f"File not found: {filename}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        get_file_info(sys.argv[1])
