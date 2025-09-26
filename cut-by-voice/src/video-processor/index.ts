/**
 * VIEW for video-processor Service
 * 
 * PRD REQUIREMENTS:
 * The view layer handles the public interface of the service.
 * 
 * MUST IMPLEMENT:
 * 1. `processCommand(filename: string, command: string): Promise<void>`
 * 
 * INTERFACES TO EXPORT:
 * - `processCommand(filename: string, command: string): Promise<void>`
 * 
 * IMPORTS NEEDED:
 * - From other layers: `controller.ts`
 * 
 * BUSINESS RULES:
 * - N/A
 * 
 * ERROR HANDLING:
 * - N/A
 * 
 * INTEGRATION POINTS:
 * - `video-processor/controller.ts`
 */

import * as controller from './controller';

export async function processCommand(filename: string, command: string): Promise<void> {
  await controller.processCommand(filename, command);
}
