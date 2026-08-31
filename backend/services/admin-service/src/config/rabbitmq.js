const amqp = require('amqplib');
let channel;
async function connectRabbitMQ(url) {
  try {
    const connection = await amqp.connect(url);
    channel = await connection.createChannel();
    await channel.assertExchange('domain_events', 'topic', { durable: true });
    console.log('admin-service RabbitMQ connected');
  } catch (error) {
    console.error('admin-service RabbitMQ error:', error.message);
    console.warn('Proceeding without RabbitMQ... Events will not be published.');
  }
}
function publishEvent(routingKey, data) {
  if (channel) channel.publish('domain_events', routingKey, Buffer.from(JSON.stringify(data)), { persistent: true });
}
module.exports = { connectRabbitMQ, publishEvent };

