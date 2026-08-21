const NoteAgent = require('../ai/agent/NoteAgent');
const { asyncHandler } = require('../middlewares');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/response');

exports.formatText = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  if (!content) {
    return next(new ApiError('Content is required', 400));
  }
  const user = await require('../models/User').findById(req.user._id);
  const formattedContent = await NoteAgent.formatText(content, user.aiConfig);
  sendSuccess(res, { formattedContent });
});

exports.summarizeNote = asyncHandler(async (req, res, next) => {
  const { noteId } = req.body;
  if (!noteId) {
    return next(new ApiError('Note ID is required', 400));
  }
  const user = await require('../models/User').findById(req.user._id);
  const updatedNote = await NoteAgent.summarizeNote(noteId, req.user._id, user.aiConfig);
  sendSuccess(res, updatedNote);
});

exports.chat = asyncHandler(async (req, res, next) => {
  const { query } = req.body;
  if (!query) {
    return next(new ApiError('Query is required', 400));
  }
  const user = await require('../models/User').findById(req.user._id);
  const response = await NoteAgent.chat(req.user._id, query, user.aiConfig);
  sendSuccess(res, { response });
});

exports.semanticSearch = asyncHandler(async (req, res, next) => {
  const { query, limit } = req.body;
  if (!query) {
    return next(new ApiError('Query is required', 400));
  }
  
  const embeddingService = require('../services/embeddingService');
  const results = await embeddingService.searchSimilarNotes(req.user._id, query, limit || 5);
  
  sendSuccess(res, results);
});
