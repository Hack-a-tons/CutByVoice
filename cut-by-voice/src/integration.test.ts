import { describe, it, expect, vi } from 'vitest';
import app from './api-router/index';
import { Env } from './api-router/raindrop.gen';
import VideoProcessorService from './video-processor/index';
import * as apiRouterModel from './api-router/model';
import * as videoProcessorModel from './video-processor/model';

vi.mock('./api-router/model');
vi.mock('./video-processor/model');

const mockVideoProcessorEnv: any = {
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
    VIDEO_STORAGE: {
        put: vi.fn(),
        get: vi.fn(),
    } as any,
};

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
  VIDEO_PROCESSOR: new VideoProcessorService({} as any, mockVideoProcessorEnv),
  VIDEO_STORAGE: {
    put: vi.fn(),
    get: vi.fn(),
  } as any,
};

describe('integration', () => {
    it('should upload a file and process it', async () => {
        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        const formData = new FormData();
        formData.append('file', file);

        (apiRouterModel.saveFile as vi.Mock).mockResolvedValue(undefined);

        const uploadRes = await app.request('/upload', {
            method: 'POST',
            body: formData,
        }, mockEnv);

        expect(uploadRes.status).toBe(200);

        const fileContent = 'test content';
        const fileBody = new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode(fileContent));
                controller.close();
            }
        });
        const mockFile = {
            key: 'test.txt',
            body: fileBody,
            size: fileContent.length,
            httpMetadata: {
                contentType: 'text/plain',
            },
        };
        (mockVideoProcessorEnv.VIDEO_STORAGE.get as vi.Mock).mockResolvedValue(mockFile);
        (videoProcessorModel.executeCommand as vi.Mock).mockResolvedValue(undefined);

        const controlRes = await app.request('/videos/test.txt/control', {
            method: 'POST',
            body: JSON.stringify({ command: 'one frame forward' }),
            headers: {
                'Content-Type': 'application/json',
            },
        }, mockEnv);

        expect(controlRes.status).toBe(200);
        expect(apiRouterModel.saveFile).toHaveBeenCalledWith(expect.any(File), mockEnv);
        expect(videoProcessorModel.executeCommand).toHaveBeenCalledWith('test.txt', 'one frame forward', expect.any(Object));
    });
});
