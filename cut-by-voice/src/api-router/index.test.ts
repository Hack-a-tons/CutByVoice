/// <reference types="vitest/globals" />
import { describe, it, expect, vi } from 'vitest';
import ApiRouterService from './index';
import { Env } from './raindrop.gen';
import controller from './controller';

vi.mock('./controller');

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
    VIDEO_PROCESSOR: {
        processCommand: vi.fn(),
    } as any,
    VIDEO_STORAGE: {
        put: vi.fn(),
        get: vi.fn(),
    } as any,
};

const service = new ApiRouterService({} as any, mockEnv);
const app = service.fetch;

describe('api-router', () => {
  it('should upload a file', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', file);

    const req = new Request('http://localhost/upload', {
        method: 'POST',
        body: formData,
    });
    const res = await app(req, mockEnv, {} as any);


    expect(res.status).toBe(200);
    const json = await res.json() as { success: boolean, filename: string };
    expect(json.success).toBe(true);
    expect(json.filename).toBe('test.txt');
    expect(controller.uploadVideo).toHaveBeenCalledWith(expect.any(File), mockEnv);
  });

  it('should get a file', async () => {
    const fileContent = 'test content';
    const file = new Blob([fileContent], { type: 'text/plain' });
    const response = new Response(file, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Length': file.size.toString(),
      },
    });
    (controller.getVideo as vi.Mock).mockResolvedValue(response);

    const req = new Request('http://localhost/videos/test.txt');
    const res = await app(req, mockEnv, {} as any);

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe(fileContent);
    expect(controller.getVideo).toHaveBeenCalledWith('test.txt', mockEnv);
  });

  it('should control a video', async () => {
    const req = new Request('http://localhost/videos/test.txt/control', {
        method: 'POST',
        body: JSON.stringify({ command: 'one frame forward' }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const res = await app(req, mockEnv, {} as any);

    expect(res.status).toBe(200);
    const json = await res.json() as { success: boolean };
    expect(json.success).toBe(true);
    expect(controller.controlVideo).toHaveBeenCalledWith('test.txt', 'one frame forward', mockEnv);
  });
});