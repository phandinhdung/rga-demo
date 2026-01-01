import 'dotenv/config';
import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import { buildApp } from './app.js';

const app = Fastify({ logger: true });
await app.register(multipart);
await app.register(buildApp);
await app.listen({ port: 3000, host: '0.0.0.0' });
console.log('🚀 Server running at http://localhost:3000');
