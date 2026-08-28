import mongoose, { Schema, Document } from 'mongoose';

export interface IOutboxEvent extends Document {
  eventType: string;
  payload: any;
  status: 'pending' | 'processed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
  error?: string;
  retryCount: number;
}

const OutboxEventSchema = new Schema<IOutboxEvent>({
  eventType: { type: String, required: true },
  payload:   { type: Schema.Types.Mixed, required: true },
  status:    { type: String, enum: ['pending', 'processed', 'failed'], default: 'pending', index: true },
  processedAt: Date,
  error: String,
  retryCount: { type: Number, default: 0 }
}, { 
  timestamps: true 
});

export const OutboxEvent = mongoose.model<IOutboxEvent>('OutboxEvent', OutboxEventSchema);
