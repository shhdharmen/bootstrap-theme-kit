const fs = require('fs');

console.log('➡️ Deleting file: index.html');

fs.unlinkSync('./src/index.html');

console.log('✔️ Deleted file: index.html');

console.log('➡️ Renaming file: theme.html to index.html');

fs.renameSync('./src/theme.html', './src/index.html')

console.log('✔️ Renamed file: theme.html to index.html');

console.log('➡️ Changing content of README.md');

fs.writeFileSync('./README.md',
    `# Your theme name

## Credits
Generated using [Bootstrap theme kit](https://shhdharmen.github.io/bootstrap-theme-kit/);
`);

console.log('✔️ Changed content of README.md');