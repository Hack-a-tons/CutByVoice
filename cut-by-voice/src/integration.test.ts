/// <reference types="vitest/globals" />
import { describe, it, expect, vi } from 'vitest';
import ApiRouterService from './api-router/index';
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

const service = new ApiRouterService({} as any, mockEnv);
const app = service.fetch;

describe('integration', () => {
    it('should upload a file and process it', async () => {
        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        const formData = new FormData();
        formData.append('file', file);

        (apiRouterModel.saveFile as vi.Mock).mockResolvedValue(undefined);

        const uploadReq = new Request('http://localhost/upload', {
            method: 'POST',
            body: formData,
        });
        const uploadRes = await app(uploadReq, mockEnv, {} as any);

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

        const controlReq = new Request('http://localhost/videos/test.txt/control', {
            method: 'POST',
            body: JSON.stringify({ command: 'one frame forward' }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const controlRes = await app(controlReq, mockEnv, {} as any);

        expect(controlRes.status).toBe(200);
        expect(apiRouterModel.saveFile).toHaveBeenCalledWith(expect.any(File), mockEnv);
        expect(videoProcessorModel.executeCommand).toHaveBeenCalledWith('test.txt', 'one frame forward', expect.any(Object));
    });
});
