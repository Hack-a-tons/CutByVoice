# 🎬 CutByVoice

> **⚠️ This project has been superseded by [PilotDirector](https://github.com/Hack-a-tons/PilotDirector)**

**Edit videos and manage your files using natural language — powered by AI and shell commands.**

## The Problem

The rise of AI-powered video generation tools has made it easier than ever to create stunning visual content. However, these tools often produce raw footage that requires post-editing to be truly useful. This post-editing process can be complex and time-consuming, requiring specialized skills and software.

## The Solution

CutByVoice is a tool that simplifies the video editing process by allowing you to use natural language commands to edit your videos. No more timelines or complicated commands – just say what you want, and get your cut.

---

## 🎬 Demo

[![CutByVoice Demo](https://img.youtube.com/vi/N4bfD_4he0A/0.jpg)](https://www.youtube.com/watch?v=N4bfD_4he0A)

---

## 🚀 Current Implementation: The CLI

The first version of CutByVoice is a powerful command-line tool that lets you:

- 🗣️ **Use natural language commands**: Process video, audio, and images with `ffmpeg`, and manage files with `ls`, `du`, etc.
- 🎞️ **Generate commands automatically**: Converts your instructions into precise shell commands.
- 🧠 **Stay in context**: Remembers the last video you worked on.
- 🤔 **Get clarification**: Asks for more information when your command is ambiguous.
- 💻 **Have your own workspace**: Each user gets their own directory for their files.
- 🔒 **Be secure**: Includes security checks to prevent malicious commands.
- ℹ️ **Get detailed file information**: Get detailed information about your files, including duration, dimensions, and framerate for videos.
- 📥 **Add files**: Add files from your local machine or from a URL.

---

## 🔮 Future Implementation: The Server

The next step in the evolution of CutByVoice is to move the core logic to a server-based architecture. This will enable more advanced features and a better user experience.

The future architecture will consist of two main components:

1.  **File Server**: A dedicated server with `ffmpeg` installed and a file system to store and process your videos. This will allow for faster processing and the ability to handle larger files.
2.  **Control Server with LiquidMetal AI Raindrop**: A server running on the Raindrop platform that will handle the natural language processing, API routing, and other control logic.

This hybrid approach will allow us to leverage the power of the Raindrop platform for the AI and API routing, while still having the flexibility to use `ffmpeg` on a dedicated server.

### Frame Content Analysis

A key feature of the server-based architecture will be the ability to analyze the content of video frames using vision models. This will allow users to ask questions like:

-   *"Find the frame where the scene with the girl ends and the scene with the spaceships begins."*

To implement this, we will use a combination of scene change detection tools (like `ffmpeg`'s `select` filter) and vision models (like GPT-4.1 or similar). The process will be as follows:

1.  **Detect scene changes**: Use `ffmpeg` to identify the frames where scene changes occur.
2.  **Extract frames**: Extract the last frame of the first scene and the first frame of the second scene.
3.  **Analyze frames**: Use a vision model to analyze the content of the extracted frames and determine if they match the user's description.

---

## 🛠️ How to Use the CLI

1.  **Add a file (optional)**:
    ```bash
    python cut-by-voice.py --add-file /path/to/your/file.mp4
    ```
    or
    ```bash
    python cut-by-voice.py --add-file https://example.com/video.mp4
    ```
2.  **Run a command**:
    ```bash
    python cut-by-voice.py "Your command here"
    ```
3.  **Provide a user (optional)**:
    ```bash
    python cut-by-voice.py "Your command here" --user your_username
    ```
4.  **CutByVoice parses your request** → builds a shell command → executes it.
5.  **See the output** in your terminal.

---

## 📦 Tech Stack

- **CLI**: Python
- **NLP**: Azure OpenAI
- **Shell commands**: `ffmpeg`, `ffprobe`, `ls`, `du`, etc.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

---

## 📜 License

MIT License — free to use, modify, and share.

---

## 🏆 Hackathon

This project was developed for the [Coding with AI Hackathon](https://luma.com/ai-coding-hack) on September 26, 2025, at the AWS Loft in San Francisco.