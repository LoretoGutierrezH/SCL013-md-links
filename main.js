const indexFunctions = require('./cli');
const [, , ...arguments] = process.argv;

//console.log(arguments[2], arguments[3]);

const filePath = process.argv[2];


//después esto hay que transformarlo en mdLinks(path, options) para versión API;
indexFunctions.mdLinks(filePath, arguments);




