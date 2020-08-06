const indexFunctions = require('./cli');
const [, , ...arguments] = process.argv;

const filePath = process.argv[2];

//después esto hay que transformarlo en mdLinks(path, options) para versión API;
indexFunctions.mdLinks(filePath, arguments);
