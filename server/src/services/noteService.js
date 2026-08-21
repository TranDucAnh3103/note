const Note = require('../models/Note');

class NoteService {
  async getAll(query = {}) {
    const { folderId, search, tag, isPinned, isArchived = false, isDeleted = false, page = 1, limit = 20, sort = 'createdAt', order = 'desc', userId } = query;
    const filter = { userId };
    
    if (isDeleted === 'true' || isDeleted === true) {
      filter.deletedAt = { $ne: null };
    } else {
      filter.deletedAt = null;
      if (folderId) filter.folderId = folderId;
      if (tag) filter.tags = { $in: [tag] };
      if (typeof isPinned === 'boolean') filter.isPinned = isPinned;
      filter.isArchived = isArchived === 'true' || isArchived === true;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;
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
      },
    };
  }

  async getById(id, userId) {
    const note = await Note.findOne({ _id: id, userId, deletedAt: null }).populate('folderId', 'name color').lean();
    return note;
  }

  async create(data) {
    if (data.tags) {
      data.tags = data.tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);
    }
    const note = new Note(data);
    await note.save();
    return this.getById(note._id, data.userId);
  }

  async update(id, userId, data) {
    if (data.tags) {
      data.tags = data.tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);
    }
    const note = await Note.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!note) return null;
    return this.getById(note._id, userId);
  }

  async delete(id, userId) {
    const note = await Note.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { $set: { deletedAt: new Date(), isPinned: false } },
      { new: true }
    );
    return note;
  }
  
  async restore(id, userId) {
    const note = await Note.findOneAndUpdate(
      { _id: id, userId, deletedAt: { $ne: null } },
      { $set: { deletedAt: null } },
      { new: true }
    );
    return note;
  }

  async togglePin(id, userId) {
    const note = await Note.findOne({ _id: id, userId, deletedAt: null });
    if (!note) return null;
    note.isPinned = !note.isPinned;
    await note.save();
    return this.getById(note._id, userId);
  }

  async toggleArchive(id, userId) {
    const note = await Note.findOne({ _id: id, userId, deletedAt: null });
    if (!note) return null;
    note.isArchived = !note.isArchived;
    if (note.isArchived) note.isPinned = false;
    await note.save();
    return this.getById(note._id, userId);
  }

  async getAllTags(userId) {
    const tags = await Note.distinct('tags', { userId, deletedAt: null });
    return tags.sort();
  }

  async deleteTag(tag, userId) {
    const result = await Note.updateMany(
      { userId, tags: tag, deletedAt: null },
      { $pull: { tags: tag } }
    );
    return { modifiedCount: result.modifiedCount };
  }

  async renameTag(oldTag, newTag, userId) {
    const formattedNewTag = newTag.trim().toLowerCase();
    const result = await Note.updateMany(
      { userId, tags: oldTag, deletedAt: null },
      { $set: { 'tags.$': formattedNewTag } }
    );
    return { modifiedCount: result.modifiedCount };
  }

  async moveToFolder(noteIds, folderId, userId) {
    const result = await Note.updateMany(
      { _id: { $in: noteIds }, userId, deletedAt: null },
      { $set: { folderId: folderId || null } }
    );
    return { modifiedCount: result.modifiedCount };
  }

  async bulkDelete(noteIds, userId) {
    const result = await Note.updateMany(
      { _id: { $in: noteIds }, userId, deletedAt: null },
      { $set: { deletedAt: new Date(), isPinned: false } }
    );
    return result.modifiedCount; // Return modified instead of deleted
  }
  
  async emptyTrash(userId) {
    const notesToDelete = await Note.find({ userId, deletedAt: { $ne: null } }, '_id').lean();
    const noteIds = notesToDelete.map(n => n._id);
    
    if (noteIds.length > 0) {
      await Note.deleteMany({ _id: { $in: noteIds }, userId });
    }
    
    return noteIds; // Return ids to delete from vector db
  }
}

module.exports = new NoteService();
