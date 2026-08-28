import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubmission extends Document {
  assignmentId: Types.ObjectId;
  studentId:    string;
  fileUrl:      string;
  fileName:     string;
  fileSize:     number;
  mimeType:     string;
  remarks:      string;
  grade:        number | null;
  feedback:     string;
  rubricGrades: Array<{ criterion: string; marks: number; comment: string }>;
  isLate:       boolean;
  lateDays:     number;
  penaltyApplied: number;
  finalGrade:   number | null;
  status:       'submitted' | 'graded' | 'returned';
  gradedBy:     string;
  gradedAt?:    Date;
  submittedAt:  Date;
  attempt:      number;
  plagiarismScore?: number;
  plagiarismFlags?: string[];
  disputeStatus:  'none' | 'open' | 'resolved';
  disputeReason?: string;
  disputeResolution?: string;
  version:      number;
}

const SubmissionSchema = new Schema<ISubmission>({
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
  studentId:    { type: String, required: true, index: true },
  fileUrl:      { type: String, required: true },
  fileName:     String,
  fileSize:     Number,
  mimeType:     String,
  remarks:      String,
  grade:        { type: Number, default: null },
  feedback:     String,
  rubricGrades: [{
    criterion: String,
    marks:     Number,
    comment:   String,
  }],
  isLate:         { type: Boolean, default: false },
  lateDays:       { type: Number, default: 0 },
  penaltyApplied: { type: Number, default: 0 },
  finalGrade:     { type: Number, default: null },
  status:         { type: String, enum: ['submitted', 'graded', 'returned'], default: 'submitted' },
  gradedBy:       String,
  gradedAt:       Date,
  submittedAt:    { type: Date, default: Date.now },
  attempt:        { type: Number, default: 1 },
  plagiarismScore:{ type: Number, default: null },
  plagiarismFlags:[{ type: String }],
  disputeStatus:  { type: String, enum: ['none', 'open', 'resolved'], default: 'none' },
  disputeReason:  { type: String, default: null },
  disputeResolution:{ type: String, default: null },
}, { 
  timestamps: true,
  optimisticConcurrency: true,
  versionKey: 'version' 
});

// Unique constraint: one active submission per student per assignment per attempt
SubmissionSchema.index({ assignmentId: 1, studentId: 1, attempt: -1 }, { unique: true });

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
