import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// We want to pass theme={theme} to all labs inside <Suspense> or main block.
// Example: <GeometryLab /> -> <GeometryLab theme={theme} />
// Note: Some might already have it or currentUser={currentUser}
content = content.replace(/<([A-Z][a-zA-Z0-9]+Lab)\s*(currentUser=\{currentUser\})?\s*\/?>(?!.*<\/)/g, (match, p1, p2) => {
  if (match.includes('theme=')) return match;
  if (p2) return `<${p1} currentUser={currentUser} theme={theme} />`;
  return `<${p1} theme={theme} />`;
});
// Special cases
content = content.replace(/<StoichiometryCalculator \/>/g, '<StoichiometryCalculator theme={theme} />');
content = content.replace(/<TitrationSimulator \/>/g, '<TitrationSimulator theme={theme} />');
content = content.replace(/<Molecule3DViewer \/>/g, '<Molecule3DViewer theme={theme} />');

fs.writeFileSync('src/App.tsx', content);
console.log('Updated App.tsx');
