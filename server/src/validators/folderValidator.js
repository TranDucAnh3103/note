const { body, param, query } = require('express-validator');

exports.createFolderValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Folder name is required')
    .isLength({ max: 100 })
    .withMessage('Folder name cannot exceed 100 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Invalid color format'),
];

exports.updateFolderValidation = [
  param('id').isMongoId().withMessage('Invalid folder ID'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Folder name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Folder name cannot exceed 100 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Invalid color format'),
];

exports.folderIdValidation = [
  param('id').isMongoId().withMessage('Invalid folder ID'),
];
