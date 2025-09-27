import { Env } from './raindrop.gen';
import FormData from 'form-data';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { Readable } from 'stream';

const SYSTEM_PROMPT = `You are a helpful assistant that converts natural language commands to shell commands. You should only return the shell command, without any explanation.

If the user asks to list files, you should use the `file_info.py` script to get the information for each file. For example:
- "What files do I have?": "for f in *; do python3 {FILE_INFO_PATH} \"$f\"; done"

If the user asks a question about a video, you should use ffprobe to get the information. For example:
- "How many frames are in my last video?": "ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -of default=nokey=1:noprint_wrappers=1 my_last_video.mp4"
- "What is the framerate of my last video?": "ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=nokey=1:noprint_wrappers=1 my_last_video.mp4"
- "What is the duration of my last video?": "ffprobe -v error -show_entries format=duration -of default=nokey=1:noprint_wrappers=1 my_last_video.mp4"

If the user wants to modify a video, you should use ffmpeg. For example:
- "Create a video from the first 5 seconds of my last video.": "ffmpeg -y -i my_last_video.mp4 -t 5 output.mp4"
- "Take the last frame of output.mp4 and name it title.png": "ffmpeg -y -sseof -3 -i output.mp4 -update 1 -q:v 1 title.png"
- "Concatenate all video files I have into output.mp4": "for f in *.mp4; do echo \"file '$f'\" >> mylist.txt; done && ffmpeg -y -f concat -safe 0 -i mylist.txt -c copy output.mp4 && rm mylist.txt"

If the user asks about the last created file, you should return the name of the file. For example, if the last created file is 'last_frame.png', you should return 'echo last_frame.png'.`;

async function convertToShellCommand(command: string, last_video: string, env: Env): Promise<string> {
    const client = new OpenAIClient(env.AZURE_OPENAI_ENDPOINT, new AzureKeyCredential(env.AZURE_OPENAI_KEY));

    let system_prompt = SYSTEM_PROMPT;
    if (last_video) {
        system_prompt = system_prompt.replace("my_last_video.mp4", last_video);
    }

    const messages = [
        { role: "system", content: system_prompt },
        { role: "user", content: command },
    ];
    if (last_video) {
        messages.push({ role: "system", content: `The last video was: ${last_video}` });
    }

    const response = await client.getChatCompletions(env.AZURE_OPENAI_DEPLOYMENT_NAME, messages, {
        maxTokens: 100,
    });

    return response.choices[0].message.content;
}

export async function processCommand(command: string, user: string, env: Env): Promise<string> {
  const shell_command = await convertToShellCommand(command, null, env);

  const response = await fetch(`${env.FILE_SERVER_URL}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User': user,
      'X-API-Key': env.FILE_SERVER_API_KEY,
    },
    body: JSON.stringify({ command: shell_command }),
  });

  const data = await response.json();
  return data.stdout;
}

export async function addFile(file: File, user: string, env: Env): Promise<string> {
    const form = new FormData();
    const buffer = await file.arrayBuffer();
    const stream = Readable.from(Buffer.from(buffer));
    form.append('file', stream, {
        filename: file.name || 'upload',
        contentType: file.type || 'application/octet-stream',
    });

    const response = await fetch(`${env.FILE_SERVER_URL}/upload`, {
        method: 'POST',
        headers: {
            ...form.getHeaders(),
            'X-User': user,
            'X-API-Key': env.FILE_SERVER_API_KEY,
        },
        body: form,
    });

    const data = await response.json();
    return data.message;
}