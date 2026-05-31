import * as fs from 'fs';
import * as path from 'path';

function check() {
  const compDir = path.join(process.cwd(), 'src/components');
  const files = fs.readdirSync(compDir).filter(f => f.endsWith('.tsx'));
  
  for (const f of files) {
    const content = fs.readFileSync(path.join(compDir, f), 'utf-8');
    
    // Are there ANY "theme ===" inside this file?
    if (content.includes('theme ===')) {
      // Is "theme" defined as a prop, or global, or local variable anywhere in the file?
      // Either `theme = 'dark'` or `const theme` or `let theme` or inside a type or interface:
      if (!content.includes('theme?:') && !content.includes('theme:') && !content.includes('theme =') && !content.includes('const theme') && !content.includes('{ theme }')) {
        console.log(`theme is used but NOT DECLARED AT ALL in ${f}`);
      }
    }
  }
}
check();
