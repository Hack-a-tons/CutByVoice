/**
 * CONTROLLER for api-router Service
 * 
 * PRD REQUIREMENTS:
 * The controller layer orchestrates workflows.
 * 
 * MUST IMPLEMENT:
 * 1. `uploadVideo(file: File): Promise<void>`:
 *    - Get the file from the request.
 *    - Call the `model.ts` to save the file to the `video-storage` SmartBucket.
 *    - Return a success response.
 * 2. `getVideo(filename: string): Promise<Response>`:
 *    - Get the filename from the request.
 *    - Call the `model.ts` to get the file from the `video-storage` SmartBucket.
 *    - Return the file as a response.
 * 3. `controlVideo(filename: string, command: string): Promise<void>`:
 *    - Get the filename and command from the request.
 *    - Call the `video-processor` service to perform the video manipulation.
 *    - Return a success response.
 * 
 * INTERFACES TO EXPORT:
 * - `uploadVideo(file: File): Promise<void>`
 * - `getVideo(filename: string): Promise<Response>`
 * - `controlVideo(filename: string, command: string): Promise<void>`
 * 
 * IMPORTS NEEDED:
 * - From other layers: `model.ts`
 * - From env: `env.VIDEO_PROCESSOR`
 * 
 * BUSINESS RULES:
 * - N/A
 * 
 * ERROR HANDLING:
 * - Handle errors from the model and the `video-processor` service.
 * 
 * INTEGRATION POINTS:
 * - `video-processor` (Service)
 * - `api-router/model.ts`
 */

import { Env } from './raindrop.gen';
import * as model from './model';

async function uploadVideo(file: File, env: Env): Promise<void> {
  await model.saveFile(file, env);
}

async function getVideo(filename: string, env: Env): Promise<Response> {
  return await model.getFile(filename, env);
}

async function controlVideo(filename: string, command: string, env: Env): Promise<void> {
  await env.VIDEO_PROCESSOR.processCommand(filename, command);
}

export default {
    uploadVideo,
    getVideo,
    controlVideo
}
