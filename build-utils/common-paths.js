const path = require('path');
const PROJECT_ROOT = path.resolve(__dirname, '../');

module.exports = {
  projectRoot: PROJECT_ROOT,
  outputPath: PROJECT_ROOT,
  appEntry: path.join(PROJECT_ROOT, 'src'),
};
