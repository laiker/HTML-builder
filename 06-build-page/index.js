const fs = require('fs');
const fspromise = require('fs/promises');
const path = require('path');
const directoryTargetFolderName = 'project-dist';
const pathFolderCssSource = path.join(__dirname, 'styles');
const pathFileTargetDirectory = path.join(__dirname, directoryTargetFolderName);
const pathFileTargetStylesFile =  path.join(pathFileTargetDirectory, 'style.css');
const pathFolderAssetsSource = path.join(__dirname, 'assets');
const pathFolderAssetsTarget = path.join(pathFileTargetDirectory, 'assets');
const templatePath = path.join(__dirname, 'template.html');
const componentPath = path.join(__dirname, 'components');
const templateFileTarget = path.join(pathFileTargetDirectory, 'index.html');

const removePromise = fspromise.rm(pathFileTargetDirectory, {'recursive': true, 'force' : true});
removePromise.then(function(){
    fspromise.mkdir(pathFileTargetDirectory).then(function(){
        createStylesBundle(pathFolderCssSource, pathFileTargetStylesFile, '.css');
        createAssets(pathFolderAssetsSource, pathFolderAssetsTarget);
        updateTemplateSections(templatePath, componentPath, templateFileTarget);
    });
});


function createStylesBundle(sourceFolder, pathTarget, extName, ) {
    const filesPromise = fspromise.readdir(sourceFolder, {withFileTypes: true});
    filesPromise.then(function(files){
        for (const entity of files) {
            let pathEntitySource = path.join(sourceFolder, entity.name);
            if (entity.isFile()) {
                if (path.extname(entity.name) === extName) {
                    updateBundleData(pathEntitySource, pathTarget);
                }
            }
        }
    });
}

function updateBundleData(fileSourcePath, fileTargetPath) {
    const readableStream = fs.createReadStream(fileSourcePath);
    const writableStream = fs.createWriteStream(fileTargetPath, {flags: 'as'});
    readableStream.on('data', function (chunk) {
        writableStream.write(chunk.toString() + '\n');
    });
}


function createAssets(sourceFolder, targetFolder) {
    const mkdirpromise = fspromise.mkdir(targetFolder, {'recursive': true});
    mkdirpromise.then(function(){
        const filesPromise = fspromise.readdir(sourceFolder, {withFileTypes: true});
        filesPromise.then(function(files){
            for (const entity of files) {
                createFilesRecursively(entity, sourceFolder, targetFolder);
            }
        });
    });
}

function createFilesRecursively(entity, sourceFolder, targetFolder) {
    const pathFolderSource = sourceFolder;
    const pathFolderTarget = targetFolder;

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

function updateTemplateSections(templateFile, sourceFolder, templateFileTarget) {
    let sections = [];
    const filesPromise = fspromise.readdir(sourceFolder, {withFileTypes: true});
    filesPromise.then(async function(files){
        for (const entity of files) {
            sections.push(path.basename(entity.name, path.extname(entity.name)));
        }
    }).then(function(){
        let templateChunks = [];
        const readableStreamTemplate = fs.createReadStream(templateFile);
        readableStreamTemplate.on('data', function (chunk) {
            templateChunks = chunk.toString().split('\n');
        });
    
        
        readableStreamTemplate.on('end', async function () {
            let m; 
            let regex = new RegExp('({{'+sections.join('}})|({{')+'}})', 'gi');
            for (i = 0; i < templateChunks.length; i++) {
                let matches = [];
                while ((m = regex.exec(templateChunks[i])) !== null) {
                    m.forEach((match, groupIndex) => {
                        if (match !== undefined && matches.indexOf(match) === -1) {
                            matches.push(match);
                        }
                    });
                }
                if (matches.length > 0) {
                    for (j = 0; j < matches.length; j++) {
                        sectionName = matches[j].substring(2, matches[j].length - 2)
                        let sectionPath = path.join(sourceFolder, sectionName + '.html');
                        templateChunks[i] = templateChunks[i].replace(matches[j], await getData(sectionPath));
                    }
                }
            }

            const writableStreamTemplate = fs.createWriteStream(templateFileTarget);
            writableStreamTemplate.write(templateChunks.join('\n'));
        });
    });
}

function getData(file) {
    let data = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(file)
            .on('error', error => {
                reject(error);
            })
            .on('data', (row) => {
                data.push(row.toString());
            })
            .on('end', () => {
                resolve(data);
            });
    });
}
