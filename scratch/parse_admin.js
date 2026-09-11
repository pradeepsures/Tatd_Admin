const fs = require('fs');
let content = fs.readFileSync('admin.txt', 'utf8');
try {
    // Attempt to fix JSON if it's just an array item
    if (content.trim().startsWith('{')) {
        content = '[' + content + ']';
    }
    const data = JSON.parse(content);
    const walk = (node, path) => {
        if(node.request) {
            console.log(path + ' -> ' + node.name + ' [' + node.request.method + ']');
        } else if (node.item) {
            node.item.forEach(i => walk(i, path ? path + '/' + (node.name||'') : (node.name||'')));
        }
    };
    if (Array.isArray(data)) {
        data.forEach(d => walk(d, ''));
    } else {
        walk(data, '');
    }
} catch(e) {
    console.error('Failed to parse: ', e.message);
    // Let's try basic regex matching for names
    const regex = /"name":\s*"([^"]+)"/g;
    let match;
    const names = [];
    while ((match = regex.exec(content)) !== null) {
        names.push(match[1]);
    }
    console.log("Extracted names:", [...new Set(names)].join(', '));
}
