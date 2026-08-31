const amqp = require('amqplib');
let channel;
async function connectRabbitMQ(url) {
  try {
    const connection = await amqp.connect(url);
    channel = connection.createChannel();
    console.log('calendar-service RabbitMQ connected');
  } catch (error) {
    console.error('calendar-service RabbitMQ error:', error.message);
  }
}
function publishEvent(routingKey, data) {
  if (channel) channel.publish('domain_events', routingKey, Buffer.from(JSON.stringify(data)));
}
module.exports = { connectRabbitMQ, publishEvent };
