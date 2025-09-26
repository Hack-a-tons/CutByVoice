# 🎬 CutByVoice  

**Edit videos using natural language — powered by FFmpeg.**  

CutByVoice lets you describe your edits in plain text or voice commands, and it automatically generates the right FFmpeg instructions to process your video clips. No timelines, no complex commands — just say what you want, and get your cut.  

---

## 🚀 Features  
- 🗣️ **Natural language editing**: “Take the first 5 seconds of clip1 and append the last 10 seconds of clip2.”  
- 🎞️ **Automatic FFmpeg execution**: Converts instructions into precise video commands.  
- 🔄 **Iterative refinement**: “Make it slower… add a fade… remove silence at the start.”  
- 💻 **Text or voice input**: Type or speak your edits.  
- ⚡ **Fast & lightweight**: Runs on a backend powered by FFmpeg.  

---

## 🛠️ How It Works  
1. Upload your video clips.  
2. Enter an instruction like:  

Take the first 5 seconds of intro.mp4,
then add the last 10 seconds of outro.mp4,
and insert fade transition in between.

3. CutByVoice parses your request → builds an FFmpeg command → executes it.  
4. Download your finished video. 🎉  

---

## 📦 Tech Stack  
- **Backend**: Python + FFmpeg  
- **NLP**: OpenAI / LLM parsing of natural language instructions  
- **Frontend**: (optional) Simple web UI for uploads + prompts  
- **Voice input**: Speech-to-text API (Whisper / Vosk / other)  

---

## 🔮 Roadmap  
- [ ] Support live previews of edits  
- [ ] Add background music insertion  
- [ ] Enable export in multiple formats (MP4, WebM, GIF)  
- [ ] Multi-turn conversations for editing sessions  
- [ ] Collaborative editing with shared projects  

---

## 🤝 Contributing  
Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.  

---

## 📜 License  
MIT License — free to use, modify, and share.  

---

## 🌐 Links  
- **Repository**: [Hack-a-tons/CutByVoice](https://github.com/Hack-a-tons/CutByVoice)  
- **Hackathon Demo**: _coming soon_  
