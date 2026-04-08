import fs from 'fs';
import path from 'path';

const dir = 'z:/Evolut/Evolut/frontend/src';

const replaceMap = [
  { search: /from-legal-blue to-legal-blue-dark/g, replace: 'from-[#2F4858] to-[#1F3645]' },
  { search: /from-legal-gold to-legal-gold-light/g, replace: 'from-[#B69B74] to-[#D4B991]' },
  { search: /text-legal-blue-dark/g, replace: 'text-[#1F3645]' },
  { search: /text-legal-blue/g, replace: 'text-[#2F4858]' },
  { search: /bg-legal-blue/g, replace: 'bg-[#2F4858]' },
  { search: /border-legal-blue/g, replace: 'border-[#2F4858]' },
  { search: /ring-legal-blue/g, replace: 'ring-[#2F4858]' },
  
  { search: /text-legal-gold/g, replace: 'text-[#B69B74]' },
  { search: /bg-legal-gold/g, replace: 'bg-[#B69B74]' },
  { search: /border-legal-gold/g, replace: 'border-[#B69B74]' },
  { search: /ring-legal-gold/g, replace: 'ring-[#B69B74]' },

  { search: /bg-amber-50/g, replace: 'bg-[#EFEDE8]' },
  { search: /text-amber-700/g, replace: 'text-[#6E3E3E]' },
  { search: /text-amber-300/g, replace: 'text-[#B69B74]' },
  { search: /border-amber-100/g, replace: 'border-[#B69B74]/30' },
  { search: /border-amber-200/g, replace: 'border-[#B69B74]/50' },
  { search: /shadow-amber-500/g, replace: 'shadow-[#B69B74]' },

  { search: /bg-legal-bg/g, replace: 'bg-[#EFEDE8]' },
  { search: /text-legal-charcoal/g, replace: 'text-[#73706E]' },

  { search: /text-red-700/g, replace: 'text-[#6E3E3E]' },
  { search: /bg-red-50/g, replace: 'bg-[#6E3E3E]/10' },
  { search: /border-red-200/g, replace: 'border-[#6E3E3E]/30' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const { search, replace } of replaceMap) {
        content = content.replace(search, replace);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(dir);
console.log('Palette applied successfully via absolute hex utilities!');
