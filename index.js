const colors = require('colors');
const fs = require('fs');

const readMD = (path) => {
  fs.readFile(path, (err, data) => {
    if (err) {
      console.log(err)
    }
    console.log('Archivo leído'.green);
    console.log(data.toString());
    return data;
  })
}

file = {};
file.readMD = readMD;


module.exports = file;