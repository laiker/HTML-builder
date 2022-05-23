const fs = require('fs');
const fspromise = require('fs/promises');
const path = require('path');
const directorySourceName = 'styles';
const directoryTargetName = 'project-dist';
const pathFolderSource = path.join(__dirname, directorySourceName);
const pathFileTarget = path.join(__dirname, directoryTargetName, 'bundle.css');

const removePromise = fspromise.rm(pathFileTarget, {'recursive': true, 'force' : true});
    removePromise.then(function(){
    const filesPromise = fspromise.readdir(pathFolderSource, {withFileTypes: true});
    filesPromise.then(function(files){
        for (const entity of files) {
            let pathEntitySoruce = path.join(__dirname, directorySourceName, entity.name);
            if (entity.isFile()) {
                if (path.extname(entity.name) == '.css') {
                    updateBundleData(pathEntitySoruce, pathFileTarget);
                }
            }
            if (entity.isDirectory()) {
                fspromise.mkdir(pathEntityTarget, {'recursive': true});
            }
        }
    });
});

function updateBundleData(fileSourcePath, fileTargetPath) {
    const readableStream = fs.createReadStream(fileSourcePath);
    const writableStream = fs.createWriteStream(fileTargetPath, {flags:'as'});
    readableStream.on('data', function (chunk) {
        writableStream.write(chunk.toString() + '\n');
    });
}



