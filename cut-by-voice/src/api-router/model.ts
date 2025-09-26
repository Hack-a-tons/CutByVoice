/**
 * MODEL for api-router Service
 * 
 * PRD REQUIREMENTS:
 * The model layer handles data operations and business logic.
 * 
 * MUST IMPLEMENT:
 * 1. `saveFile(file: File): Promise<void>`: Saves a file to the `video-storage` SmartBucket.
 * 2. `getFile(filename: string): Promise<Response>`: Retrieves a file from the `video-storage` SmartBucket.
 * 
 * INTERFACES TO EXPORT:
 * - `saveFile(file: File): Promise<void>`
 * - `getFile(filename: string): Promise<Response>`
 * 
 * IMPORTS NEEDED:
 * - From env: `env.VIDEO_STORAGE`
 * 
 * BUSINESS RULES:
 * - N/A
 * 
 * ERROR HANDLING:
 * - Handle errors from the SmartBucket.
 * 
 * INTEGRATION POINTS:
 * - `video-storage` (SmartBucket)
 */

import { Env } from './raindrop.gen';

export async function saveFile(file: File, env: Env): Promise<void> {
  await env.VIDEO_STORAGE.put(file.name, await file.arrayBuffer());
}

export async function getFile(filename: string, env: Env): Promise<Response> {
  const file = await env.VIDEO_STORAGE.get(filename);
  if (!file) {
    return new Response('File not found', { status: 404 });
  }
  const headers = new Headers();
  headers.set('Content-Type', file.httpMetadata?.contentType || 'application/octet-stream');
  headers.set('Content-Length', file.size.toString());
  return new Response(file.body, { headers });
}
