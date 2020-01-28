const fs = require('fs');

console.log('Deleting file: index.html');

fs.unlinkSync('./src/index.html');

console.log('Deleted file: index.html');

console.log('Renaming file: theme.html to index.html');

fs.renameSync('./src/theme.html', './src/index.html')

console.log('Renamed file: theme.html to index.html');