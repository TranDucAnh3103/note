const noteService = require('../services/noteService');
const embeddingService = require('../services/embeddingService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @desc    Get all notes
 * @route   GET /api/notes
 */
exports.getAllNotes = async (req, res, next) => {
  try {
    req.query.userId = req.user._id.toString();
    const result = await noteService.getAll(req.query);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

exports.getNoteById = async (req, res, next) => {
  try {
    const note = await noteService.getById(req.params.id, req.user._id.toString());
    if (!note) return sendError(res, 'Note not found', 404);
    sendSuccess(res, note);
  } catch (error) {
    next(error);
  }
};

exports.createNote = async (req, res, next) => {
  try {
    const noteData = { ...req.body, userId: req.user._id.toString() };
    const note = await noteService.create(noteData);
    
    // Background vector processing
    embeddingService.processAndStoreNote(note).catch(err => 
      console.error('Vector DB error on create:', err.message)
    );
    
    sendSuccess(res, note, 201);
  } catch (error) {
    next(error);
  }
};

exports.updateNote = async (req, res, next) => {
  try {
    const note = await noteService.update(req.params.id, req.user._id.toString(), req.body);
    if (!note) return sendError(res, 'Note not found', 404);
    
    // Background vector processing
    embeddingService.processAndStoreNote(note).catch(err => 
      console.error('Vector DB error on update:', err.message)
    );
    
    sendSuccess(res, note);
  } catch (error) {
    next(error);
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const note = await noteService.delete(req.params.id, req.user._id.toString());
    if (!note) return sendError(res, 'Note not found', 404);
    
    // Background vector deletion
    embeddingService.deleteNoteEmbeddings(req.params.id).catch(err => 
      console.error('Vector DB error on delete:', err.message)
    );
    
    sendSuccess(res, { message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.togglePin = async (req, res, next) => {
  try {
    const note = await noteService.togglePin(req.params.id, req.user._id.toString());
    if (!note) return sendError(res, 'Note not found', 404);
    sendSuccess(res, note);
  } catch (error) {
    next(error);
  }
};

exports.toggleArchive = async (req, res, next) => {
  try {
    const note = await noteService.toggleArchive(req.params.id, req.user._id.toString());
    if (!note) return sendError(res, 'Note not found', 404);
    sendSuccess(res, note);
  } catch (error) {
    next(error);
  }
};

exports.getAllTags = async (req, res, next) => {
  try {
    const tags = await noteService.getAllTags(req.user._id.toString());
    sendSuccess(res, tags);
  } catch (error) {
    next(error);
  }
};

exports.deleteTag = async (req, res, next) => {
  try {
    const { tag } = req.params;
    const result = await noteService.deleteTag(decodeURIComponent(tag), req.user._id.toString());
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

exports.renameTag = async (req, res, next) => {
  try {
    const { oldTag, newTag } = req.body;
    const result = await noteService.renameTag(oldTag, newTag, req.user._id.toString());
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

exports.moveToFolder = async (req, res, next) => {
  try {
    const { noteIds, folderId } = req.body;
    const notes = await noteService.moveToFolder(noteIds, folderId, req.user._id.toString());
    sendSuccess(res, notes);
  } catch (error) {
    next(error);
  }
};

exports.restoreNote = async (req, res, next) => {
  try {
    const note = await noteService.restore(req.params.id, req.user._id.toString());
    if (!note) return sendError(res, 'Note not found in trash', 404);
    
    sendSuccess(res, note);
  } catch (error) {
    next(error);
  }
};

exports.bulkDelete = async (req, res, next) => {
  try {
    const { noteIds } = req.body;
    const deletedCount = await noteService.bulkDelete(noteIds, req.user._id.toString());
    sendSuccess(res, { deletedCount });
  } catch (error) {
    next(error);
  }
};

exports.emptyTrash = async (req, res, next) => {
  try {
    const noteIds = await noteService.emptyTrash(req.user._id.toString());
    
    // Delete from pgvector
    if (noteIds.length > 0) {
      const embeddingService = require('../services/embeddingService');
      for (const id of noteIds) {
        embeddingService.deleteNoteEmbeddings(id).catch(err => 
          console.error('Vector DB error on delete:', err.message)
        );
      }
    }
    
    sendSuccess(res, { deletedCount: noteIds.length });
  } catch (error) {
    next(error);
  }
};
