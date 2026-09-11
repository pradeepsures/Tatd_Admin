const fs = require('fs');
let content = fs.readFileSync('admin.txt', 'utf8');
const regex = /"name":\s*"([^"]+)",[\s\S]*?"request":\s*{[\s\S]*?"url":\s*{[\s\S]*?"raw":\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(content)) !== null) {
    const name = match[1];
    const url = match[2];
    if (name.toLowerCase().includes('state') || name.toLowerCase().includes('city') || name.toLowerCase().includes('cities')) {
        console.log(name, "->", url);
    }
}
