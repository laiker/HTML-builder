const fspromise = require('fs/promises');
const path = require('path');
const fs = require('fs');
const pathFolder = path.join('03-files-in-folder', 'secret-folder');
const filesPromise = fspromise.readdir(pathFolder, {withFileTypes: true});
filesPromise.then(function(files){
    for (const file of files) {
        if (file.isFile()) {
            let fileData = [];
            let fileExt = path.extname(file.name);
            fileData.push(path.basename(file.name, fileExt));
            fileData.push(fileExt.substring(1));
            let pathName = path.join('03-files-in-folder', 'secret-folder', file.name);
            fs.stat(pathName, (err, stats) => {
                fileData.push(formatBytes(stats.size));
                console.log(fileData.join(' - '));
            });
            
        }
    }
});

function formatBytes(bytes) {
    const sizes = ['b', 'kb', 'mb', 'gb', 'tb'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(3)) + sizes[i];
}
