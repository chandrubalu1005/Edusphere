const amqp = require('amqplib');
const AttendanceEvent = require('../models/AttendanceEvent');
const AssessmentEvent = require('../models/AssessmentEvent');

let channel;

async function connectRabbitMQ(url) {
  try {
    const connection = await amqp.connect(url);
    channel = await connection.createChannel();
    await channel.assertExchange('domain_events', 'topic', { durable: true });
    console.log('analytics-service RabbitMQ connected');

    // ── Attendance consumer ──────────────────────────────────────────────
    const attQueue = await channel.assertQueue('analytics_attendance_queue', { durable: true });
    await channel.bindQueue(attQueue.queue, 'domain_events', 'attendance.marked');
    channel.prefetch(20);
    channel.consume(attQueue.queue, async (msg) => {
      if (!msg) return;
      try {
        const event = JSON.parse(msg.content.toString());
        // Upsert so duplicate events from retries don't double-count
        await AttendanceEvent.findOneAndUpdate(
          { studentId: event.studentId, courseId: event.courseId, date: event.date },
          { status: event.status, markedBy: event.markedBy, markMethod: event.markMethod || 'manual', timestamp: new Date() },
          { upsert: true, new: true }
        );
        channel.ack(msg);
      } catch (err) {
        console.error('analytics: failed to process attendance.marked', err.message);
        channel.nack(msg, false, false);
      }
    });

    // ── Assessment consumer ──────────────────────────────────────────────
    const asmQueue = await channel.assertQueue('analytics_assessment_queue', { durable: true });
    await channel.bindQueue(asmQueue.queue, 'domain_events', 'assessment.graded');
    channel.consume(asmQueue.queue, async (msg) => {
      if (!msg) return;
      try {
        const event = JSON.parse(msg.content.toString());
        await AssessmentEvent.create({
          studentId:    event.studentId,
          courseId:     event.courseId,
          assessmentId: event.assessmentId,
          score:        event.score,
          totalMarks:   event.totalMarks,
          percentage:   event.percentage,
          passed:       event.passed,
        });
        channel.ack(msg);
      } catch (err) {
        console.error('analytics: failed to process assessment.graded', err.message);
        channel.nack(msg, false, false);
      }
    });

    console.log('analytics-service: consuming attendance.marked + assessment.graded');
  } catch (error) {
    console.error('analytics-service RabbitMQ error:', error.message);
    setTimeout(() => connectRabbitMQ(url), 5000);
  }
}

function publishEvent(routingKey, data) {
  if (channel) {
    channel.publish('domain_events', routingKey, Buffer.from(JSON.stringify(data)), { persistent: true });
  } else {
    console.warn('analytics-service: RabbitMQ channel not ready, event skipped');
  }
}

module.exports = { connectRabbitMQ, publishEvent };