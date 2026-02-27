const Folder = require('../models/Folder');

class FolderService {
  /**
   * Get all folders
   */
  async getAll(query = {}) {
    const { sort = 'order', order = 'asc' } = query;
    
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    const folders = await Folder.find()
      .populate('notesCount')
      .sort(sortOptions)
      .lean();

    return folders;
  }

  /**
   * Get folder by ID
   */
  async getById(id) {
    const folder = await Folder.findById(id).populate('notesCount').lean();
    return folder;
  }

  /**
   * Create a new folder
   */
  async create(data) {
    const folder = new Folder(data);
    await folder.save();
    
    // Return with virtual populated
    return this.getById(folder._id);
  }

  /**
   * Update a folder
   */
  async update(id, data) {
    const folder = await Folder.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!folder) {
      return null;
    }

    return this.getById(folder._id);
  }

  /**
   * Delete a folder
   */
  async delete(id) {
    const folder = await Folder.findByIdAndDelete(id);
    return folder;
  }

  /**
   * Reorder folders
   */
  async reorder(folderOrders) {
    const bulkOps = folderOrders.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order } },
      },
    }));

    await Folder.bulkWrite(bulkOps);
    return this.getAll();
  }
}

module.exports = new FolderService();
