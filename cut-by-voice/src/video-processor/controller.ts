/**
 * CONTROLLER for video-processor Service
 * 
 * PRD REQUIREMENTS:
 * The controller layer orchestrates workflows.
 * 
 * MUST IMPLEMENT:
 * 1. `processCommand(filename: string, command: string): Promise<void>`:
 *    - Get the filename and command.
 *    - Call the `model.ts` to execute the FFmpeg command.
 *    - Return a success response.
 * 
 * INTERFACES TO EXPORT:
 * - `processCommand(filename: string, command: string): Promise<void>`
 * 
 * IMPORTS NEEDED:
 * - From other layers: `model.ts`
 * 
 * BUSINESS RULES:
 * - N/A
 * 
 * ERROR HANDLING:
 * - Handle errors from the model.
 * 
 * INTEGRATION POINTS:
 * - `video-processor/model.ts`
 */

import { Env } from './raindrop.gen';
import * as model from './model';

export async function processCommand(filename: string, command: string, env: Env): Promise<void> {
  await model.executeCommand(filename, command, env);
}
