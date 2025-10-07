import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { BillingModule } from './billing.module';
import mysql from 'mysql2/promise';

async function ensureDatabaseExists() {
  const host = process.env.BILLING_DB_HOST || '127.0.0.1';
  const port = Number(process.env.BILLING_DB_PORT || 3306);
  const user = process.env.BILLING_DB_USER || 'root';
  const pass = process.env.BILLING_DB_PASS || 'root';
  const name = process.env.BILLING_DB_NAME || 'billing_db';

  const connection = await mysql.createConnection({ host, port, user, password: pass });
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
  );
  await connection.end();
  console.log(`✅ Database ensured: ${name}`);
}

async function bootstrap() {
  await ensureDatabaseExists();
  const app = await NestFactory.createMicroservice(BillingModule, {
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL || 'nats://127.0.0.1:4222'],
      tls: false,
      noRandomize: true,
      reconnect: true,
      maxReconnectAttempts: -1,
      reconnectTimeWait: 1000,
      pingInterval: 5000,
      timeout: 2000,
      verbose: true,
    },
  });
  await app.listen();
  console.log('✅ Billing microservice connected to NATS');
}
bootstrap();
