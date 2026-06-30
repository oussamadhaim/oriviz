const fs = require('fs');
const content = fs.readFileSync('/Users/oussama/.gemini/antigravity-ide/brain/139c4863-9973-41df-8b0b-d69ce4a99f17/.system_generated/steps/279/content.md', 'utf8');
const lines = content.split('\n');
const images = [];
lines.forEach(l => {
  if (l.includes('https://lohause.com/cdn/shop/products/') || l.includes('https://lohause.com/cdn/shop/files/')) {
    const match = l.match(/https:\/\/lohause\.com\/cdn\/shop\/(products|files)\/[a-zA-Z0-9_\-\.]+\?(v=[0-9]+&)?width=3000/g);
    if (match) images.push(...match);
  }
});
console.log(images.slice(0, 10).join('\n'));
