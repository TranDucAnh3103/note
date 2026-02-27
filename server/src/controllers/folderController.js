const folderService = require('../services/folderService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @desc    Get all folders
 * @route   GET /api/folders
 */
exports.getAllFolders = async (req, res, next) => {
  try {
    const folders = await folderService.getAll(req.query);
    sendSuccess(res, folders);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get folder by ID
 * @route   GET /api/folders/:id
 */
exports.getFolderById = async (req, res, next) => {
  try {
    const folder = await folderService.getById(req.params.id);

    if (!folder) {
      return sendError(res, 'Folder not found', 404);
    }

    sendSuccess(res, folder);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new folder
 * @route   POST /api/folders
 */
exports.createFolder = async (req, res, next) => {
  try {
    const folder = await folderService.create(req.body);
    sendSuccess(res, folder, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a folder
 * @route   PUT /api/folders/:id
 */
exports.updateFolder = async (req, res, next) => {
  try {
    const folder = await folderService.update(req.params.id, req.body);

    if (!folder) {
      return sendError(res, 'Folder not found', 404);
    }

    sendSuccess(res, folder);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a folder
 * @route   DELETE /api/folders/:id
 */
exports.deleteFolder = async (req, res, next) => {
  try {
    const folder = await folderService.delete(req.params.id);

    if (!folder) {
      return sendError(res, 'Folder not found', 404);
    }

    sendSuccess(res, { message: 'Folder deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reorder folders
 * @route   PATCH /api/folders/reorder
 */
exports.reorderFolders = async (req, res, next) => {
  try {
    const { folders: folderOrders } = req.body;
    const folders = await folderService.reorder(folderOrders);
    sendSuccess(res, folders);
  } catch (error) {
    next(error);
  }
};
