import { ask } from '../services/rag.service.js';
export default async function chatRoute(app) {
  app.post('/chat', async (req, reply) => {
    const { question } = req.body || {};
    if (!question) return reply.code(400).send({ error: 'question required' });
    const answer = await ask(question);
    return { answer };
  });
}
