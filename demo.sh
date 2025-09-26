#!/bin/bash

# This script demonstrates the usage of the cut-by-voice.py CLI tool.

# Create a new user
echo ">>> Creating a new user 'demouser' and adding a video file..."
echo "python3 cut-by-voice.py --add-file /Users/dbystruev/Downloads/GitHub/Hack-a-tons/CutByVoice/users/testuser/input.mp4 --user demouser"
python3 cut-by-voice.py --add-file /Users/dbystruev/Downloads/GitHub/Hack-a-tons/CutByVoice/users/testuser/input.mp4 --user demouser
read -p "Press Enter to continue..."
echo

# List the files
echo ">>> Listing the files for the user 'demouser'..."
echo "python3 cut-by-voice.py \"What files do I have?\" --user demouser"
python3 cut-by-voice.py "What files do I have?" --user demouser
read -p "Press Enter to continue..."
echo

# Get video information
echo ">>> Getting the duration of the last video..."
echo "python3 cut-by-voice.py \"What is the duration of my last video?\" --user demouser"
python3 cut-by-voice.py "What is the duration of my last video?" --user demouser
read -p "Press Enter to continue..."
echo

# Simple edit
echo ">>> Creating a new video from the first 5 seconds of the last video..."
echo "python3 cut-by-voice.py \"Create a video from the first 5 seconds of my last video.\" --user demouser"
python3 cut-by-voice.py "Create a video from the first 5 seconds of my last video." --user demouser
read -p "Press Enter to continue..."
echo

# List the files again
echo ">>> Listing the files again to see the new video..."
echo "python3 cut-by-voice.py \"What files do I have?\" --user demouser"
python3 cut-by-voice.py "What files do I have?" --user demouser
read -p "Press Enter to continue..."
echo

# Clean up
echo ">>> Cleaning up the demo user directory..."
rm -rf users/demouser
echo ">>> Demo finished."