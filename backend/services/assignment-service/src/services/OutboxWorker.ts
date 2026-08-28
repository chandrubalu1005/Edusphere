import { OutboxEvent } from '../models/OutboxEvent';
import { publishEvent, logger } from '../events/rabbitmq';

export class OutboxWorker {
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.processPendingEvents(), 5000);
    logger.info('OutboxWorker started, polling every 5s');
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private async processPendingEvents() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    try {
      // Find up to 50 pending events to process, locking them (not strictly locked, but we fetch)
      // Since it's a single instance running this loop, this is safe enough. 
      // In multi-instance we would need findOneAndUpdate with state transitions.
      const events = await OutboxEvent.find({ status: 'pending' }).limit(50).sort({ createdAt: 1 });
      
      for (const event of events) {
        try {
          publishEvent(event.eventType, event.payload);
          event.status = 'processed';
          event.processedAt = new Date();
          await event.save();
        } catch (err: any) {
          logger.error(`Failed to process OutboxEvent ${event._id}: ${err.message}`);
          event.retryCount += 1;
          if (event.retryCount > 3) {
            event.status = 'failed';
          }
          event.error = err.message;
          await event.save();
        }
      }
    } catch (err) {
      logger.error('OutboxWorker error querying database', err);
    } finally {
      this.isProcessing = false;
    }
  }
}

export const outboxWorker = new OutboxWorker();
