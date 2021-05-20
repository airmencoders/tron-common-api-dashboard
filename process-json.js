const filePath = './src/api/model-types.json';
let fs = require('fs');
let obj = fs.readFileSync(filePath, 'utf8');
obj = obj.replace(/"\$ref": "#/g, '"$ref": "model-types.json#');
fs.writeFileSync(filePath, obj);
