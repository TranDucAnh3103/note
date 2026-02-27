const express = require('express');
const router = express.Router();
const { folderController } = require('../controllers');
const { validate } = require('../middlewares');
const {
  createFolderValidation,
  updateFolderValidation,
  folderIdValidation,
} = require('../validators');

// GET /api/folders - Get all folders
router.get('/', folderController.getAllFolders);

// GET /api/folders/:id - Get folder by ID
router.get(
  '/:id',
  folderIdValidation,
  validate,
  folderController.getFolderById
);

// POST /api/folders - Create a new folder
router.post(
  '/',
  createFolderValidation,
  validate,
  folderController.createFolder
);

// PUT /api/folders/:id - Update a folder
router.put(
  '/:id',
  updateFolderValidation,
  validate,
  folderController.updateFolder
);

// DELETE /api/folders/:id - Delete a folder
router.delete(
  '/:id',
  folderIdValidation,
  validate,
  folderController.deleteFolder
);

// PATCH /api/folders/reorder - Reorder folders
router.patch('/reorder', folderController.reorderFolders);

module.exports = router;
