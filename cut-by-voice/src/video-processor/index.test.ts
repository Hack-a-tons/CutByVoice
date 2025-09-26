import { describe, it, expect, vi } from 'vitest';
import VideoProcessorService from './index';
import { Env } from './raindrop.gen';
import * as model from './model';

vi.mock('./model', () => ({
  executeCommand: vi.fn(),
}));

const mockEnv: Env = {
  _raindrop: {
    app: {} as any,
  },
  AI: {} as any,
  annotation: {} as any,
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as any,
  tracer: {} as any,
  VIDEO_PROCESSOR: {} as any,
  VIDEO_STORAGE: {} as any,
};

describe('video-processor', () => {
  it('should process a command', async () => {
    const service = new VideoProcessorService({} as any, mockEnv);
    await service.processCommand('test.txt', 'one frame forward');
    expect(model.executeCommand).toHaveBeenCalledWith('test.txt', 'one frame forward', mockEnv);
  });
});