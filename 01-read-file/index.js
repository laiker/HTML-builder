const fs = require('fs');
const path = require('path');
const pathFile = path.join('01-read-file', 'text.txt');
const readableStream = fs.createReadStream(pathFile);
const data = [];

readableStream.on("data", function (chunk) {
    data.push(chunk.toString());
});

readableStream.on("end", function () {
    console.log(data.join(''));
});
