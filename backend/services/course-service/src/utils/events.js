const { getChannel } = require('../config/rabbitmq');

const publishEvent = async (routingKey, message) => {
  try {
    const channel = getChannel();
    if (!channel) {
      console.warn(`[RabbitMQ] Channel not available. Skipping event: ${routingKey}`);
      return;
    }
    
    const exchange = 'academic_events';
    
    // Ensure exchange exists (topic exchange for routing flexibility)
    await channel.assertExchange(exchange, 'topic', { durable: true });
    
    channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify({
        timestamp: new Date().toISOString(),
        data: message
      }))
    );
    
    console.log(`[RabbitMQ] Published event: ${routingKey}`);
  } catch (error) {
    console.error(`[RabbitMQ] Failed to publish event ${routingKey}:`, error.message);
  }
};

module.exports = {
  publishEvent,
  EVENTS: {
    COURSE_OFFERING_PUBLISHED: 'academic.offering.published',
    SECTION_CREATED: 'academic.section.created',
    FACULTY_ASSIGNED: 'academic.faculty.assigned',
    ENROLLMENT_CREATED: 'academic.enrollment.created',
    ENROLLMENT_DROPPED: 'academic.enrollment.dropped'
  }
};
