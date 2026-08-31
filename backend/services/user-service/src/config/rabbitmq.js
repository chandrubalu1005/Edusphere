const amqp = require('amqplib');
const Profile = require('../models/Profile');

let channel;

async function connectRabbitMQ(url) {
  try {
    const connection = await amqp.connect(url);
    channel = await connection.createChannel();
    await channel.assertExchange('domain_events', 'topic', { durable: true });
    
    // Assert Queue and Bind
    const q = await channel.assertQueue('user_service_queue', { durable: true });
    await channel.bindQueue(q.queue, 'domain_events', 'user.registered');
    
    channel.consume(q.queue, async (msg) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString());
        console.log(`Received user.registered event for user: ${content.userId}`);
        
        try {
          const existing = await Profile.findOne({ userId: content.userId });
          if (!existing) {
            const profile = new Profile({
              userId: content.userId,
              username: content.username,
              email: content.email,
              role: content.role || 'student'
            });
            await profile.save();
            console.log(`Initialized profile for: ${content.username}`);
          }
          channel.ack(msg);
        } catch (err) {
          console.error('Error saving profile:', err.message);
          channel.nack(msg, false, true);
        }
      }
    });

    console.log('User Service RabbitMQ Consumer configured successfully');
  } catch (error) {
    console.error('RabbitMQ connection error in User Service:', error.message);
    console.warn('Proceeding without RabbitMQ... Events will not be published.');
  }
}

module.exports = { connectRabbitMQ };

