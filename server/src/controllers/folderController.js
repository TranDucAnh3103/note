const folderService = require('../services/folderService');
const { sendSuccess, sendError } = require('../utils/response');

exports.getAllFolders = async (req, res, next) => {
  try {
    const query = { ...req.query, userId: req.user._id.toString() };
    const folders = await folderService.getAll(query);
    sendSuccess(res, folders);
  } catch (error) {
    next(error);
  }
};

exports.getFolderById = async (req, res, next) => {
  try {
    const folder = await folderService.getById(req.params.id, req.user._id.toString());
    if (!folder) return sendError(res, 'Folder not found', 404);
    sendSuccess(res, folder);
  } catch (error) {
    next(error);
  }
};

exports.createFolder = async (req, res, next) => {
  try {
    const folderData = { ...req.body, userId: req.user._id.toString() };
    const folder = await folderService.create(folderData);
    sendSuccess(res, folder, 201);
  } catch (error) {
    next(error);
  }
};

exports.updateFolder = async (req, res, next) => {
  try {
    const folder = await folderService.update(req.params.id, req.user._id.toString(), req.body);
    if (!folder) return sendError(res, 'Folder not found', 404);
    sendSuccess(res, folder);
  } catch (error) {
    next(error);
  }
};

exports.deleteFolder = async (req, res, next) => {
  try {
    const folder = await folderService.delete(req.params.id, req.user._id.toString());
    if (!folder) return sendError(res, 'Folder not found', 404);
    sendSuccess(res, { message: 'Folder deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.reorderFolders = async (req, res, next) => {
  try {
    const { folders: folderOrders } = req.body;
    const folders = await folderService.reorder(folderOrders, req.user._id.toString());
    sendSuccess(res, folders);
  } catch (error) {
    next(error);
  }
};
