const amqp = require('amqplib');

let channel;

async function connectRabbitMQ(url) {
  try {
    const connection = await amqp.connect(url);
    channel = await connection.createChannel();
    await channel.assertExchange('domain_events', 'topic', { durable: true });
    console.log('Connected to RabbitMQ in Course Service');
  } catch (error) {
    console.error('RabbitMQ connection error in Course Service:', error.message);
    console.warn('Proceeding without RabbitMQ... Events will not be published.');
  }
}

function publishEvent(routingKey, data) {
  if (channel) {
    channel.publish('domain_events', routingKey, Buffer.from(JSON.stringify(data)), { persistent: true });
    console.log(`Event published from Course Service: ${routingKey}`);
  } else {
    console.warn('RabbitMQ channel not established, event skipped');
  }
}

module.exports = { connectRabbitMQ, publishEvent };

