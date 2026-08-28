const { getChannel } = require('../config/rabbitmq');
// Import models when ready
// const Timetable = require('../models/Timetable');

const startAcademicEventConsumers = async () => {
  const channel = getChannel();
  if (!channel) return console.warn('[RabbitMQ] Channel not ready. Consumers not started.');

  const exchange = 'academic_events';
  await channel.assertExchange(exchange, 'topic', { durable: true });

  // Queue for timetable updates based on academic events
  const q = await channel.assertQueue('timetable_academic_updates', { durable: true });
  
  // Bind to enrollment and section events
  await channel.bindQueue(q.queue, exchange, 'academic.enrollment.created');
  await channel.bindQueue(q.queue, exchange, 'academic.section.created');

  channel.consume(q.queue, async (msg) => {
    if (msg !== null) {
      const routingKey = msg.fields.routingKey;
      const content = JSON.parse(msg.content.toString());

      try {
        if (routingKey === 'academic.enrollment.created') {
          console.log(`[Timetable Consumer] Received Enrollment for Student ${content.data.studentId}, Section ${content.data.sectionId}`);
          // TODO: Look up section schedule in timetable-service DB
          // TODO: Add student to personal timetable entries for that section
        } else if (routingKey === 'academic.section.created') {
          console.log(`[Timetable Consumer] Received Section Created: ${content.data.sectionId}`);
          // TODO: Initialize master timetable blocks for this section
        }
        
        channel.ack(msg);
      } catch (err) {
        console.error(`[Timetable Consumer] Error processing event:`, err);
        // Nack to requeue if transient error
        channel.nack(msg, false, true);
      }
    }
  });
};

module.exports = { startAcademicEventConsumers };
