const fs = require('fs');
const path = require('path');
const { stdin, stdout } = require('process');
const pathFile = path.join('02-write-file', 'text.txt');
const writableStream = fs.createWriteStream(pathFile);

stdout.write('Приветствую! Давайте запишем в файл:\n');
stdin.on('data', function(data){
    if (data.indexOf('exit') === -1)  {
        writableStream.write(data);
    } else {
        process.exit();
    }
});

process.on('SIGINT', function(){
    process.exit();
});

process.on('exit', code => {
    stdout.write('\nПрощай!\n');
});