const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
      maxlength: [100, 'Folder name cannot exceed 100 characters'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Optional for future auth implementation
    },
    color: {
      type: String,
      default: '#6366f1', // Default indigo color
    },
    icon: {
      type: String,
      default: 'folder',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for notes count
folderSchema.virtual('notesCount', {
  ref: 'Note',
  localField: '_id',
  foreignField: 'folderId',
  count: true,
});

// Index for faster queries
folderSchema.index({ name: 1 });
folderSchema.index({ userId: 1 });
folderSchema.index({ order: 1 });

module.exports = mongoose.model('Folder', folderSchema);
