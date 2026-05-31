import * as fs from 'fs';
import * as path from 'path';

function processComponent(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Insert theme into Props or component signature.
  // Many components look like: `export default function XYZ() {`
  // or `export default function XYZ({ currentUser }: XYZProps) {`
  
  if (!content.includes('theme = \'dark\'') && !content.includes('theme: \'dark\'') && !content.includes('theme?: \'dark\'')) {
    // If it doesn't have theme yet.
    // Replace `export default function ComponentName() {`
    // with `export default function ComponentName({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {`
    content = content.replace(/export default function ([A-Za-z0-9_]+)\(\s*\)\s*\{/, "export default function $1({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {");
    
    // Replace `export default function ComponentName({ currentUser }: CompProps) {`
    let matchWithProps = content.match(/export default function ([A-Za-z0-9_]+)\(\s*\{\s*(.*?)\s*\}\s*:\s*([A-Za-z0-9_]+Props)\s*\)\s*\{/);
    if (matchWithProps) {
      const compName = matchWithProps[1];
      const destructures = matchWithProps[2];
      const propsName = matchWithProps[3];
      
      // We must add theme to Props interface
      content = content.replace(new RegExp(`interface ${propsName} \\{`), `interface ${propsName} {\n  theme?: 'dark' | 'light';`);
      
      // And add it to the signature
      if (!destructures.includes('theme')) {
        content = content.replace(matchWithProps[0], `export default function ${compName}({ ${destructures}, theme = 'dark' }: ${propsName}) {`);
      }
    }
  }

  // Now apply the generic replacers
  const genericReplacer = [{
    find: /className="([^"]*(?:bg-slate-9[05][05](?:\/\d+)?|bg-\[#030712\])[^"]*)"/g,
    replace: (match, p1) => {
      let darkClasses = [];
      let lightClasses = [];
      let otherClasses = [];

      p1.split(/\s+/).forEach(cls => {
        if (!cls) return;
        if (cls.startsWith('bg-slate-9') || cls.startsWith('bg-[#030712]')) {
          darkClasses.push(cls);
          if (cls.includes('/')) lightClasses.push('bg-slate-100/' + cls.split('/')[1]);
          else lightClasses.push('bg-slate-100');
        } else if (cls.startsWith('border-slate-8') || cls.startsWith('border-slate-9')) {
          darkClasses.push(cls);
          lightClasses.push('border-slate-300');
        } else if (cls.startsWith('text-white') || cls.startsWith('text-slate-100') || cls.startsWith('text-slate-200')) {
          darkClasses.push(cls);
          lightClasses.push('text-slate-900');
        } else if (cls.startsWith('text-zinc-4') || cls.startsWith('text-zinc-5') || cls.startsWith('text-slate-3') || cls.startsWith('text-slate-4') || cls.startsWith('text-slate-5')) {
          darkClasses.push(cls);
          lightClasses.push('text-slate-600');
        } else if (cls.startsWith('hover:bg-slate-9')) {
          darkClasses.push(cls);
          lightClasses.push('hover:bg-slate-200');
        } else if (cls.startsWith('hover:border-slate-7') || cls.startsWith('hover:border-slate-8') || cls.startsWith('hover:border-zinc-7')) {
          darkClasses.push(cls);
          lightClasses.push('hover:border-slate-400');
        } else if (cls.startsWith('hover:text-white')) {
          darkClasses.push(cls);
          lightClasses.push('hover:text-slate-900');
        } else {
          otherClasses.push(cls);
        }
      });

      if (darkClasses.length === 0) return match;

      return `className={\`${otherClasses.join(' ')} \${theme === 'dark' ? '${darkClasses.join(' ')}' : '${lightClasses.join(' ')}'}\`}`;
    }
  }];

  let original = content;
  genericReplacer.forEach(r => {
    content = content.replace(r.find, r.replace);
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

const componentsDir = 'src/components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  processComponent(path.join(componentsDir, file));
}
