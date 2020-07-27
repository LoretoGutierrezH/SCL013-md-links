const indexFunctions = require('./index');
const arguments = process.argv;





//console.log(arguments[2], arguments[3]);

const filePath = arguments[2];

//después esto hay que transformarlo en mdLinks(path, options) para versión API;
indexFunctions.readMD(filePath);

//esto debería ser un condicional:
// if (arguments[2]!== undefined) --> usar esa ruta, else: usar la ruta que se pasa como argumento al llamar a la función

 

//PROBANDO SINTÁXIS DE PROMESAS
/* const validateURL = (url) => {
  return new Promise((resolve, reject) => {
    setTimeout((actualURL) => {
      resolve(`URL ${actualURL} resuelta correctamente.`);
    }, 1500, url)
  }).then(data => {
    console.log(`URL ${actualURL} resuelta correctamente`);
    console.log(data);
  })
  .catch(error => {
    console.log(error);
  })
}

console.log(validateURL('www.google.com')); */

