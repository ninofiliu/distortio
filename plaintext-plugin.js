const fs = require('fs');

module.exports = () => ({
  name: 'plaintext',
  resolve: {
    input: ['.glsl'],
    output: ['.js'],
  },
  async load({ filePath }) {
    const content = await fs.promises.readFile(filePath, 'utf8');
    return `export default ${JSON.stringify(content)}`;
  },
});
