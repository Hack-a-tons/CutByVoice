# 🎬 CutByVoice CLI

**Edit videos and manage your files using natural language — powered by AI and shell commands.**

CutByVoice is a command-line tool that lets you describe your edits and file management tasks in plain text. It automatically converts your instructions into the right shell commands and executes them for you.

---

## 🚀 Features

- 🗣️ **Natural language commands**: Process video, audio, and images with `ffmpeg`, and manage files with `ls`, `du`, etc.
- 🎞️ **Automatic command generation**: Converts instructions into precise shell commands.
- 🧠 **Context-aware**: Remembers the last video you worked on.
- 🤔 **Interactive**: Asks for clarification when the command is ambiguous.
- 💻 **User-specific workspaces**: Each user gets their own directory for their files.
- 🔒 **Security**: Includes security checks to prevent malicious commands.
- ℹ️ **Detailed file information**: Get detailed information about your files, including duration, dimensions, and framerate for videos.
- 📥 **Add files**: Add files from your local machine or from a URL.

---

## 🛠️ How It Works

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

## Examples

### Video Processing

-   **Get video information**:
    -   `"How many frames are in my last video?"`
    -   `"What is the framerate of my last video?"`
    -   `"What is the duration of my last video?"`
-   **Simple edits**:
    -   `"Create a video from the first 5 seconds of my last video."`
    -   `"Take the last frame of input.mp4"`
    -   `"Convert my last video to gif."`
    -   `"Resize my last video to 640x480."`
-   **Complex edits**:
    -   `"Concatenate video1.mp4 and video2.mp4."`
    -   `"Take the first half of video1.mp4, the first half of video2.mp4, and put the music from video1.mp4 on top of the output video."`
    -   `"Add a watermark to my last video."`

### File Management

-   `"What files do I have?"`
-   `"List all files by size"`
-   `"What is the total size occupied by all my files?"`
-   `"What was the last file I added?"`
-   `"Delete all png files."`

---

## 📂 User Workspaces

CutByVoice provides a simple way to manage your files by giving each user their own workspace.

- **Authenticated users**: If you provide a username using the `--user` flag, a permanent directory will be created for you in the `users` directory. All your files and command history will be stored there.
- **Anonymous users**: If you don't provide a username, a common `anonymous` directory will be used for the session.

---

## 🔒 Security

The tool has a security layer that prevents the execution of malicious commands. It checks for the following:

-   Directory traversal characters like `..` and `~`.
-   Commands starting with `/`.
-   The `pwd` command is disabled.

---

## 🔮 Roadmap

- [ ] Support for more complex `ffmpeg` commands.
- [ ] Improved file history and memory.
- [ ] Web interface for easier interaction.
- [ ] Collaborative editing with shared projects.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

---

## 📜 License

MIT License — free to use, modify, and share.