const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const relPath = path.relative(__dirname, fullPath);
      const depth = relPath.split(path.sep).length - 1;
      
      let relativePrefix = '';
      if (depth === 0) relativePrefix = './';
      else if (depth === 1) relativePrefix = '../';
      else if (depth === 2) relativePrefix = '../../';
      else if (depth === 3) relativePrefix = '../../../';
      else if (depth === 4) relativePrefix = '../../../../';
      else if (depth === 5) relativePrefix = '../../../../../';
      
      // Replace from '@/' and require('@/')
      let newContent = content.replace(/from\s+['"]@\//g, `from '${relativePrefix}`);
      newContent = newContent.replace(/require\(['"]@\//g, `require('${relativePrefix}`);
      
      // Fix imports for Nav and Footer to use default imports as requested
      const finalContent = newContent
        .replace(/import\s+\{\s*Nav\s*\}\s+from/g, 'import Nav from')
        .replace(/import\s+\{\s*Footer\s*\}\s+from/g, 'import Footer from')
        
      if (content !== finalContent) {
        fs.writeFileSync(fullPath, finalContent);
        console.log(`Updated: ${relPath}`);
      }
    }
  }
}

console.log('--- STARTING ALIAS REFACTOR ---');
processDir(path.join(__dirname, 'app'));
console.log('--- DONE ---');
