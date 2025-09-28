import { Hono } from 'hono';
import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';
import * as controller from './controller';

export default class ApiRouterService extends Service<Env> {
  fetch = (request: Request, env: Env, ctx: ExecutionContext) => {
    const app = new Hono<{ Bindings: Env }>();

    app.post('/command', async (c) => {
      try {
        const body = await c.req.json();
        if (typeof body !== 'object' || body === null || Array.isArray(body)) {
          return c.json({ error: 'Invalid request body' }, 400);
        }
        const { command, user } = body as { command: string, user: string };
        if (typeof command !== 'string' || !user) {
          return c.json({ error: 'Malformed payload' }, 400);
        }
        const output = await controller.processCommand(command, user, c.env);
        return c.json({ output });
      } catch (e) {
        return c.json({ error: 'Invalid JSON' }, 400);
      }
    });

    app.post('/add-file', async (c) => {
        const formData = await c.req.formData();
        const file = formData.get('file');
        const user = formData.get('user');

        if (!file || !user) {
            return c.json({ error: 'Malformed payload' }, 400);
        }

        const message = await controller.addFile(file as File, user as string, c.env);
        return c.json({ message });
    });

    return app.fetch(request, env, ctx);
  }
}
