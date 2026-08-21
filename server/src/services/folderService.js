const Folder = require('../models/Folder');
const mongoose = require('mongoose');

class FolderService {
  async getAll(query = {}) {
    const { sort = 'order', order = 'asc', userId } = query;
    
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    const filter = userId ? { userId: new mongoose.Types.ObjectId(userId) } : {};

    const folders = await Folder.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'notes',
          let: { folderId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$folderId', '$$folderId'] },
                    { $eq: ['$userId', new mongoose.Types.ObjectId(userId)] }
                  ]
                }
              }
            }
          ],
          as: 'notes'
        }
      },
      {
        $addFields: {
          notesCount: { $size: '$notes' }
        }
      },
      { $project: { notes: 0 } },
      { $sort: sortOptions }
    ]);

    // Format id to _id string for frontend consistency
    return folders.map(f => {
      f.id = f._id.toString();
      return f;
    });
  }

  async getById(id, userId) {
    const filter = { _id: id };
    if (userId) filter.userId = userId;

    const folder = await Folder.findOne(filter).populate('notesCount').lean();
    return folder;
  }

  async create(data) {
    const folder = new Folder(data);
    await folder.save();
    return this.getById(folder._id, data.userId);
  }

  async update(id, userId, data) {
    const folder = await Folder.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!folder) return null;
    return this.getById(folder._id, userId);
  }

  async delete(id, userId) {
    const folder = await Folder.findOneAndDelete({ _id: id, userId });
    return folder;
  }

  async reorder(folderOrders, userId) {
    const bulkOps = folderOrders.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id, userId },
        update: { $set: { order } },
      },
    }));

    await Folder.bulkWrite(bulkOps);
    return this.getAll({ userId });
  }
}

module.exports = new FolderService();
