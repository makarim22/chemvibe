const fs = require('fs');
let content = fs.readFileSync('src/components/PetroleumLab.tsx', 'utf-8');
const matches = content.match(/className="([^"]*(?:bg-slate-90[05]|bg-slate-950)[^"]*)"/g);
if (matches) {
  matches.slice(0, 15).forEach(m => console.log(m));
  console.log('Total matches:', matches.length);
} else {
  console.log('No matches found');
}
