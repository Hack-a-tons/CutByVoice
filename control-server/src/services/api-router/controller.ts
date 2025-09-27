import { Env } from './raindrop.gen';
import * as fs from 'fs';
import FormData from 'form-data';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

async function convertToShellCommand(command: string, last_video: string, env: Env): Promise<string> {
    const client = new OpenAIClient(env.AZURE_OPENAI_ENDPOINT, new AzureKeyCredential(env.AZURE_OPENAI_KEY));

    const messages = [
        { role: "system", content: "You are a helpful assistant that converts natural language commands to shell commands. You should only return the shell command, without any explanation." },
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

export async function addFile(filePath: string, user: string, env: Env): Promise<string> {
    if (filePath.startsWith("http")) {
        const fileResponse = await fetch(filePath);
        const fileData = await fileResponse.arrayBuffer();
        const form = new FormData();
        form.append('file', Buffer.from(fileData), {
            filename: filePath.split('/').pop(),
            contentType: fileResponse.headers.get('content-type'),
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

    } else {
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
}
