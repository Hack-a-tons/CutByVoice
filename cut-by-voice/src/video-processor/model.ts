/**
 * MODEL for video-processor Service
 * 
 * PRD REQUIREMENTS:
 * The model layer handles data operations and business logic.
 * 
 * MUST IMPLEMENT:
 * 1. `executeCommand(filename: string, command: string): Promise<void>`: Executes an FFmpeg command on the specified file.
 * 
 * INTERFACES TO EXPORT:
 * - `executeCommand(filename: string, command: string): Promise<void>`
 * 
 * IMPORTS NEEDED:
 * - From `child_process`: `exec`
 * 
 * BUSINESS RULES:
 * - N/A
 * 
 * ERROR HANDLING:
 * - Handle errors from the FFmpeg command execution.
 * 
 * INTEGRATION POINTS:
 * - FFmpeg
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { Env } from './raindrop.gen';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

export async function executeCommand(filename: string, command: string, env: Env): Promise<void> {
  const videoFile = await env.VIDEO_STORAGE.get(filename);
  if (!videoFile) {
    throw new Error('File not found');
  }

  const videoPath = `/tmp/videos/${filename}`;
  await fs.mkdir('/tmp/videos', { recursive: true });
  await fs.writeFile(videoPath, videoFile.body);

  let ffmpegCommand: string;

  switch (command) {
    case 'one frame forward':
      ffmpegCommand = `ffmpeg -i ${videoPath} -vf "select='eq(n,1)'" -vsync vfr /tmp/videos/out.png`;
      break;
    case 'one frame back':
      ffmpegCommand = `ffmpeg -i ${videoPath} -vf "select='eq(n,0)'" -vsync vfr /tmp/videos/out.png`;
      break;
    case 'half second back':
        ffmpegCommand = `ffmpeg -ss -0.5 -i ${videoPath} -c copy /tmp/videos/out.mp4`;
        break;
    case 'go to the beginning':
        ffmpegCommand = `ffmpeg -ss 0 -i ${videoPath} -c copy /tmp/videos/out.mp4`;
        break;
    default:
      throw new Error('Invalid command');
  }

  await execAsync(ffmpegCommand);
}
