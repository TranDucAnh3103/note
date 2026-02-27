const { body, param, query } = require('express-validator');

exports.createNoteValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Note title is required')
    .isLength({ max: 200 })
    .withMessage('Note title cannot exceed 200 characters'),
  body('content')
    .optional()
    .isLength({ max: 100000 })
    .withMessage('Note content cannot exceed 100000 characters'),
  body('folderId')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true;
      return /^[0-9a-fA-F]{24}$/.test(value);
    })
    .withMessage('Invalid folder ID'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with max 10 items'),
  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each tag cannot exceed 50 characters'),
];

exports.updateNoteValidation = [
  param('id').isMongoId().withMessage('Invalid note ID'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Note title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Note title cannot exceed 200 characters'),
  body('content')
    .optional()
    .isLength({ max: 100000 })
    .withMessage('Note content cannot exceed 100000 characters'),
  body('folderId')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true;
      return /^[0-9a-fA-F]{24}$/.test(value);
    })
    .withMessage('Invalid folder ID'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with max 10 items'),
];

exports.noteIdValidation = [
  param('id').isMongoId().withMessage('Invalid note ID'),
];

exports.notesQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('folderId')
    .optional()
    .isMongoId()
    .withMessage('Invalid folder ID'),
];
