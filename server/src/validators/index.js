const folderValidator = require('./folderValidator');
const noteValidator = require('./noteValidator');

module.exports = {
  ...folderValidator,
  ...noteValidator,
};
