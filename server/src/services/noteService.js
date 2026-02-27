const Note = require('../models/Note');

class NoteService {
  /**
   * Get all notes with filters
   */
  async getAll(query = {}) {
    const {
      folderId,
      search,
      tag,
      isPinned,
      isArchived = false,
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
    } = query;

    // Build filter
    const filter = {};

    if (folderId) {
      filter.folderId = folderId;
    }

    if (tag) {
      filter.tags = { $in: [tag] };
    }

    if (typeof isPinned === 'boolean') {
      filter.isPinned = isPinned;
    }

    filter.isArchived = isArchived === 'true' || isArchived === true;

    // Full-text search
    if (search) {
      // Try text search first
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort options
    const sortOptions = {};
    // Always sort pinned first
    sortOptions.isPinned = -1;
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notes, total] = await Promise.all([
      Note.find(filter)
        .populate('folderId', 'name color')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Note.countDocuments(filter),
    ]);

    return {
      notes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
        hasMore: skip + notes.length < total,
      },
    };
  }

  /**
   * Get note by ID
   */
  async getById(id) {
    const note = await Note.findById(id)
      .populate('folderId', 'name color')
      .lean();
    return note;
  }

  /**
   * Create a new note
   */
  async create(data) {
    // Sanitize tags
    if (data.tags) {
      data.tags = data.tags
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0);
    }

    const note = new Note(data);
    await note.save();

    return this.getById(note._id);
  }

  /**
   * Update a note
   */
  async update(id, data) {
    // Sanitize tags if provided
    if (data.tags) {
      data.tags = data.tags
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0);
    }

    const note = await Note.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!note) {
      return null;
    }

    return this.getById(note._id);
  }

  /**
   * Delete a note
   */
  async delete(id) {
    const note = await Note.findByIdAndDelete(id);
    return note;
  }

  /**
   * Toggle pin status
   */
  async togglePin(id) {
    const note = await Note.findById(id);
    
    if (!note) {
      return null;
    }

    note.isPinned = !note.isPinned;
    await note.save();

    return this.getById(note._id);
  }

  /**
   * Toggle archive status
   */
  async toggleArchive(id) {
    const note = await Note.findById(id);
    
    if (!note) {
      return null;
    }

    note.isArchived = !note.isArchived;
    // Unpin when archiving
    if (note.isArchived) {
      note.isPinned = false;
    }
    await note.save();

    return this.getById(note._id);
  }

  /**
   * Get all unique tags
   */
  async getAllTags() {
    const tags = await Note.distinct('tags', { isArchived: false });
    return tags.sort();
  }

  /**
   * Delete a tag from all notes
   */
  async deleteTag(tag) {
    const result = await Note.updateMany(
      { tags: tag },
      { $pull: { tags: tag } }
    );
    return { 
      modifiedCount: result.modifiedCount,
      message: `Tag "${tag}" removed from ${result.modifiedCount} notes`
    };
  }

  /**
   * Rename a tag globally
   */
  async renameTag(oldTag, newTag) {
    const normalizedNewTag = newTag.trim().toLowerCase();
    
    // Find all notes with the old tag
    const notes = await Note.find({ tags: oldTag });
    
    let modifiedCount = 0;
    for (const note of notes) {
      // Remove old tag and add new tag if not already present
      const tagIndex = note.tags.indexOf(oldTag);
      if (tagIndex > -1) {
        note.tags.splice(tagIndex, 1);
        if (!note.tags.includes(normalizedNewTag)) {
          note.tags.push(normalizedNewTag);
        }
        await note.save();
        modifiedCount++;
      }
    }
    
    return {
      modifiedCount,
      message: `Tag "${oldTag}" renamed to "${normalizedNewTag}" in ${modifiedCount} notes`
    };
  }

  /**
   * Move notes to another folder
   */
  async moveToFolder(noteIds, folderId) {
    await Note.updateMany(
      { _id: { $in: noteIds } },
      { $set: { folderId } }
    );

    return Note.find({ _id: { $in: noteIds } })
      .populate('folderId', 'name color')
      .lean();
  }

  /**
   * Bulk delete notes
   */
  async bulkDelete(noteIds) {
    const result = await Note.deleteMany({ _id: { $in: noteIds } });
    return result.deletedCount;
  }
}

module.exports = new NoteService();
