import amqplib from 'amqplib';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`)
  ),
  transports: [new winston.transports.Console()],
});

let channel: amqplib.Channel;

export async function connectRabbitMQ() {
  try {
    const conn = await amqplib.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    channel = await conn.createChannel();
    await channel.assertExchange('domain_events', 'topic', { durable: true });
    logger.info('RabbitMQ connected');
  } catch (err) {
    logger.error('Failed to connect to RabbitMQ', err);
  }
}

export function publishEvent(routingKey: string, data: any) {
  if (channel) {
    channel.publish('domain_events', routingKey, Buffer.from(JSON.stringify(data)));
  }
}

export { logger };
