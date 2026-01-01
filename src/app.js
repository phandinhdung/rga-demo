import chatRoute from './routes/chat.route.js';

export async function buildApp(app) {
  await app.register(chatRoute);
}
