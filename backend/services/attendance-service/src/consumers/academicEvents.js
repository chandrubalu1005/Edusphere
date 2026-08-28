const { getChannel } = require('../config/rabbitmq');

const startAttendanceConsumers = async () => {
  const channel = getChannel();
  if (!channel) return console.warn('[RabbitMQ] Channel not ready. Attendance Consumers not started.');

  const exchange = 'academic_events';
  await channel.assertExchange(exchange, 'topic', { durable: true });

  const q = await channel.assertQueue('attendance_academic_updates', { durable: true });
  await channel.bindQueue(q.queue, exchange, 'academic.section.created');

  channel.consume(q.queue, async (msg) => {
    if (msg !== null) {
      const routingKey = msg.fields.routingKey;
      const content = JSON.parse(msg.content.toString());

      try {
        if (routingKey === 'academic.section.created') {
          console.log(`[Attendance Consumer] Received Section Created: ${content.data.sectionId}`);
          // TODO: Prepare attendance ledgers for this new section
        }
        channel.ack(msg);
      } catch (err) {
        console.error(`[Attendance Consumer] Error processing event:`, err);
        channel.nack(msg, false, true);
      }
    }
  });
};

module.exports = { startAttendanceConsumers };
