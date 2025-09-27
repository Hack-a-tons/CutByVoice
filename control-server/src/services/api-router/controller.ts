import { Env } from './raindrop.gen';
import * as fs from 'fs';
import FormData from 'form-data';

export async function processCommand(command: string, user: string, env: Env): Promise<string> {
  // TODO: Convert natural language to shell command using AI
  const shell_command = command; // For now, just pass the command as is

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

export async function addFile(filePath: string, user: string, env: Env): Promise<string> {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

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