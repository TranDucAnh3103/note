const express = require('express');
const router = express.Router();
const { noteController } = require('../controllers');
const { validate } = require('../middlewares');
const {
  createNoteValidation,
  updateNoteValidation,
  noteIdValidation,
  notesQueryValidation,
} = require('../validators');

// GET /api/notes/tags - Get all tags (must be before /:id)
router.get('/tags', noteController.getAllTags);

// DELETE /api/notes/tags/:tag - Delete a tag from all notes
router.delete('/tags/:tag', noteController.deleteTag);

// PATCH /api/notes/tags/rename - Rename a tag globally
router.patch('/tags/rename', noteController.renameTag);

// GET /api/notes - Get all notes
router.get('/', notesQueryValidation, validate, noteController.getAllNotes);

// GET /api/notes/:id - Get note by ID
router.get('/:id', noteIdValidation, validate, noteController.getNoteById);

// POST /api/notes - Create a new note
router.post('/', createNoteValidation, validate, noteController.createNote);

// PUT /api/notes/:id - Update a note
router.put('/:id', updateNoteValidation, validate, noteController.updateNote);

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', noteIdValidation, validate, noteController.deleteNote);

// PATCH /api/notes/:id/pin - Toggle pin status
router.patch('/:id/pin', noteIdValidation, validate, noteController.togglePin);

// PATCH /api/notes/:id/archive - Toggle archive status
router.patch(
  '/:id/archive',
  noteIdValidation,
  validate,
  noteController.toggleArchive
);

// PATCH /api/notes/move - Move notes to folder
router.patch('/move', noteController.moveToFolder);

// POST /api/notes/bulk-delete - Bulk delete notes
router.post('/bulk-delete', noteController.bulkDelete);

module.exports = router;
