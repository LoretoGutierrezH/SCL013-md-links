const indexFunctions = require('./cli');
const [, , ...arguments] = process.argv;

//console.log(arguments[2], arguments[3]);

const filePath = process.argv[2];


//después esto hay que transformarlo en mdLinks(path, options) para versión API;
indexFunctions.mdLinks(filePath, arguments);

//esto debería ser un condicional:
// if (arguments[2]!== undefined) --> usar esa ruta, else: usar la ruta que se pasa como argumento al llamar a la función



