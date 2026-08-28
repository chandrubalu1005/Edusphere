import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  courseId:      string;
  title:         string;
  description:   string;
  instructions:  string;
  totalMarks:    number;
  passMarks:     number;
  dueDate:       Date;
  latePenalty:   number; // % per day after due date
  maxFileSize:   number; // MB
  allowedTypes:  string[];
  status:        'draft' | 'published' | 'closed';
  createdBy:     string;
  allowResubmit: boolean;
  rubric:        Array<{ criterion: string; maxMarks: number; description: string }>;
  deadlineOverrides: Array<{ studentId: string; dueDate: Date }>;
  groupId:       string | null;
  createdAt:     Date;
  updatedAt:     Date;
  version:       number; // for optimistic concurrency
}

const AssignmentSchema = new Schema<IAssignment>({
  courseId:      { type: String, required: true, index: true },
  title:         { type: String, required: true },
  description:   String,
  instructions:  { type: String, required: true },
  totalMarks:    { type: Number, required: true },
  passMarks:     { type: Number, required: true },
  dueDate:       { type: Date, required: true },
  latePenalty:   { type: Number, default: 5 },
  maxFileSize:   { type: Number, default: 50 },
  allowedTypes:  { type: [String], default: ['pdf', 'doc', 'docx', 'zip', 'txt', 'py', 'js', 'ts', 'java'] },
  status:        { type: String, enum: ['draft', 'published', 'closed'], default: 'draft' },
  createdBy:     { type: String, required: true },
  allowResubmit: { type: Boolean, default: false },
  rubric:        [{
    criterion:   String,
    maxMarks:    Number,
    description: String,
  }],
  deadlineOverrides: [{
    studentId: String,
    dueDate: Date
  }],
  groupId: { type: String, default: null }
}, { 
  timestamps: true,
  optimisticConcurrency: true,
  versionKey: 'version' 
});

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
