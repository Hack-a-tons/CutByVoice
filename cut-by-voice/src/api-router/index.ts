/**
 * VIEW for api-router Service
 * 
 * PRD REQUIREMENTS:
 * The view layer handles HTTP requests and responses using Hono.
 * 
 * MUST IMPLEMENT:
 * 1. `POST /upload`: Upload a video file.
 * 2. `GET /videos/:filename`: Get a video file for playback.
 * 3. `POST /videos/:filename/control`: Send playback control commands.
 * 
 * INTERFACES TO EXPORT:
 * - The Hono app instance will be exported.
 * 
 * IMPORTS NEEDED:
 * - From other layers: `controller.ts`
 * - From `hono`: `Hono`, `Context`
 * 
 * BUSINESS RULES:
 * - Input validation for `/upload` and `/videos/:filename/control`.
 * 
 * ERROR HANDLING:
 * - Return appropriate HTTP error codes.
 * 
 * INTEGRATION POINTS:
 * - `api-router/controller.ts`
 */

import { Hono } from 'hono';
import { Context } from 'hono/dist/types/context';
import * as controller from './controller';

const app = new Hono();

app.post('/upload', async (c: Context) => {
  const { req } = c;
  const formData = await req.formData();
  const file = formData.get('file');
  if (!file) {
    return c.json({ success: false, error: 'No file provided' }, 400);
  }
  await controller.uploadVideo(file as File);
  return c.json({ success: true, filename: (file as File).name });
});

app.get('/videos/:filename', async (c: Context) => {
  const filename = c.req.param('filename');
  return await controller.getVideo(filename);
});

app.post('/videos/:filename/control', async (c: Context) => {
    const filename = c.req.param('filename');
    const { command } = await c.req.json();
    if (!command) {
        return c.json({ success: false, error: 'Invalid command' }, 400);
    }
    await controller.controlVideo(filename, command);
    return c.json({ success: true });
});

export default app;
