# 🎬 CutByVoice CLI

**Edit videos and manage your files using natural language — powered by AI and shell commands.**

CutByVoice is a command-line tool that lets you describe your edits and file management tasks in plain text. It automatically converts your instructions into the right shell commands and executes them for you.

---

## 🚀 Features

- 🗣️ **Natural language commands**: “Take the last frame of input.mp4”, "List all files by size", "What is the total size occupied by all my files?".
- 🎞️ **Automatic command generation**: Converts instructions into precise `ffmpeg` and other shell commands.
- 💻 **User-specific workspaces**: Each user gets their own directory for their files. Authenticated users have permanent directories, while non-authenticated users get a new directory for each session.
- 🔒 **Security**: The tool includes security checks to prevent malicious commands from being executed.

---

## 🛠️ How It Works

1.  **Run the CLI**:
    ```bash
    python cut-by-voice.py "Your command here"
    ```
2.  **Provide a user (optional)**:
    ```bash
    python cut-by-voice.py "Your command here" --user your_username
    ```
3.  **CutByVoice parses your request** → builds a shell command → executes it.
4.  **See the output** in your terminal.

---

## 📦 Tech Stack

- **CLI**: Python
- **NLP**: Azure OpenAI
- **Shell commands**: `ffmpeg`, `ls`, `du`, etc.

---

## 📂 User Workspaces

CutByVoice provides a simple way to manage your files by giving each user their own workspace.

- **Authenticated users**: If you provide a username using the `--user` flag, a permanent directory will be created for you in the `users` directory. All your files and command history will be stored there.
- **Non-authenticated users**: If you don't provide a username, a new temporary directory will be created for you for each session. The directory will be deleted when the session ends.

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