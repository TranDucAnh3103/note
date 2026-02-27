const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [200, 'Note title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      default: '',
      maxlength: [100000, 'Note content cannot exceed 100000 characters'],
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Optional for future auth implementation
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags) {
          return tags.length <= 10;
        },
        message: 'Cannot have more than 10 tags',
      },
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: null,
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

// Create text index for full-text search
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Compound indexes for common queries
noteSchema.index({ folderId: 1, createdAt: -1 });
noteSchema.index({ isPinned: -1, createdAt: -1 });
noteSchema.index({ isArchived: 1, createdAt: -1 });
noteSchema.index({ tags: 1 });
noteSchema.index({ userId: 1 });

// Virtual for preview (first 150 chars of content)
noteSchema.virtual('preview').get(function () {
  if (!this.content) return '';
  return this.content.substring(0, 150) + (this.content.length > 150 ? '...' : '');
});

module.exports = mongoose.model('Note', noteSchema);
