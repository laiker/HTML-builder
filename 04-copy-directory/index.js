const fspromise = require('fs/promises');
const path = require('path');
const directorySourceName = 'files';
const directoryTargetName = 'files-copy';
const pathFolderSource = path.join(__dirname, directorySourceName);
const pathFolderTarget = path.join(__dirname, directoryTargetName);
const removePromise = fspromise.rm(pathFolderTarget, {'recursive': true, 'force' : true});
removePromise.then(function(){
    const mkdirpromise = fspromise.mkdir(pathFolderTarget, {'recursive': true});
    mkdirpromise.then(function(){
        const filesPromise = fspromise.readdir(pathFolderSource, {withFileTypes: true});
        filesPromise.then(function(files){
            for (const entity of files) {
                createFilesRecursively(entity);
            }
        });
    });
});

function createFilesRecursively(entity) {
    createEntity = function(entity, directoryPath = []) {
        let pathEntity = path.join(pathFolderSource, ...directoryPath, entity.name);
        let pathEntityTarget = path.join(pathFolderTarget, ...directoryPath, entity.name);
        if (entity.isFile()) {
            fspromise.copyFile(pathEntity, pathEntityTarget);
        }
        if (entity.isDirectory()) {
            fspromise.mkdir(pathEntityTarget, {'recursive': true}).then(function(){
                directoryPath.push(entity.name);
                const mkdirPromise = fspromise.readdir(pathEntity, {withFileTypes: true});
                mkdirPromise.then(function(files){
                    for (const entity of files) {
                        createEntity(entity, directoryPath);
                    }
                });
            });
            
        }
    }

    createEntity(entity);
}