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

import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';
import { processCommand as processCommandController } from './controller';

export default class VideoProcessorService extends Service<Env> {
  async processCommand(filename: string, command: string): Promise<void> {
    await processCommandController(filename, command, this.env);
  }

  fetch(request: Request): Promise<Response> {
    return Promise.resolve(new Response('not implemented', { status: 501 }));
  }
}
