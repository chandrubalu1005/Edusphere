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

        // Update CourseGrade with atomic $set using Mongoose Map path
        const CourseGrade = require('../models/CourseGrade');
        await CourseGrade.findOneAndUpdate(
          { courseId: event.courseId, studentId: event.studentId },
          {
             $set: {
                [`currentGrade.assessments.${event.assessmentId}`]: {
                   score: event.score,
                   totalMarks: event.totalMarks,
                   percentage: event.percentage
                },
                'currentGrade.lastUpdatedAt': new Date()
             },
             $setOnInsert: {
                courseStatus: 'ongoing'
             }
          },
          { upsert: true, new: true }
        );

        channel.ack(msg);
      } catch (err) {
        console.error('analytics: failed to process assessment.graded', err.message);
        channel.nack(msg, false, false);
      }
    });

    // ── Course Rating consumer ──────────────────────────────────────────────
    const ratingQueue = await channel.assertQueue('analytics_rating_queue', { durable: true });
    await channel.bindQueue(ratingQueue.queue, 'domain_events', 'course.rated');
    channel.consume(ratingQueue.queue, async (msg) => {
      if (!msg) return;
      try {
        const event = JSON.parse(msg.content.toString());
        const CourseRatingEvent = require('../models/CourseRatingEvent');
        await CourseRatingEvent.findOneAndUpdate(
          { courseId: event.courseId, studentId: event.studentId },
          { rating: event.rating, department: event.department, timestamp: new Date() },
          { upsert: true, new: true }
        );
        channel.ack(msg);
      } catch (err) {
        console.error('analytics: failed to process course.rated', err.message);
        channel.nack(msg, false, false);
      }
    });

    // ── Course Completed consumer ───────────────────────────────────────────
    const closeQueue = await channel.assertQueue('analytics_course_close', { durable: true });
    await channel.bindQueue(closeQueue.queue, 'domain_events', 'course.completed');
    channel.consume(closeQueue.queue, async (msg) => {
      if (!msg) return;
      try {
        const event = JSON.parse(msg.content.toString());
        const CourseGrade = require('../models/CourseGrade');
        
        const grades = await CourseGrade.find({ courseId: event.courseId, courseStatus: 'ongoing' });
        const bulkOps = grades.map(cg => {
           let total = 0, count = 0;
           if (cg.currentGrade && cg.currentGrade.assessments) {
              for (const key of cg.currentGrade.assessments.keys()) {
                 total += cg.currentGrade.assessments.get(key).percentage;
                 count++;
              }
           }
           const finalPercentage = count > 0 ? total / count : 0;
           const passed = finalPercentage >= 50; // Threshold
           return {
              updateOne: {
                 filter: { _id: cg._id },
                 update: {
                    $set: {
                       'finalGrade.percentage': finalPercentage,
                       'finalGrade.passed': passed,
                       courseStatus: 'completed',
                       'finalGrade.finalizedAt': new Date()
                    }
                 }
              }
           };
        });
        
        if (bulkOps.length > 0) {
           await CourseGrade.bulkWrite(bulkOps);
        }
        channel.ack(msg);
      } catch (err) {
        console.error('analytics: failed to process course.completed', err.message);
        channel.nack(msg, false, false);
      }
    });

    console.log('analytics-service: consuming attendance, assessment, ratings, course.completed');
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