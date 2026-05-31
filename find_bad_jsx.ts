import * as fs from 'fs';
import * as path from 'path';

function findBadJSX() {
  const dir = path.join(process.cwd(), 'src/components');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
  
  for (const f of files) {
    const content = fs.readFileSync(path.join(dir, f), 'utf-8');
    
    // Check for `className={\`... \${...}\`}> ` which is invalid JSX if the > is literal
    if (content.match(/className=\{`.*`\}>/)) {
        console.log("Found > inside className string in", f);
    }

    // Check for `className={\`...\`} ` (with an extra trailing something) 
    // that might have broken HTML parsing
    // Check if there are backticks inside backticks
    const matches = content.match(/className=\{`[^`]*`[^}]*}/g);
    // this regex might fail, let's just look for any obvious parser errors using acorn-jsx.
    // Wait, let's use the TypeScript compiler API to parse them perfectly and see if we get ANY diagnostic!
  }
}
findBadJSX();
