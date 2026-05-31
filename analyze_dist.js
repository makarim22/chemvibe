const fs = require('fs');
const jsFIle = fs.readdirSync('dist/assets').find(f => f.startsWith('index-') && f.endsWith('.js'));
const content = fs.readFileSync('dist/assets/' + jsFIle, 'utf-8');

let lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('theme ===') || line.includes('theme }') || line.includes('{ theme')) return;
  // If we just check via a naive AST or quick regex if theme is used alone
});
console.log('Use grep -n " theme " dist/assets/' + jsFIle);
