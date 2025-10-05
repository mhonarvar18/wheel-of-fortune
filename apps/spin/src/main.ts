import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { SpinModule } from './spin.module';
import mysql from 'mysql2/promise';

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
  });

  const dbName = process.env.DB_NAME || 'spin_db';
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
  );
  await connection.end();
  console.log(`✅ Database ensured: ${dbName}`);
}

async function bootstrap() {
  const servers = [process.env.NATS_URL || 'nats://127.0.0.1:4222'];

  await ensureDatabaseExists();

  const app = await NestFactory.createMicroservice(SpinModule, {
    transport: Transport.NATS,
    options: {
      servers,
      tls: false, // روی Docker محلی TLS نداریم
      noRandomize: true, // اتصال پایدارتر
      reconnect: true,
      maxReconnectAttempts: -1,
      reconnectTimeWait: 1000,
      pingInterval: 5000,
      timeout: 2000,
      verbose: true,
    },
  });

  // ✅ نسخه امن برای خطاها
  process.on('unhandledRejection', (e: unknown) => {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[unhandledRejection]', msg);
  });

  process.on('uncaughtException', (e: unknown) => {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[uncaughtException]', msg);
  });

  await app.listen();
  console.log('✅ Spin microservice connected to NATS');
}

bootstrap();
