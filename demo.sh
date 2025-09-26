#!/bin/bash

# This script demonstrates the usage of the cut-by-voice.py CLI tool.

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Create a new user
echo ">>> Creating a new user 'demouser'..."
echo -e "${GREEN}python3 cut-by-voice.py \"What files do I have?\" --user demouser${NC}"
python3 cut-by-voice.py "What files do I have?" --user demouser
read -p "Press Enter to continue..."
echo 

# Add video files
echo ">>> Adding video files..."
echo -e "${GREEN}python3 cut-by-voice.py --add-file demo/video1.mp4 --user demouser${NC}"
python3 cut-by-voice.py --add-file demo/video1.mp4 --user demouser
echo ">>> Opening the video file..."
echo "open -a \"QuickTime Player\" users/demouser/video1.mp4"
open -a "QuickTime Player" users/demouser/video1.mp4
read -p "Press Enter to continue..."
echo 

echo -e "${GREEN}python3 cut-by-voice.py --add-file demo/video2.mp4 --user demouser${NC}"
python3 cut-by-voice.py --add-file demo/video2.mp4 --user demouser
echo ">>> Opening the video file..."
echo "open -a \"QuickTime Player\" users/demouser/video2.mp4"
open -a "QuickTime Player" users/demouser/video2.mp4
read -p "Press Enter to continue..."
echo 

echo -e "${GREEN}python3 cut-by-voice.py --add-file demo/video3.mp4 --user demouser${NC}"
python3 cut-by-voice.py --add-file demo/video3.mp4 --user demouser
echo ">>> Opening the video file..."
echo "open -a \"QuickTime Player\" users/demouser/video3.mp4"
open -a "QuickTime Player" users/demouser/video3.mp4
read -p "Press Enter to continue..."
echo 

# List the files
echo ">>> Listing the files for the user 'demouser'..."
echo -e "${GREEN}python3 cut-by-voice.py \"What files do I have?\" --user demouser${NC}"
echo -e "${YELLOW}"
python3 cut-by-voice.py "What files do I have?" --user demouser
echo -e "${NC}"
read -p "Press Enter to continue..."
echo 

# Concatenate the videos
echo ">>> Concatenating all video files..."
echo -e "${GREEN}python3 cut-by-voice.py \"Concatenate all video files I have into output.mp4\" --user demouser${NC}"
echo -e "${YELLOW}"
python3 cut-by-voice.py "Concatenate all video files I have into output.mp4" --user demouser
echo -e "${NC}"
echo ">>> Opening the concatenated video..."
echo "open -a \"QuickTime Player\" users/demouser/output.mp4"
open -a "QuickTime Player" users/demouser/output.mp4
read -p "Press Enter to continue..."
echo 

# Extract a frame
echo ">>> Extracting the last frame of the concatenated video to use as a title..."
echo -e "${GREEN}python3 cut-by-voice.py \"Take the last frame of output.mp4 and name it title.png\" --user demouser${NC}"
echo -e "${YELLOW}"
python3 cut-by-voice.py "Take the last frame of output.mp4 and name it title.png" --user demouser
echo -e "${NC}"
echo ">>> Opening the title image..."
echo "open users/demouser/title.png"
open users/demouser/title.png
read -p "Press Enter to continue..."
echo 

# Ask stat questions
echo ">>> Asking some stat questions about the concatenated video..."
echo -e "${GREEN}python3 cut-by-voice.py \"How many frames are in output.mp4?\" --user demouser${NC}"
echo -e "${YELLOW}"
python3 cut-by-voice.py "How many frames are in output.mp4?" --user demouser
echo -e "${NC}"
read -p "Press Enter to continue..."
echo 

# Clean up
echo ">>> Cleaning up the demo user directory..."
rm -rf users/demouser
echo ">>> Demo finished."
