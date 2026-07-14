const fs = require('fs');
const path = require('path');
const dir = 'src/Services';

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.js')) {
    const p = path.join(dir, file);
    let content = fs.readFileSync(p, 'utf8');
    const orig = content;
    content = content.replace(/const BASE_URL = import\.meta\.env\.VITE_BASE_URL;?/g, 'const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:9060";');
    if (content !== orig) {
      fs.writeFileSync(p, content);
      console.log('Updated', file);
    }
  }
});
