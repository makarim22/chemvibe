import * as fs from 'fs';
import * as path from 'path';

const componentsDir = 'src/components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

let errors = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(componentsDir, file), 'utf-8');
  if (content.includes("theme === 'dark'")) {
    if (!content.includes("theme: 'dark' | 'light'") && !content.includes("theme?: 'dark' | 'light'") && !content.includes("theme = 'dark'") && !content.includes("theme = \"dark\"") && !content.includes("const theme")) {
      errors.push(file);
    }
  }
}

if (errors.length > 0) {
  console.log("Files missing theme prop:", errors);
} else {
  console.log("No files missing theme prop based on naive check.");
}
