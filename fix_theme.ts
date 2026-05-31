import * as fs from 'fs';

function makeThemeAware(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // We find className="... bg-slate-9XX ... border-slate-8XX ..." and we want to replace it.
  // Wait, the simplest way is to manually replace the remaining ones using standard regex.

  const genericReplacer = [{
    // Replace: className="xxx bg-slate-9xx yyy border-slate-8xx zzz"
    find: /className="([^"]*(?:bg-slate-9[05][05](?:\/\d+)?)[^"]*)"/g,
    replace: (match, p1) => {
      // Find the dark background and border, text colors
      let darkClasses = [];
      let lightClasses = [];
      let otherClasses = [];

      p1.split(/\s+/).forEach(cls => {
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
        } else if (cls.startsWith('text-zinc-4') || cls.startsWith('text-zinc-5') || cls.startsWith('text-slate-4') || cls.startsWith('text-slate-5')) {
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

makeThemeAware('src/components/PetroleumLab.tsx');
makeThemeAware('src/components/ColloidLab.tsx');
makeThemeAware('src/components/AcidBaseIntroLab.tsx');
