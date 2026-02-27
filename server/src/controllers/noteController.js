const noteService = require('../services/noteService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @desc    Get all notes
 * @route   GET /api/notes
 */
exports.getAllNotes = async (req, res, next) => {
  try {
    const result = await noteService.getAll(req.query);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get note by ID
 * @route   GET /api/notes/:id
 */
exports.getNoteById = async (req, res, next) => {
  try {
    const note = await noteService.getById(req.params.id);

    if (!note) {
      return sendError(res, 'Note not found', 404);
    }

    sendSuccess(res, note);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new note
 * @route   POST /api/notes
 */
exports.createNote = async (req, res, next) => {
  try {
    const note = await noteService.create(req.body);
    sendSuccess(res, note, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a note
 * @route   PUT /api/notes/:id
 */
exports.updateNote = async (req, res, next) => {
  try {
    const note = await noteService.update(req.params.id, req.body);

    if (!note) {
      return sendError(res, 'Note not found', 404);
    }

    sendSuccess(res, note);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a note
 * @route   DELETE /api/notes/:id
 */
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await noteService.delete(req.params.id);

    if (!note) {
      return sendError(res, 'Note not found', 404);
    }

    sendSuccess(res, { message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle pin status
 * @route   PATCH /api/notes/:id/pin
 */
exports.togglePin = async (req, res, next) => {
  try {
    const note = await noteService.togglePin(req.params.id);

    if (!note) {
      return sendError(res, 'Note not found', 404);
    }

    sendSuccess(res, note);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle archive status
 * @route   PATCH /api/notes/:id/archive
 */
exports.toggleArchive = async (req, res, next) => {
  try {
    const note = await noteService.toggleArchive(req.params.id);

    if (!note) {
      return sendError(res, 'Note not found', 404);
    }

    sendSuccess(res, note);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tags
 * @route   GET /api/notes/tags
 */
exports.getAllTags = async (req, res, next) => {
  try {
    const tags = await noteService.getAllTags();
    sendSuccess(res, tags);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a tag from all notes
 * @route   DELETE /api/notes/tags/:tag
 */
exports.deleteTag = async (req, res, next) => {
  try {
    const { tag } = req.params;
    const result = await noteService.deleteTag(decodeURIComponent(tag));
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Rename a tag globally
 * @route   PATCH /api/notes/tags/rename
 */
exports.renameTag = async (req, res, next) => {
  try {
    const { oldTag, newTag } = req.body;
    const result = await noteService.renameTag(oldTag, newTag);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Move notes to folder
 * @route   PATCH /api/notes/move
 */
exports.moveToFolder = async (req, res, next) => {
  try {
    const { noteIds, folderId } = req.body;
    const notes = await noteService.moveToFolder(noteIds, folderId);
    sendSuccess(res, notes);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk delete notes
 * @route   POST /api/notes/bulk-delete
 */
exports.bulkDelete = async (req, res, next) => {
  try {
    const { noteIds } = req.body;
    const deletedCount = await noteService.bulkDelete(noteIds);
    sendSuccess(res, { deletedCount });
  } catch (error) {
    next(error);
  }
};
